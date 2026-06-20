import { neon } from "@neondatabase/serverless";

type CustomerInput = {
  name?: string;
  phone?: string;
  telegram?: string;
};

type OrderInput = CustomerInput & {
  contactMethod?: string;
  deliveryMethod?: string;
  itemsJson: string;
  total?: string;
};

type BotStartInput = {
  chatId: number;
  firstName?: string;
  lastName?: string;
  telegram?: string;
  userId?: number;
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  return databaseUrl ? neon(databaseUrl) : null;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function ensureSchema() {
  const sql = getSql();

  if (!sql) return null;

  await sql`
    CREATE TABLE IF NOT EXISTS app_sale_customers (
      id BIGSERIAL PRIMARY KEY,
      identity_key TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      telegram TEXT,
      orders_count INTEGER NOT NULL DEFAULT 0,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_sale_orders (
      id BIGSERIAL PRIMARY KEY,
      customer_identity_key TEXT NOT NULL,
      customer_name TEXT,
      phone TEXT,
      telegram TEXT,
      contact_method TEXT,
      delivery_method TEXT,
      items_json TEXT NOT NULL,
      total TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_sale_bot_starts (
      chat_id BIGINT PRIMARY KEY,
      telegram_user_id BIGINT,
      first_name TEXT,
      last_name TEXT,
      telegram TEXT,
      first_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  return sql;
}

function customerIdentity({ phone, telegram }: CustomerInput) {
  if (telegram?.trim()) return `telegram:${telegram.trim().toLowerCase()}`;
  if (phone?.trim()) return `phone:${phone.replace(/\D/g, "")}`;

  return "";
}

export async function recordOrder(order: OrderInput) {
  const identityKey = customerIdentity(order);

  if (!identityKey) return;

  const sql = await ensureSchema();
  if (!sql) return;

  await sql`
    INSERT INTO app_sale_customers (identity_key, name, phone, telegram, orders_count)
    VALUES (${identityKey}, ${order.name ?? ""}, ${order.phone ?? ""}, ${order.telegram ?? ""}, 1)
    ON CONFLICT (identity_key) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      telegram = EXCLUDED.telegram,
      orders_count = app_sale_customers.orders_count + 1,
      last_seen_at = NOW()
  `;

  await sql`
    INSERT INTO app_sale_orders (
      customer_identity_key, customer_name, phone, telegram, contact_method,
      delivery_method, items_json, total
    ) VALUES (
      ${identityKey}, ${order.name ?? ""}, ${order.phone ?? ""}, ${order.telegram ?? ""},
      ${order.contactMethod ?? ""}, ${order.deliveryMethod ?? ""}, ${order.itemsJson}, ${order.total ?? ""}
    )
  `;
}

export async function recordBotStart(start: BotStartInput) {
  const sql = await ensureSchema();
  if (!sql) return;

  await sql`
    INSERT INTO app_sale_bot_starts (chat_id, telegram_user_id, first_name, last_name, telegram)
    VALUES (${start.chatId}, ${start.userId ?? null}, ${start.firstName ?? ""}, ${start.lastName ?? ""}, ${start.telegram ?? ""})
    ON CONFLICT (chat_id) DO UPDATE SET
      telegram_user_id = EXCLUDED.telegram_user_id,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      telegram = EXCLUDED.telegram,
      last_started_at = NOW()
  `;
}

export async function getAdminDashboard() {
  const sql = await ensureSchema();
  if (!sql) return null;

  const [orders, customers, starts, botStarts] = await Promise.all([
    sql`
      SELECT id, customer_name, phone, telegram, contact_method, delivery_method, items_json, total, created_at
      FROM app_sale_orders
      ORDER BY created_at DESC
      LIMIT 50
    `,
    sql`SELECT COUNT(*)::INTEGER AS count FROM app_sale_customers`,
    sql`SELECT COUNT(*)::INTEGER AS count FROM app_sale_bot_starts`,
    sql`
      SELECT chat_id, telegram_user_id, first_name, last_name, telegram, first_started_at, last_started_at
      FROM app_sale_bot_starts
      ORDER BY last_started_at DESC
      LIMIT 50
    `,
  ]);

  return {
    customers: Number(customers[0]?.count ?? 0),
    botStarts,
    orders,
    starts: Number(starts[0]?.count ?? 0),
  };
}
