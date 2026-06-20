# appsale store

Каталог техники с быстрым заказом через Telegram.

Проект создан для реального Telegram/VK-магазина appsale store:

- Telegram: https://t.me/appsale_store
- VK: https://vk.com/appsale_store

## Концепция

appsale store — премиальный каталог техники в стиле Apple Premium Minimalism: чистый светлый интерфейс, много воздуха, крупная типографика, спокойная подача товаров и быстрый контакт через Telegram.

## Что реализовано

- Главный экран в фирменном стиле appsale store.
- Каталог техники.
- Категории: iPhone, AirPods, Dyson, Apple Watch, под заказ.
- Карточки товаров с ценой, версией, цветом, состоянием и статусом.
- Фильтрация по категориям.
- Форма заявки на конкретный товар.
- Отправка заявки в Telegram через API route `/api/order`.
- Ссылки на Telegram и VK.
- Адаптация под ПК и мобильные экраны.

## Бренд-стиль

- Основной фон: `#F3F3F3`
- Дополнительный фон: `#E8E8E8`
- Основной текст: `#111111`
- Вторичный текст: `#7A7A7A`
- Типографика: Apple-like system font stack, Inter, Helvetica Neue
- Атмосфера: Apple.com, Apple Store, premium tech boutique

## Технологии

- Next.js
- React
- TypeScript
- CSS
- API Routes
- Telegram Bot API
- Vercel

## Переменные окружения

Создайте файл `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Файл `.env.local` нельзя выкладывать на GitHub.

## Локальный запуск

```bash
npm install
npm run dev
```

Если PowerShell блокирует `npm`, используйте:

```powershell
npm.cmd run dev
```

## Обновление цен

Ежедневное обновление цен из текстового прайса поставщика описано в [PRICE_IMPORT.md](./PRICE_IMPORT.md).

Коротко:

```powershell
npm.cmd run prices:update -- --markup 10000
```

Команда обновляет `app/data/price-overrides.json`. Если товара или точной комплектации нет в прайсе, на сайте остается `цена по запросу`.

## Следующие шаги

- Подключить реальный Telegram-бот.
- Добавить админку для управления товарами.
- Добавить статусы: в наличии, бронь, продано, под заказ.
- Подготовить Telegram Mini App режим.
- Подключить базу данных для постоянного хранения каталога.
- Добавить учет заявок в CRM.
