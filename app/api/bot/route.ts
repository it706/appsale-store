import { NextResponse } from "next/server";

type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number;
    };
    text?: string;
  };
};

const catalogUrl = process.env.MINIAPP_URL ?? "https://appsale-store.vercel.app/";
const managerUrl = "https://t.me/evgenypulkov";

const startText = [
  "Добро пожаловать в appsale store.",
  "",
  "Мы помогаем выбрать оригинальную технику Apple и другие устройства под ваши задачи: iPhone, AirPods, iPad, Apple Watch, Dyson и аксессуары.",
  "",
  "В каталоге можно выбрать модель, цвет, память и версию, добавить товар в корзину и оформить заказ прямо в Telegram.",
  "",
  "После заявки мы свяжемся с вами для уточнения деталей, наличия и способа получения.",
  "",
  "Техника Apple. Эстетика. Выбор.",
].join("\n");

async function sendStartMessage(chatId: number, botToken: string) {
  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    body: JSON.stringify({
      chat_id: chatId,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Открыть каталог",
              web_app: {
                url: catalogUrl,
              },
            },
          ],
          [
            {
              text: "Написать менеджеру",
              url: managerUrl,
            },
          ],
        ],
      },
      text: startText,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export async function POST(request: Request) {
  const botToken = process.env.MINIAPP_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ message: "MINIAPP_BOT_TOKEN is not configured." }, { status: 503 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text?.trim();

  if (!chatId || text !== "/start") {
    return NextResponse.json({ ok: true });
  }

  const response = await sendStartMessage(chatId, botToken);

  if (!response.ok) {
    return NextResponse.json({ message: "Telegram did not accept the start message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
