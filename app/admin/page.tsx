"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

type BotStart = {
  chat_id: string;
  first_name: string;
  first_started_at: string;
  last_name: string;
  last_started_at: string;
  telegram: string;
  telegram_user_id: string;
};

type Order = {
  created_at: string;
  customer_name: string;
  delivery_method: string;
  id: number;
  items_json: string;
  order_number: string;
  phone: string;
  telegram: string;
  total: string;
};

type Dashboard = {
  botStarts: BotStart[];
  customers: number;
  orders: Order[];
  starts: number;
};

type OrderItem = {
  color?: string;
  name?: string;
  qty?: number;
  sim?: string;
  storage?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function parseOrderItems(value: string) {
  try {
    return JSON.parse(value || "[]") as OrderItem[];
  } catch {
    return [];
  }
}

function formatOrderItems(items: OrderItem[]) {
  if (!items.length) return "Состав заказа не указан";

  return items.map((item) => `${item.name ?? "Товар"} ${item.storage ?? ""} ${item.color ?? ""} x${item.qty ?? 1}`.trim()).join(", ");
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");

  const loadDashboard = useCallback(async () => {
    const response = await fetch("/api/admin/dashboard", { cache: "no-store" });

    if (response.ok) {
      setDashboard((await response.json()) as Dashboard);
      setError("");
    } else {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setDashboard(null);
      setError(data.message ?? "Не удалось загрузить данные.");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/admin/login", {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "Не удалось выполнить вход.");
      setIsLoading(false);
      return;
    }

    setPassword("");
    await loadDashboard();
  }

  if (isLoading && !dashboard && !error) {
    return (
      <main className="adminPage">
        <p>Загрузка...</p>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="adminPage adminLoginPage">
        <form className="adminLogin" onSubmit={handleLogin}>
          <span>appsale store</span>
          <h1>Админка</h1>
          <p>Клиенты, запуски Mini App и заказы.</p>
          <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} placeholder="Пароль" required type="password" value={password} />
          <button disabled={isLoading} type="submit">
            Войти
          </button>
          {error ? <small>{error}</small> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <span>appsale store</span>
          <h1>Клиенты и заказы</h1>
        </div>
        <button onClick={loadDashboard} type="button">
          Обновить
        </button>
      </header>

      <section className="adminMetrics">
        <article>
          <span>Клиенты</span>
          <strong>{dashboard.customers}</strong>
        </article>
        <article>
          <span>Запуски бота</span>
          <strong>{dashboard.starts}</strong>
        </article>
        <article>
          <span>Заказы</span>
          <strong>{dashboard.orders.length}</strong>
        </article>
      </section>

      <section className="adminOrders">
        <div className="adminSectionHead">
          <h2>Последние заказы</h2>
          <span>{dashboard.orders.length} в истории</span>
        </div>
        {dashboard.orders.length ? (
          dashboard.orders.map((order) => {
            const items = parseOrderItems(order.items_json);

            return (
              <article className="adminOrder" key={order.id}>
                <div>
                  <strong>{order.order_number ? `#${order.order_number}` : `#${order.id}`}</strong>
                  <span>{order.customer_name || "Клиент"}</span>
                  <span>{order.phone || order.telegram || "Контакт не указан"}</span>
                </div>
                <div>
                  <span>{formatOrderItems(items)}</span>
                  <small>{order.delivery_method || "Получение не выбрано"} · {formatDate(order.created_at)}</small>
                </div>
                <strong>{order.total || "Цена по запросу"}</strong>
              </article>
            );
          })
        ) : (
          <p className="adminEmpty">Заказов пока нет. После первого оформления они появятся здесь.</p>
        )}
      </section>

      <section className="adminOrders">
        <div className="adminSectionHead">
          <h2>Запуски бота</h2>
          <span>{dashboard.botStarts.length} в истории</span>
        </div>
        {dashboard.botStarts.length ? (
          dashboard.botStarts.map((start) => {
            const name = [start.first_name, start.last_name].filter(Boolean).join(" ") || "Пользователь Telegram";

            return (
              <article className="adminOrder" key={start.chat_id}>
                <div>
                  <strong>{name}</strong>
                  <span>{start.telegram || `ID: ${start.telegram_user_id || start.chat_id}`}</span>
                </div>
                <div>
                  <span>Последний запуск: {formatDate(start.last_started_at)}</span>
                </div>
              </article>
            );
          })
        ) : (
          <p className="adminEmpty">Новых запусков пока нет. Нажатие /start у бота добавит пользователя в список.</p>
        )}
      </section>
    </main>
  );
}
