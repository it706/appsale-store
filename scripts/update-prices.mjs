import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];

  return fallback;
}

const inputPath = resolve(readArg("--input", "supplier-prices.txt"));
const outputPath = resolve("app/data/price-overrides.json");
const isDryRun = args.includes("--dry-run");

const catalog = {
  "iPhone Air": {
    colors: ["Light Gold", "Sky Blue", "Cloud White", "Space Black"],
    sims: ["Dual eSIM"],
    storages: ["256GB", "512GB", "1TB"],
  },
  "iPhone 17": {
    colors: ["Black", "White", "Sage", "Mist Blue", "Lavender"],
    sims: ["Dual eSIM", "Nano-SIM + eSIM"],
    storages: ["256GB", "512GB"],
  },
  "iPhone 17e": {
    colors: ["Black", "White", "Soft Pink"],
    sims: ["Dual eSIM", "Nano-SIM + eSIM"],
    storages: ["256GB", "512GB"],
  },
  "iPhone 17 Pro": {
    colors: ["Silver", "Deep Blue", "Cosmic Orange"],
    sims: ["Dual eSIM", "Nano-SIM + eSIM"],
    storages: ["256GB", "512GB", "1TB"],
  },
  "iPhone 17 Pro Max": {
    colors: ["Silver", "Deep Blue", "Cosmic Orange"],
    sims: ["Dual eSIM", "Nano-SIM + eSIM"],
    storages: ["256GB", "512GB", "1TB", "2TB"],
  },
  "iPhone 16": {
    colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    sims: ["Nano-SIM + eSIM"],
    storages: ["128GB", "256GB", "512GB"],
  },
  "iPhone 16 Plus": {
    colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    sims: ["Nano-SIM + eSIM"],
    storages: ["128GB", "256GB", "512GB"],
  },
  "iPhone 16e": {
    colors: ["Black", "White"],
    sims: ["Nano-SIM + eSIM"],
    storages: ["128GB", "256GB"],
  },
  "iPhone 16 Pro": {
    colors: ["Black", "White", "Desert", "Natural"],
    sims: ["Dual Nano-SIM", "Nano-SIM + eSIM"],
    storages: ["128GB", "256GB", "512GB", "1TB"],
  },
  "iPhone 16 Pro Max": {
    colors: ["Black", "White", "Desert", "Natural"],
    sims: ["Dual Nano-SIM", "Nano-SIM + eSIM"],
    storages: ["256GB", "512GB", "1TB"],
  },
  "iPhone 15": {
    colors: ["Black", "Blue", "Green", "Pink", "Yellow"],
    sims: ["Nano-SIM + eSIM"],
    storages: ["128GB", "256GB", "512GB"],
  },
  "iPhone 15 Plus": {
    colors: ["Black", "Blue", "Green", "Pink", "Yellow"],
    sims: ["Nano-SIM + eSIM"],
    storages: ["128GB", "256GB", "512GB"],
  },
  "MacBook Neo": {
    colors: ["Indigo", "Blush", "Silver", "Citrus"],
    sims: [],
    storages: ["256GB", "512GB"],
  },
  "iPad 11 A16 (2025)": {
    colors: ["Silver", "Blue", "Pink", "Yellow"],
    sims: ["Wi-Fi", "LTE"],
    storages: ["128GB", "256GB"],
  },
  "AirPods Max USB-C (2024)": {
    colors: ["Midnight", "Purple", "Starlight", "Blue", "Orange"],
    sims: [""],
    storages: [""],
  },
  "AirPods Max 2 USB-C (2026)": {
    colors: ["Midnight", "Purple", "Starlight", "Blue", "Orange"],
    sims: [""],
    storages: [""],
  },
  "AirPods Pro 3": { colors: [""], sims: [""], storages: [""] },
  "AirPods Pro 2": { colors: [""], sims: [""], storages: [""] },
  "AirPods 4 (Без шумоподавления)": { colors: [""], sims: [""], storages: [""] },
  "AirPods 4 ANC (С шумоподавлением)": { colors: [""], sims: [""], storages: [""] },
};

const markupByModel = {
  airpods: 2000,
  ipad: 3000,
  iphone15: 3000,
  iphone16: 3500,
  iphone17: 4000,
  macbookNeo: 4000,
};

function normalizeText(value) {
  return value.toLowerCase().replaceAll("ё", "е").trim();
}

