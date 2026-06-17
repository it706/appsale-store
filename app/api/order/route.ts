import { NextResponse } from "next/server";

type OrderPayload = {
  color?: string;
  comment?: string;
  contactMethod?: string;
  deliveryAddress?: string;
  deliveryMethod?: string;
  items?: Array<{ color?: string; name?: string; price?: string; qty?: number; sim?: string; storage?: string }>;
  name?: string;
  phone?: string;
  price?: string;
  product?: string;
  sdekCity?: string;
  sdekPoint?: string;
  sim?: string;
  storage?: string;
  telegram?: string;
  total?: string;
};

function compactLine(label: string, value?: string) {
  return value?.trim() ? `${label}: ${value.trim()}` : "";
}

function getItemDetails(item: NonNullable<OrderPayload["items"]>[number]) {
  return [item.storage, item.color, item.sim].filter(Boolean).join(" · ");
}

function getPhoneDigits(value?: string) {
  return value?.replace(/\D/g, "") ?? "";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as OrderPayload | null;
  const phoneDigits = getPhoneDigits(payload?.phone);

  if (!payload?.name || !payload?.product || (!payload.phone && !payload.telegram)) {
    return NextResponse.json({ message: "Заполните имя и контакт для связи." }, { status: 400 });
  }

  if (payload.phone && phoneDigits.length !== 11) {
    return NextResponse.json({ message: "Номер телефона должен состоять ровно из 11 цифр." }, { status: 400 });
  }

  if (payload.deliveryMethod === "Доставка по городу" && !payload.deliveryAddress?.trim()) {
    return NextResponse.json({ message: "Укажите адрес доставки по городу." }, { status: 400 });
  }

  if (payload.deliveryMethod === "СДЭК по России" && (!payload.sdekCity?.trim() || !payload.sdekPoint?.trim())) {
    return NextResponse.json({ message: "Для СДЭК укажите город получения и адрес ПВЗ." }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ message: "Telegram пока не настроен. Напишите нам напрямую." }, { status: 503 });
  }

  const cartLines = payload.items?.length
    ? [
        "Корзина:",
        ...payload.items.map((item, index) => {
          const details = getItemDetails(item);
          const detailsText = details ? ` (${details})` : "";
          const qty = item.qty ?? 1;
          const price = item.price ? ` · ${item.price}` : "";

          return `${index + 1}. ${item.name ?? "Товар"}${detailsText} x${qty}${price}`;
        }),
      ]
    : [];

  const message = [
    "Новая заявка AppSale Store",
    "",
    compactLine("Товар", payload.product),
    compactLine("Память/версия", payload.storage),
    compactLine("Цвет", payload.color),
    compactLine("Версия", payload.sim),
    compactLine("Цена", payload.price),
    compactLine("Итого", payload.total),
    ...cartLines,
    "",
    compactLine("Клиент", payload.name),
    compactLine("Телефон", payload.phone),
    compactLine("Telegram", payload.telegram),
    compactLine("Предпочтительная связь", payload.contactMethod),
    compactLine("Получение", payload.deliveryMethod),
    compactLine("Адрес доставки", payload.deliveryAddress),
    compactLine("Город СДЭК", payload.sdekCity),
    compactLine("ПВЗ СДЭК", payload.sdekPoint),
    compactLine("Комментарий", payload.comment),
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Telegram не ответил. Напишите нам напрямую." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