function parseModel(value) {
  const text = normalizeText(value);

  if (/^airpods\s+max\s+2\b/.test(text) || /^air\s*pods\s+max\s+2\b/.test(text)) return "AirPods Max 2 USB-C (2026)";
  if (/^airpods\s+max\b/.test(text) || /^air\s*pods\s+max\b/.test(text)) return "AirPods Max USB-C (2024)";
  if (/^airpods\s+pro\s+3\b/.test(text)) return "AirPods Pro 3";
  if (/^airpods\s+pro\s+2\b/.test(text)) return "AirPods Pro 2";
  if (/^airpods\s+4\s+(?:anc|с\s*шумоподавлением)\b/.test(text)) return "AirPods 4 ANC (С шумоподавлением)";
  if (/^airpods\s+4\b/.test(text)) return "AirPods 4 (Без шумоподавления)";
  if (/^17\s+pro\s+max\b/.test(text)) return "iPhone 17 Pro Max";
  if (/^17\s+pro\b/.test(text)) return "iPhone 17 Pro";
  if (/^17e\b/.test(text)) return "iPhone 17e";
  if (/^17\b/.test(text)) return "iPhone 17";
  if (/^air\b/.test(text)) return "iPhone Air";
  if (/^16\s+plus\b/.test(text)) return "iPhone 16 Plus";
  if (/^16\s+pr.*ma/i.test(text)) return "iPhone 16 Pro Max";
  if (/^16\s+pr/i.test(text)) return "iPhone 16 Pro";
  if (/^16e\b/.test(text)) return "iPhone 16e";
  if (/^16\b/.test(text)) return "iPhone 16";
  if (/^15\s+plus\b/i.test(text)) return "iPhone 15 Plus";
  if (/^15\s+pr/i.test(text)) return "iPhone 15 Pro";
  if (/^15\b/.test(text)) return "iPhone 15";
  if (/\bneo\b/i.test(text)) return "MacBook Neo";
  if (/^ipad\s+11\b/.test(text)) return "iPad 11 A16 (2025)";

  return "";
}

function parseStorage(value) {
  const text = normalizeText(value);
  const tb = text.match(/\b([12])\s*tb\b/i);
  if (tb) return `${tb[1]}TB`;

  const gb = text.match(/\b(128|256|512)(?:\s*gb)?\b/i);
  if (gb) return `${gb[1]}GB`;

  return "";
}

function parseSim(value) {
  const text = normalizeText(value);

  if (/\b(?:2sim|2\s*sim|dual\s*sim)\b/.test(text)) return "Dual Nano-SIM";

  if (/\b(?:1sim|1\s*sim|nano|наносим|nano-sim)\b/.test(text)) return "Nano-SIM + eSIM";
  if (/\b(?:esim|e-sim)\b/.test(text)) return "Dual eSIM";
  if (/\bwi-?fi\b/.test(text)) return "Wi-Fi";
  if (/\blte\b/.test(text)) return "LTE";

  return "";
}

function parseColor(value, model) {
  const text = normalizeText(value);
  const has = (...words) => words.some((word) => text.includes(word));

  if (model === "iPhone Air") {
    if (has("black", "space black")) return "Space Black";
    if (has("white", "cloud white")) return "Cloud White";
    if (has("blue", "sky blue")) return "Sky Blue";
    if (has("gold", "light gold")) return "Light Gold";
  }

  if (model === "iPhone 17 Pro" || model === "iPhone 17 Pro Max") {
    if (has("silver", "сереб")) return "Silver";
    if (has("blue", "deep blue")) return "Deep Blue";
    if (has("orange", "cosmic orange", "оранж")) return "Cosmic Orange";
  }

  if (model === "iPhone 17") {
    if (has("black")) return "Black";
    if (has("white")) return "White";
    if (has("sage")) return "Sage";
    if (has("blue", "mist blue")) return "Mist Blue";
    if (has("lavender", "lavanda", "лаванда")) return "Lavender";
  }

  if (model === "iPhone 17e" || model === "iPhone 16e") {
    if (has("black")) return "Black";
    if (has("white")) return "White";
    if (model === "iPhone 17e" && has("soft pink", "pink")) return "Soft Pink";
  }

  if (model === "iPhone 16" || model === "iPhone 16 Plus") {
    if (has("black")) return "Black";
    if (has("white")) return "White";
    if (has("pink")) return "Pink";
    if (has("teal")) return "Teal";
    if (has("ultramarine", "blue")) return "Ultramarine";
  }

  if (model === "iPhone 16 Pro" || model === "iPhone 16 Pro Max") {
    if (has("black")) return "Black";
    if (has("white")) return "White";
    if (has("natural")) return "Natural";
    if (has("desert")) return "Desert";
  }

  if (model === "iPhone 15" || model === "iPhone 15 Plus") {
    if (has("black")) return "Black";
    if (has("blue")) return "Blue";
    if (has("green")) return "Green";
    if (has("pink")) return "Pink";
    if (has("yellow")) return "Yellow";
  }

  if (model === "MacBook Neo") {
    if (has("indigo")) return "Indigo";
    if (has("blush")) return "Blush";
    if (has("silver")) return "Silver";
    if (has("citrus")) return "Citrus";
  }

  if (model === "iPad 11 A16 (2025)") {
    if (has("silver")) return "Silver";
    if (has("blue")) return "Blue";
    if (has("pink")) return "Pink";
    if (has("yellow")) return "Yellow";
  }

  if (model === "AirPods Max USB-C (2024)" || model === "AirPods Max 2 USB-C (2026)") {
    if (has("midnight", "black", "миднайт", "черн")) return "Midnight";
    if (has("purple", "пурп", "фиолет")) return "Purple";
    if (has("starlight", "старлайт")) return "Starlight";
    if (has("blue", "син")) return "Blue";
    if (has("orange", "оранж")) return "Orange";
  }

  return "";
}

function parsePrice(value) {
  const match = value.match(/-\s*([\d\s.,]+)\s*$/);
  if (!match) return 0;

  const raw = match[1].replace(/\s/g, "").replace(",", ".");
  const [head, tail = ""] = raw.split(".");

  if (tail.length === 3) return Number(`${head}${tail}`);
  if (tail.length > 0) return Math.round(Number(raw) * 1000);

  return Number(head);
}

function formatRub(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function getMarkup(model) {
  if (model.includes("AirPods")) return markupByModel.airpods;
  if (model.startsWith("iPad")) return markupByModel.ipad;
  if (model.startsWith("iPhone 15")) return markupByModel.iphone15;
  if (model.startsWith("iPhone 16")) return markupByModel.iphone16;
  if (model.startsWith("iPhone 17") || model === "iPhone Air") return markupByModel.iphone17;
  if (model === "MacBook Neo") return markupByModel.macbookNeo;

  return 0;
}

function roundSellingPrice(value) {
  const tail = value % 1000;

  if (tail >= 100 && tail <= 400) return Math.ceil(value / 500) * 500;
  if (tail >= 600 && tail <= 900) return Math.ceil(value / 1000) * 1000;

  return value;
}

function makeKey({ model, storage, color, sim }) {
  return [model, storage, color, sim].join("|");
}

function parseLine(line) {
  if (!line.trim() || /^[-—–]+$/.test(line.trim())) return { skipped: true };
  if (/актив|asis/i.test(line)) return { ignored: true, reason: "актив/Asis не совпадает с новым каталогом", line };

  const model = parseModel(line);
  const storage = parseStorage(line);
  let sim = parseSim(line);
  const color = parseColor(line, model);
  const supplierPrice = parsePrice(line);
  const allowed = catalog[model];
  const isSimpleProduct = model.includes("AirPods");

  // Supplier lines without an explicit SIM type are always Nano-SIM + eSIM.
  if (!sim && allowed?.sims.includes("Nano-SIM + eSIM")) sim = "Nano-SIM + eSIM";
  else if (!sim && allowed?.sims.length === 1) sim = allowed.sims[0];

  if (!model || !supplierPrice || (!isSimpleProduct && (!storage || !color || (allowed?.sims.length && !sim)))) {
    return { ignored: true, reason: "не удалось распознать модель, память, цвет, SIM или цену", line };
  }

  if (!allowed) return { ignored: true, reason: "модели нет в каталоге", line };
  if (!allowed.storages.includes(storage)) return { ignored: true, reason: "памяти нет в карточке товара", line };
  if (!allowed.colors.includes(color)) return { ignored: true, reason: "цвета нет в карточке товара", line };
  if (allowed.sims.length && !allowed.sims.includes(sim)) return { ignored: true, reason: "SIM-версии нет в карточке товара", line };

  const markup = getMarkup(model);
  const finalPrice = roundSellingPrice(supplierPrice + markup);

  return {
    item: {
      finalPrice,
      key: makeKey({ color, model, sim, storage }),
      price: formatRub(finalPrice),
      sourceLine: line.trim(),
      markup,
      supplierPrice,
    },
  };
}

const source = readFileSync(inputPath, "utf8");
const result = {};
const ignored = [];

for (const line of source.split(/\r?\n/)) {
  const parsed = parseLine(line);

  if (parsed.skipped) continue;
  if (parsed.ignored) {
    ignored.push(parsed);
    continue;
  }

  if (parsed.item) {
    result[parsed.item.key] = {
      finalPrice: parsed.item.finalPrice,
      markup: parsed.item.markup,
      price: parsed.item.price,
      sourceLine: parsed.item.sourceLine,
      supplierPrice: parsed.item.supplierPrice,
    };
  }
}

const sortedResult = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, "ru")));

if (!isDryRun) {
  writeFileSync(outputPath, `${JSON.stringify(sortedResult, null, 2)}\n`, "utf8");
}

console.log(`${isDryRun ? "Проверка" : "Готово"}: обновлено цен ${Object.keys(sortedResult).length}.`);
console.log("Правила: AirPods +2 000 ₽, iPad +3 000 ₽, iPhone 15 +3 000 ₽, iPhone 16 +3 500 ₽, iPhone 17 и Air +4 000 ₽, MacBook Neo +4 000 ₽.");
console.log("Округление: хвост 100-400 до 500, хвост 600-900 до 1 000.");
for (const [key, item] of Object.entries(sortedResult)) {
  console.log(`- ${key}: ${formatRub(item.supplierPrice)} + ${formatRub(item.markup)} = ${item.price}`);
}
if (isDryRun) console.log("Файл цен не изменен: включен режим --dry-run.");

if (ignored.length) {
  console.log(`Игнорировано строк: ${ignored.length}.`);
  for (const item of ignored.slice(0, 20)) {
    console.log(`- ${item.reason}: ${item.line}`);
  }
  if (ignored.length > 20) console.log(`...и еще ${ignored.length - 20}`);
}
