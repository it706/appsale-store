"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import priceOverrides from "./data/price-overrides.json";

type Brand = "Apple" | "Samsung" | "Xiaomi" | "PS" | "Dyson";
type Product = {
  accent: "blue" | "orange" | "silver" | "titanium";
  brand: Brand;
  category: string;
  color: string;
  condition: string;
  description: string;
  id: number;
  name: string;
  price: string;
  sim?: string;
  status: "В наличии" | "Под заказ" | "Бронь";
  storage: string;
  imagesByColor?: Record<string, string[]>;
  size?: string;
  variantOptions?: {
    colors: string[];
    sims: string[];
    sizes?: string[];
    storages: string[];
  };
};

type CartItem = {
  key: string;
  product: Product;
  qty: number;
};

type SuccessOrder = {
  itemsCount: number;
  number: string;
  total: string;
};

type ProductSelection = {
  color: string;
  size: string;
  sim: string;
  storage: string;
};

type PriceOverride = {
  finalPrice?: number;
  price?: string;
};

type TelegramWebApp = {
  expand?: () => void;
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  ready?: () => void;
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const iphoneOptions = {
  colors: ["Silver", "Deep Blue", "Cosmic Orange"],
  sims: ["Dual eSIM", "Nano-SIM + eSIM"],
  storages: ["256GB", "512GB", "1TB"],
};

const iphoneProMaxOptions = {
  ...iphoneOptions,
  storages: ["256GB", "512GB", "1TB", "2TB"],
};

const iphone17Options = {
  ...iphoneOptions,
  colors: ["Black", "White", "Sage", "Mist Blue", "Lavender"],
  storages: ["256GB", "512GB"],
};

const iphone17eOptions = {
  colors: ["Black", "White", "Soft Pink"],
  sims: ["Dual eSIM", "Nano-SIM + eSIM"],
  storages: ["256GB", "512GB"],
};

const iphoneAirOptions = {
  ...iphoneOptions,
  colors: ["Light Gold", "Sky Blue", "Cloud White", "Space Black"],
  sims: ["Dual eSIM"],
};

const iphone16Options = {
  ...iphoneOptions,
  colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
  storages: ["128GB", "256GB", "512GB"],
  sims: ["Nano-SIM + eSIM"],
};

const iphone16PlusOptions = iphone16Options;

const iphone16eOptions = {
  colors: ["Black", "White"],
  sims: ["Nano-SIM + eSIM"],
  storages: ["128GB", "256GB"],
};

const iphone16ProOptions = {
  colors: ["Black", "White", "Desert", "Natural"],
  sims: ["Dual Nano-SIM", "Nano-SIM + eSIM"],
  storages: ["128GB", "256GB", "512GB", "1TB"],
};

const iphone16ProMaxOptions = {
  ...iphone16ProOptions,
  storages: ["256GB", "512GB", "1TB"],
};

const iphone15Options = {
  colors: ["Black", "Blue", "Green", "Pink", "Yellow"],
  sims: ["Nano-SIM + eSIM"],
  storages: ["128GB", "256GB", "512GB"],
};

const iphone15PlusOptions = iphone15Options;

const macbookNeoOptions = {
  colors: ["Indigo", "Blush", "Silver", "Citrus"],
  sims: [],
  storages: ["256GB", "512GB"],
};

const ipad11Options = {
  colors: ["Silver", "Blue", "Pink", "Yellow"],
  sims: ["Wi-Fi", "LTE"],
  storages: ["128GB", "256GB"],
};

const ipadAir8Options = {
  colors: ["Space Gray", "Starlight", "Blue", "Purple"],
  sims: ["Wi-Fi"],
  sizes: ["11 дюймов", "13 дюймов"],
  storages: ["128GB", "256GB"],
};

const airPodsMaxOptions = {
  colors: ["Midnight", "Purple", "Starlight", "Blue", "Orange"],
  sims: [],
  storages: [],
};

const appleWatchSe2Options = {
  colors: ["Midnight"],
  sims: [],
  sizes: ["40 мм", "44 мм"],
  storages: ["S/M", "M/L", "Sport Loop"],
};

const appleWatchSe3Options = {
  colors: ["Midnight", "Starlight"],
  sims: [],
  sizes: ["40 мм", "44 мм"],
  storages: ["S/M", "M/L", "Sport Loop"],
};

const appleWatchSeries11Options = {
  colors: ["Jet Black", "Space Gray", "Rose Gold", "Silver"],
  sims: [],
  sizes: ["42 мм", "46 мм"],
  storages: ["S/M", "M/L", "Sport Loop"],
};


const iphone17ProImages = {
  "Cosmic Orange": [
    "/products/iphone-17-pro-cosmic-orange-1.webp",
    "/products/iphone-17-pro-cosmic-orange-2.webp",
    "/products/iphone-17-pro-cosmic-orange-3.webp",
    "/products/iphone-17-pro-cosmic-orange-4.webp",
    "/products/iphone-17-pro-cosmic-orange-5.webp",
  ],
  "Deep Blue": [
    "/products/iphone-17-pro-deep-blue-1.webp",
    "/products/iphone-17-pro-deep-blue-2.webp",
    "/products/iphone-17-pro-deep-blue-3.webp",
    "/products/iphone-17-pro-deep-blue-4.webp",
    "/products/iphone-17-pro-deep-blue-5.webp",
  ],
  Silver: [
    "/products/iphone-17-pro-silver-1.webp",
    "/products/iphone-17-pro-silver-2.webp",
    "/products/iphone-17-pro-silver-3.webp",
    "/products/iphone-17-pro-silver-4.webp",
    "/products/iphone-17-pro-silver-5.webp",
  ],
};

const iphone17Images = {
  Black: [
    "/products/iphone-17-black-1.webp",
    "/products/iphone-17-black-2.webp",
    "/products/iphone-17-black-3.webp",
    "/products/iphone-17-black-4.webp",
    "/products/iphone-17-black-5.webp",
  ],
  White: [
    "/products/iphone-17-white-1.webp",
    "/products/iphone-17-white-2.webp",
    "/products/iphone-17-white-3.webp",
    "/products/iphone-17-white-4.webp",
    "/products/iphone-17-white-5.webp",
  ],
  Sage: [
    "/products/iphone-17-sage-1.webp",
    "/products/iphone-17-sage-2.webp",
    "/products/iphone-17-sage-3.webp",
    "/products/iphone-17-sage-4.webp",
    "/products/iphone-17-sage-5.webp",
  ],
  "Mist Blue": [
    "/products/iphone-17-mist-blue-1.webp",
    "/products/iphone-17-mist-blue-2.webp",
    "/products/iphone-17-mist-blue-3.webp",
    "/products/iphone-17-mist-blue-4.webp",
    "/products/iphone-17-mist-blue-5.webp",
  ],
  Lavender: [
    "/products/iphone-17-lavender-1.webp",
    "/products/iphone-17-lavender-2.webp",
    "/products/iphone-17-lavender-3.webp",
    "/products/iphone-17-lavender-4.webp",
    "/products/iphone-17-lavender-5.webp",
  ],
};

const iphoneAirImages = {
  "Light Gold": [
    "/products/iphone-air-light-gold-1.webp",
    "/products/iphone-air-light-gold-2.webp",
    "/products/iphone-air-light-gold-3.webp",
    "/products/iphone-air-light-gold-4.webp",
    "/products/iphone-air-light-gold-5.webp",
  ],
  "Sky Blue": [
    "/products/iphone-air-sky-blue-1.webp",
    "/products/iphone-air-sky-blue-2.webp",
    "/products/iphone-air-sky-blue-3.webp",
    "/products/iphone-air-sky-blue-4.webp",
    "/products/iphone-air-sky-blue-5.webp",
  ],
  "Cloud White": [
    "/products/iphone-air-cloud-white-1.webp",
    "/products/iphone-air-cloud-white-2.webp",
    "/products/iphone-air-cloud-white-3.webp",
    "/products/iphone-air-cloud-white-4.webp",
    "/products/iphone-air-cloud-white-5.webp",
  ],
  "Space Black": [
    "/products/iphone-air-space-black-1.webp",
    "/products/iphone-air-space-black-2.webp",
    "/products/iphone-air-space-black-3.webp",
    "/products/iphone-air-space-black-4.webp",
    "/products/iphone-air-space-black-5.webp",
  ],
};

const iphone16Images = {
  Black: [
    "/products/iphone-16-black-1.webp",
    "/products/iphone-16-black-2.webp",
    "/products/iphone-16-black-3.webp",
    "/products/iphone-16-black-4.webp",
    "/products/iphone-16-black-5.webp",
    "/products/iphone-16-black-6.webp",
  ],
  White: [
    "/products/iphone-16-white-1.webp",
    "/products/iphone-16-white-2.webp",
    "/products/iphone-16-white-3.webp",
    "/products/iphone-16-white-4.webp",
    "/products/iphone-16-white-5.webp",
    "/products/iphone-16-white-6.webp",
  ],
  Pink: [
    "/products/iphone-16-pink-1.webp",
    "/products/iphone-16-pink-2.webp",
    "/products/iphone-16-pink-3.webp",
    "/products/iphone-16-pink-4.webp",
    "/products/iphone-16-pink-5.webp",
    "/products/iphone-16-pink-6.webp",
  ],
  Teal: [
    "/products/iphone-16-teal-1.webp",
    "/products/iphone-16-teal-2.webp",
    "/products/iphone-16-teal-3.webp",
    "/products/iphone-16-teal-4.webp",
    "/products/iphone-16-teal-5.webp",
    "/products/iphone-16-teal-6.webp",
  ],
  Ultramarine: [
    "/products/iphone-16-ultramarine-1.webp",
    "/products/iphone-16-ultramarine-2.webp",
    "/products/iphone-16-ultramarine-3.webp",
    "/products/iphone-16-ultramarine-4.webp",
    "/products/iphone-16-ultramarine-5.webp",
    "/products/iphone-16-ultramarine-6.webp",
  ],
};

const iphone17eImages = {
  Black: [
    "/products/iphone-17e-black-1.webp",
    "/products/iphone-17e-black-2.webp",
    "/products/iphone-17e-black-3.webp",
    "/products/iphone-17e-black-4.webp",
  ],
  White: [
    "/products/iphone-17e-white-1.webp",
    "/products/iphone-17e-white-2.webp",
    "/products/iphone-17e-white-3.webp",
    "/products/iphone-17e-white-4.webp",
  ],
  "Soft Pink": [
    "/products/iphone-17e-soft-pink-1.webp",
    "/products/iphone-17e-soft-pink-2.webp",
    "/products/iphone-17e-soft-pink-3.webp",
    "/products/iphone-17e-soft-pink-4.webp",
  ],
};

const iphone16eImages = {
  Black: [
    "/products/iphone-16e-black-1.webp",
    "/products/iphone-16e-black-2.webp",
    "/products/iphone-16e-black-3.webp",
    "/products/iphone-16e-black-4.webp",
    "/products/iphone-16e-black-5.webp",
  ],
  White: [
    "/products/iphone-16e-white-1.webp",
    "/products/iphone-16e-white-2.webp",
    "/products/iphone-16e-white-3.webp",
    "/products/iphone-16e-white-4.webp",
    "/products/iphone-16e-white-5.webp",
  ],
};

const iphone15Images = {
  Black: [
    "/products/iphone-15-black-1.webp",
    "/products/iphone-15-black-2.webp",
    "/products/iphone-15-black-3.webp",
    "/products/iphone-15-black-4.webp",
    "/products/iphone-15-black-5.webp",
  ],
  Blue: [
    "/products/iphone-15-blue-1.webp",
    "/products/iphone-15-blue-2.webp",
    "/products/iphone-15-blue-3.webp",
    "/products/iphone-15-blue-4.webp",
    "/products/iphone-15-blue-5.webp",
  ],
  Green: [
    "/products/iphone-15-green-1.webp",
    "/products/iphone-15-green-2.webp",
    "/products/iphone-15-green-3.webp",
    "/products/iphone-15-green-4.webp",
    "/products/iphone-15-green-5.webp",
  ],
  Pink: [
    "/products/iphone-15-pink-1.webp",
    "/products/iphone-15-pink-2.webp",
    "/products/iphone-15-pink-3.webp",
    "/products/iphone-15-pink-4.webp",
    "/products/iphone-15-pink-5.webp",
  ],
  Yellow: [
    "/products/iphone-15-yellow-1.webp",
    "/products/iphone-15-yellow-2.webp",
    "/products/iphone-15-yellow-3.webp",
    "/products/iphone-15-yellow-4.webp",
    "/products/iphone-15-yellow-5.webp",
  ],
};

const macbookNeoImages = {
  Indigo: [
    "/products/macbook-neo-indigo-3.webp",
    "/products/macbook-neo-indigo-2.webp",
    "/products/macbook-neo-indigo-4.webp",
    "/products/macbook-neo-indigo-1.webp",
    "/products/macbook-neo-indigo-5.webp",
    "/products/macbook-neo-indigo-6.webp",
  ],
  Blush: [
    "/products/macbook-neo-blush-3.webp",
    "/products/macbook-neo-blush-2.webp",
    "/products/macbook-neo-blush-4.webp",
    "/products/macbook-neo-blush-1.webp",
    "/products/macbook-neo-blush-5.webp",
    "/products/macbook-neo-blush-6.webp",
  ],
  Silver: [
    "/products/macbook-neo-silver-3.webp",
    "/products/macbook-neo-silver-2.webp",
    "/products/macbook-neo-silver-4.webp",
    "/products/macbook-neo-silver-1.webp",
    "/products/macbook-neo-silver-5.webp",
    "/products/macbook-neo-silver-6.webp",
  ],
  Citrus: [
    "/products/macbook-neo-citrus-3.webp",
    "/products/macbook-neo-citrus-2.webp",
    "/products/macbook-neo-citrus-4.webp",
    "/products/macbook-neo-citrus-1.webp",
    "/products/macbook-neo-citrus-5.webp",
    "/products/macbook-neo-citrus-6.webp",
  ],
};

const iphone16ProImages = {
  Black: [
    "/products/iphone-16-pro-black-1.webp",
    "/products/iphone-16-pro-black-2.webp",
    "/products/iphone-16-pro-black-3.webp",
    "/products/iphone-16-pro-black-4.webp",
    "/products/iphone-16-pro-black-5.webp",
    "/products/iphone-16-pro-black-6.webp",
  ],
  White: [
    "/products/iphone-16-pro-white-1.webp",
    "/products/iphone-16-pro-white-2.webp",
    "/products/iphone-16-pro-white-3.webp",
    "/products/iphone-16-pro-white-4.webp",
    "/products/iphone-16-pro-white-5.webp",
    "/products/iphone-16-pro-white-6.webp",
  ],
  Desert: [
    "/products/iphone-16-pro-desert-1.webp",
    "/products/iphone-16-pro-desert-2.webp",
    "/products/iphone-16-pro-desert-3.webp",
    "/products/iphone-16-pro-desert-4.webp",
    "/products/iphone-16-pro-desert-5.webp",
    "/products/iphone-16-pro-desert-6.webp",
  ],
  Natural: [
    "/products/iphone-16-pro-natural-1.webp",
    "/products/iphone-16-pro-natural-2.webp",
    "/products/iphone-16-pro-natural-3.webp",
    "/products/iphone-16-pro-natural-4.webp",
    "/products/iphone-16-pro-natural-5.webp",
    "/products/iphone-16-pro-natural-6.webp",
  ],
};

const ipad11Images = {
  Silver: [
    "/products/ipad-11-a16-silver-1.webp",
    "/products/ipad-11-a16-silver-2.webp",
    "/products/ipad-11-a16-silver-3.webp",
  ],
  Blue: [
    "/products/ipad-11-a16-blue-1.webp",
    "/products/ipad-11-a16-blue-2.webp",
    "/products/ipad-11-a16-blue-3.webp",
  ],
  Pink: [
    "/products/ipad-11-a16-pink-1.webp",
    "/products/ipad-11-a16-pink-2.webp",
    "/products/ipad-11-a16-pink-3.webp",
  ],
  Yellow: [
    "/products/ipad-11-a16-yellow-1.webp",
    "/products/ipad-11-a16-yellow-2.webp",
    "/products/ipad-11-a16-yellow-3.webp",
  ],
};

const ipadAir8Images = {
  "Space Gray": [
    "/products/ipad-air-8-m4-space-gray-1.webp",
    "/products/ipad-air-8-m4-space-gray-2.webp",
    "/products/ipad-air-8-m4-space-gray-3.webp",
    "/products/ipad-air-8-m4-space-gray-4.webp",
  ],
  Starlight: [
    "/products/ipad-air-8-m4-starlight-1.webp",
    "/products/ipad-air-8-m4-starlight-2.webp",
    "/products/ipad-air-8-m4-starlight-3.webp",
    "/products/ipad-air-8-m4-starlight-4.webp",
  ],
  Blue: [
    "/products/ipad-air-8-m4-blue-1.webp",
    "/products/ipad-air-8-m4-blue-2.webp",
    "/products/ipad-air-8-m4-blue-3.webp",
    "/products/ipad-air-8-m4-blue-4.webp",
  ],
  Purple: [
    "/products/ipad-air-8-m4-purple-1.webp",
    "/products/ipad-air-8-m4-purple-2.webp",
    "/products/ipad-air-8-m4-purple-3.webp",
    "/products/ipad-air-8-m4-purple-4.webp",
  ],
};

const airPodsMaxImages = {
  Midnight: [
    "/products/airpods-max-midnight-1.webp",
    "/products/airpods-max-midnight-2.webp",
    "/products/airpods-max-midnight-3.webp",
    "/products/airpods-max-midnight-4.webp",
    "/products/airpods-max-midnight-5.webp",
    "/products/airpods-max-midnight-6.webp",
  ],
  Purple: [
    "/products/airpods-max-purple-1.webp",
    "/products/airpods-max-purple-2.webp",
    "/products/airpods-max-purple-3.webp",
    "/products/airpods-max-purple-4.webp",
    "/products/airpods-max-purple-5.webp",
    "/products/airpods-max-purple-6.webp",
  ],
  Starlight: [
    "/products/airpods-max-starlight-1.webp",
    "/products/airpods-max-starlight-2.webp",
    "/products/airpods-max-starlight-3.webp",
    "/products/airpods-max-starlight-4.webp",
    "/products/airpods-max-starlight-5.webp",
    "/products/airpods-max-starlight-6.webp",
  ],
  Blue: [
    "/products/airpods-max-blue-1.webp",
    "/products/airpods-max-blue-2.webp",
    "/products/airpods-max-blue-3.webp",
    "/products/airpods-max-blue-4.webp",
    "/products/airpods-max-blue-5.webp",
    "/products/airpods-max-blue-6.webp",
  ],
  Orange: [
    "/products/airpods-max-orange-1.webp",
    "/products/airpods-max-orange-2.webp",
    "/products/airpods-max-orange-3.webp",
    "/products/airpods-max-orange-4.webp",
    "/products/airpods-max-orange-5.webp",
    "/products/airpods-max-orange-6.webp",
  ],
};

function getAirPodsImages(name: string) {
  if (name.includes("AirPods Max")) {
    return airPodsMaxImages;
  }

  if (name.includes("AirPods Pro 3")) {
    return {
      "": [
        "/products/airpods-pro-3-1.webp",
        "/products/airpods-pro-3-2.webp",
        "/products/airpods-pro-3-3.webp",
        "/products/airpods-pro-3-4.webp",
      ],
    };
  }

  if (name.includes("AirPods Pro 2")) {
    return {
      "": [
        "/products/airpods-pro-2-1.webp",
        "/products/airpods-pro-2-2.webp",
        "/products/airpods-pro-2-3.webp",
        "/products/airpods-pro-2-4.webp",
        "/products/airpods-pro-2-5.webp",
        "/products/airpods-pro-2-6.webp",
      ],
    };
  }

  if (name.includes("ANC")) {
    return {
      "": [
        "/products/airpods-4-anc-1.webp",
        "/products/airpods-4-anc-2.webp",
        "/products/airpods-4-anc-3.webp",
        "/products/airpods-4-anc-4.webp",
      ],
    };
  }

  if (name.includes("AirPods 4")) {
    return {
      "": [
        "/products/airpods-4-1.webp",
        "/products/airpods-4-2.webp",
        "/products/airpods-4-3.webp",
      ],
    };
  }

  return undefined;
}

function getAppleWatchImages(name: string): Record<string, string[]> | undefined {
  if (name === "Apple Watch SE 2 (2024)") {
    return {
      Midnight: [
        "/products/apple-watch-se-2-midnight-1.webp",
        "/products/apple-watch-se-2-midnight-2.webp",
        "/products/apple-watch-se-2-midnight-3.webp",
      ],
    };
  }

  if (name === "Apple Watch SE 3 (2025)") {
    return {
      Midnight: [
        "/products/apple-watch-se-3-midnight-1.webp",
        "/products/apple-watch-se-3-midnight-2.webp",
      ],
      Starlight: [
        "/products/apple-watch-se-3-starlight-1.webp",
        "/products/apple-watch-se-3-starlight-2.webp",
      ],
    };
  }

  if (name === "Apple Watch Series 11") {
    return {
      "Jet Black": [
        "/products/apple-watch-series-11-jet-black-1.webp",
        "/products/apple-watch-series-11-jet-black-2.webp",
      ],
      "Space Gray": [
        "/products/apple-watch-series-11-space-gray-1.webp",
        "/products/apple-watch-series-11-space-gray-2.webp",
      ],
      "Rose Gold": [
        "/products/apple-watch-series-11-rose-gold-1.webp",
        "/products/apple-watch-series-11-rose-gold-2.webp",
      ],
      Silver: [
        "/products/apple-watch-series-11-silver-1.webp",
        "/products/apple-watch-series-11-silver-2.webp",
      ],
    };
  }

  return undefined;
}

const products: Product[] = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone 17e",
  "iPhone Air",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16e",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPad 11 A16 (2025)",
  "iPad Air 8 M4 (2026)",
  "MacBook Neo",
  "AirPods Max USB-C (2024)",
  "AirPods Max 2 USB-C (2026)",
  "AirPods Pro 3",
  "AirPods Pro 2",
  "AirPods 4 (Без шумоподавления)",
  "AirPods 4 ANC (С шумоподавлением)",
  "Apple Watch SE 2 (2024)",
  "Apple Watch SE 3 (2025)",
  "Apple Watch Series 11",
].map((name, index) => ({
  accent: index % 3 === 0 ? "orange" : index % 3 === 1 ? "blue" : "silver",
  brand: "Apple",
  category: name.includes("AirPods") ? "AirPods" : name.includes("iPad") ? "iPad" : name === "MacBook Neo" ? "Mac" : name.includes("Apple Watch") ? "Apple Watch" : "iPhone",
  color:
    name === "AirPods Max USB-C (2024)"
      ? "Blue"
      : name === "AirPods Max 2 USB-C (2026)"
      ? "Purple"
      : name.includes("AirPods")
      ? ""
      : name === "iPhone 17 Pro Max"
      ? "Silver"
      : name === "iPhone 17"
        ? "Mist Blue"
        : name === "iPhone 17e"
          ? "Black"
        : name === "iPhone Air"
          ? "Light Gold"
          : name === "iPhone 16 Plus"
            ? "Pink"
          : name === "iPhone 16"
              ? "Ultramarine"
              : name === "iPhone 16e"
                ? "Black"
              : name === "iPhone 15"
                ? "Blue"
              : name === "iPhone 15 Plus"
                ? "Pink"
              : name === "iPhone 16 Pro"
                ? "White"
              : name === "iPhone 16 Pro Max"
                ? "Natural"
              : name === "iPad 11 A16 (2025)"
                ? "Silver"
                : name === "iPad Air 8 M4 (2026)"
                  ? "Blue"
                : name === "MacBook Neo"
                  ? "Indigo"
                : name === "Apple Watch SE 2 (2024)" || name === "Apple Watch SE 3 (2025)"
                  ? "Midnight"
                : name === "Apple Watch Series 11"
                  ? "Jet Black"                : "Cosmic Orange",
  condition: "новый",
  description: "",
  id: index + 1,
  imagesByColor:
    name.includes("AirPods")
      ? getAirPodsImages(name)
      : name === "iPhone 17 Pro Max" || name === "iPhone 17 Pro"
      ? iphone17ProImages
      : name === "iPhone 17"
        ? iphone17Images
        : name === "iPhone 17e"
          ? iphone17eImages
        : name === "iPhone Air"
          ? iphoneAirImages
          : name === "iPhone 16" || name === "iPhone 16 Plus"
            ? iphone16Images
          : name === "iPhone 16e"
              ? iphone16eImages
            : name === "iPhone 15" || name === "iPhone 15 Plus"
              ? iphone15Images
            : name === "MacBook Neo"
              ? macbookNeoImages
            : name === "iPhone 16 Pro" || name === "iPhone 16 Pro Max"
              ? iphone16ProImages
            : name === "iPad 11 A16 (2025)"
              ? ipad11Images
              : name === "iPad Air 8 M4 (2026)"
                ? ipadAir8Images
              : name.includes("Apple Watch")
                ? getAppleWatchImages(name)
              : undefined,
  name,
  price: "уточнить цену",
  sim: name.includes("AirPods") || name === "MacBook Neo" || name.includes("Apple Watch") ? "" : name.includes("iPad") ? "Wi-Fi" : name === "iPhone 15" || name === "iPhone 15 Plus" || name === "iPhone 16" || name === "iPhone 16 Plus" || name === "iPhone 16e" || name === "iPhone 16 Pro Max" || name === "iPhone 17" || name === "iPhone 17e" ? "Nano-SIM + eSIM" : name === "iPhone 16 Pro" ? "Dual Nano-SIM" : "Dual eSIM",
  size: name === "iPad Air 8 M4 (2026)" ? "11 дюймов" : name.includes("Apple Watch SE") ? "40 мм" : name === "Apple Watch Series 11" ? "42 мм" : "",
  status: "В наличии",
  storage: name.includes("AirPods") ? "" : name.includes("Apple Watch") ? "S/M" : name === "MacBook Neo" || name === "iPhone 16 Pro Max" ? "256GB" : name === "iPhone 15" || name === "iPhone 15 Plus" || name === "iPhone 16" || name === "iPhone 16 Plus" || name === "iPhone 16e" || name === "iPhone 16 Pro" || name.includes("iPad") ? "128GB" : "256GB",
  variantOptions:
    name.includes("AirPods Max")
      ? airPodsMaxOptions
      : name.includes("AirPods")
      ? undefined
      : name === "iPhone 17 Pro Max"
      ? iphoneProMaxOptions
      : name === "iPhone 17"
        ? iphone17Options
        : name === "iPhone 17e"
          ? iphone17eOptions
        : name === "iPhone Air"
          ? iphoneAirOptions
          : name === "iPhone 16"
            ? iphone16Options
          : name === "iPhone 16 Plus"
              ? iphone16PlusOptions
              : name === "iPhone 16e"
                ? iphone16eOptions
              : name === "iPhone 16 Pro"
                ? iphone16ProOptions
              : name === "iPhone 16 Pro Max"
                ? iphone16ProMaxOptions
              : name === "iPhone 15"
                ? iphone15Options
              : name === "iPhone 15 Plus"
                ? iphone15PlusOptions
              : name === "MacBook Neo"
                ? macbookNeoOptions
              : name === "iPad 11 A16 (2025)"
                ? ipad11Options
              : name === "iPad Air 8 M4 (2026)"
                ? ipadAir8Options
              : name === "Apple Watch SE 2 (2024)"
                ? appleWatchSe2Options
              : name === "Apple Watch SE 3 (2025)"
                ? appleWatchSe3Options
              : name === "Apple Watch Series 11"
                ? appleWatchSeries11Options                : iphoneOptions,
}));

const categories = ["Все", "iPhone", "AirPods", "iPad", "Mac", "Apple Watch"];
const showcaseCategories = ["iPhone", "AirPods", "iPad", "Mac", "Apple Watch"];
const catalogCategoryOrder = new Map(showcaseCategories.map((category, index) => [category, index]));
const productPriceOverrides = priceOverrides as Record<string, PriceOverride>;

function DeviceVisual({
  accent,
  category,
  imageAlt,
  imageFit,
  imageSrc,
}: Pick<Product, "accent" | "category"> & {
  imageAlt?: string;
  imageFit?: "default" | "matchFirst";
  imageSrc?: string;
}) {
  return (
    <div className={`deviceVisual ${accent} ${imageFit === "matchFirst" ? "matchFirstImage" : ""}`} aria-hidden="true">
      {category === "iPhone" || category === "iPad" || category === "Mac" || imageSrc ? (
        <img
          src={imageSrc ?? "/appsale-product.webp"}
          alt={imageAlt ?? ""}
          onError={(event) => {
            event.currentTarget.src = "/appsale-product.webp";
          }}
        />
      ) : category === "AirPods" ? (
        <div className="airpodsRender">
          <span />
          <span />
        </div>
      ) : category === "Dyson" ? (
        <div className="dysonRender">
          <span />
          <i />
        </div>
      ) : category === "Apple Watch" ? (
        <div className="watchRender">
          <span />
        </div>
      ) : (
        <div className="phoneRender">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}

function parsePrice(price: string) {
  const digits = price.replace(/\D/g, "");

  return Number(digits || "0");
}

function getCatalogCategoryRank(category: string) {
  return catalogCategoryOrder.get(category) ?? showcaseCategories.length;
}

function getCartKey(product: Product) {
  return [product.id, product.size ?? "", product.color, product.storage, product.sim ?? ""].join("|");
}

function getPriceKey(product: Pick<Product, "color" | "name" | "sim" | "size" | "storage">) {
  return [product.name, product.storage, product.color, product.sim ?? "", product.size ?? ""].join("|");
}

function getLegacyPriceKey(product: Pick<Product, "color" | "name" | "sim" | "storage">) {
  return [product.name, product.storage, product.color, product.sim ?? ""].join("|");
}

function getProductPrice(product: Pick<Product, "color" | "name" | "price" | "sim" | "size" | "storage">) {
  const override = productPriceOverrides[getPriceKey(product)] ?? productPriceOverrides[getLegacyPriceKey(product)];

  if (typeof override?.finalPrice === "number") return formatDisplayPrice(override.finalPrice);

  return product.price;
}

function formatDisplayPrice(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function getPricedSelections(product: Product) {
  return Object.keys(productPriceOverrides)
    .filter((key) => key.startsWith(`${product.name}|`))
    .map((key) => {
      const [, storage, color, sim = "", size = ""] = key.split("|");

      return { color, sim, size, storage };
    });
}

function hasPricedSelection(product: Product, selection: ProductSelection) {
  return Boolean(productPriceOverrides[getPriceKey({ ...product, ...selection })] ?? productPriceOverrides[getLegacyPriceKey({ ...product, ...selection })]);
}

function getNearestPricedSelection(product: Product, selection: ProductSelection, lockedField: keyof ProductSelection) {
  const pricedSelections = getPricedSelections(product);

  if (!pricedSelections.length || hasPricedSelection(product, selection)) return selection;

  const candidatesWithLockedField = pricedSelections.filter((candidate) => candidate[lockedField] === selection[lockedField]);
  const candidates = candidatesWithLockedField.length ? candidatesWithLockedField : pricedSelections;

  return candidates
    .map((candidate) => ({
      candidate,
      score:
        Number(candidate.color === selection.color) +
        Number(candidate.size === selection.size) +
        Number(candidate.sim === selection.sim) +
        Number(candidate.storage === selection.storage),
    }))
    .sort((first, second) => second.score - first.score)[0].candidate;
}

function getCheapestPricedSelection(product: Product, fallbackSelection: ProductSelection) {
  const pricedSelections = Object.entries(productPriceOverrides)
    .filter(([key]) => key.startsWith(`${product.name}|`))
    .flatMap(([key, override]) => {
      if (typeof override.finalPrice !== "number") return [];

      const [, storage, color, sim = "", size = ""] = key.split("|");

      return [{
        selection: { color, sim, size, storage },
        price: override.finalPrice,
        score:
          Number(color === fallbackSelection.color) +
          Number(size === fallbackSelection.size) +
          Number(sim === fallbackSelection.sim) +
          Number(storage === fallbackSelection.storage),
      }];
    });

  if (!pricedSelections.length) return fallbackSelection;

  return pricedSelections.sort((first, second) => first.price - second.price || second.score - first.score)[0].selection;
}

function getInitialProductSelection(product: Product) {
  const defaultSelection = {
    color: product.color,
    size: product.size ?? "",
    sim: product.sim ?? "",
    storage: product.storage,
  };

  if (hasPricedSelection(product, defaultSelection)) return defaultSelection;

  return getCheapestPricedSelection(product, defaultSelection);
}

function getInitialProductSelections() {
  return Object.fromEntries(products.map((product) => [product.id, getInitialProductSelection(product)]));
}

function getProductSpecs(product: Product) {
  return [product.size, product.storage, product.color, product.sim, product.price].filter(Boolean).join(" · ");
}

function getStorageOptionLabel(product: Product) {
  return product.category === "Apple Watch" ? "Ремешок" : "Память";
}

function getSizeOptionLabel(product: Product) {
  return product.category === "Apple Watch" ? "Корпус" : "Диагональ";
}

function getRuPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "7";
  if (digits.startsWith("8")) return `7${digits.slice(1, 11)}`;
  if (digits.startsWith("7")) return digits.slice(0, 11);

  return `7${digits.slice(0, 10)}`;
}

function formatRuPhone(value: string) {
  const digits = getRuPhoneDigits(value);
  const operator = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);

  let formatted = "+7";

  if (operator) formatted += ` (${operator}`;
  if (operator.length === 3) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;

  return formatted;
}

function createOrderNumber(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function removeLastRuPhoneDigit(value: string) {
  const digits = getRuPhoneDigits(value);
  const nextDigits = digits.length > 1 ? digits.slice(0, -1) : "7";

  return formatRuPhone(nextDigits);
}

export default function Home() {
  const recentlyAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollLocked = useRef(false);
  const scrollLockY = useRef(0);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSelections, setProductSelections] = useState<Record<number, ProductSelection>>(() => getInitialProductSelections());
  const [productImageIndexes, setProductImageIndexes] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [successOrder, setSuccessOrder] = useState<SuccessOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [recentlyAddedKey, setRecentlyAddedKey] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    cityAddress: "",
    comment: "",
    contactMethod: "Звонок",
    deliveryMethod: "Самовывоз",
    name: "",
    phone: "+7",
    privacyAccepted: false,
    sdekCity: "",
    sdekPoint: "",
    telegram: "",
  });
  const [form, setForm] = useState({
    comment: "",
    name: "",
    phone: "",
    telegram: "",
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) return;

    webApp.ready?.();
    webApp.expand?.();
    webApp.setHeaderColor?.("#f3f3f3");
    webApp.setBackgroundColor?.("#f3f3f3");

    const user = webApp.initDataUnsafe?.user;
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
    const telegram = user?.username ? `@${user.username}` : "";

    if (fullName || telegram) {
      setCheckoutForm((current) => ({
        ...current,
        name: current.name || fullName,
        telegram: current.telegram || telegram,
      }));
      setForm((current) => ({
        ...current,
        name: current.name || fullName,
        telegram: current.telegram || telegram,
      }));
    }
  }, []);

  useEffect(() => {
    const savedCart = window.localStorage.getItem("appsale-cart");

    if (savedCart) {
      const stored = JSON.parse(savedCart) as Array<{ color?: string; id: number; key?: string; qty: number; sim?: string; size?: string; storage?: string }>;
      const items = stored
        .map((item) => {
          const product = products.find((entry) => entry.id === item.id);
          if (!product) return null;

          const configuredProduct = {
            ...product,
            color: item.color ?? product.color,
            size: item.size ?? product.size,
            sim: item.sim ?? product.sim,
            storage: item.storage ?? product.storage,
          };

          return {
            key: item.key ?? getCartKey(configuredProduct),
            product: configuredProduct,
            qty: item.qty,
          };
        })
        .filter(Boolean) as CartItem[];

      setCart(items);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "appsale-cart",
      JSON.stringify(
        cart.map((item) => ({
          color: item.product.color,
          id: item.product.id,
          key: item.key,
          qty: item.qty,
          size: item.product.size,
          sim: item.product.sim,
          storage: item.product.storage,
        })),
      ),
    );
  }, [cart]);

  useEffect(() => {
    const hasOpenOverlay = Boolean(detailProduct || selectedProduct || isCartOpen || isProfileOpen || isSupportOpen || successOrder);

    document.body.classList.toggle("modalOpen", hasOpenOverlay);

    if (hasOpenOverlay && !isScrollLocked.current) {
      scrollLockY.current = window.scrollY;
      isScrollLocked.current = true;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockY.current}px`;
      document.body.style.right = "0";
      document.body.style.left = "0";
      document.body.style.width = "100%";
    }

    if (!hasOpenOverlay && isScrollLocked.current) {
      const restoreY = scrollLockY.current;
      isScrollLocked.current = false;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.right = "";
      document.body.style.left = "";
      document.body.style.width = "";
      window.scrollTo(0, restoreY);
    }
  }, [detailProduct, isCartOpen, isProfileOpen, isSupportOpen, selectedProduct, successOrder]);

  useEffect(() => {
    return () => {
      if (recentlyAddedTimer.current) {
        clearTimeout(recentlyAddedTimer.current);
      }

      document.body.classList.remove("modalOpen");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.right = "";
      document.body.style.left = "";
      document.body.style.width = "";
    };
  }, []);

  useEffect(() => {
    const updateBackToTop = () => {
      setShowBackToTop(window.scrollY > 560);
    };

    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateBackToTop);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
      const categoryMatches =
        activeCategory === "Все" || (activeCategory === "Под заказ" ? product.status === "Под заказ" : product.category === activeCategory);
      const searchMatches =
        !query || [product.name, product.category, product.size, product.color, product.storage, product.sim].filter(Boolean).join(" ").toLowerCase().includes(query);

      return categoryMatches && searchMatches;
    });

    if (activeCategory !== "Все") return filteredProducts;

    return [...filteredProducts].sort((first, second) => {
      const categoryDifference = getCatalogCategoryRank(first.category) - getCatalogCategoryRank(second.category);

      return categoryDifference || first.id - second.id;
    });
  }, [activeCategory, catalogQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + parsePrice(item.product.price) * item.qty, 0);
  const cartTotalLabel = cartTotal > 0 ? `${cartTotal.toLocaleString("ru-RU")} ₽` : "уточнить цену";

  function getConfiguredProduct(product: Product) {
    const selection = productSelections[product.id];

    if (!selection) {
      return {
        ...product,
        price: getProductPrice(product),
      };
    }

    const configuredProduct = {
      ...product,
      color: selection.color,
      size: selection.size,
      sim: selection.sim,
      storage: selection.storage,
    };

    return {
      ...configuredProduct,
      price: getProductPrice(configuredProduct),
    };
  }

  function getProductImages(product: Product) {
    const selectedColor = productSelections[product.id]?.color ?? product.color;

    return product.imagesByColor?.[selectedColor] ?? ["/appsale-product.webp"];
  }

  function getProductImage(product: Product) {
    const images = getProductImages(product);
    const imageIndex = productImageIndexes[product.id] ?? 0;

    return images[imageIndex] ?? images[0] ?? "/appsale-product.webp";
  }

  function getProductImageFit(product: Product) {
    const imageIndex = productImageIndexes[product.id] ?? 0;

    return product.name === "iPhone 17" && (imageIndex === 1 || imageIndex === 2) ? "matchFirst" : "default";
  }

  function selectProductImage(productId: number, index: number) {
    setProductImageIndexes((current) => ({
      ...current,
      [productId]: index,
    }));
  }

  function showProductImage(product: Product, direction: 1 | -1) {
    const images = getProductImages(product);

    if (images.length < 2) return;

    setProductImageIndexes((current) => {
      const currentIndex = current[product.id] ?? 0;
      const nextIndex = (currentIndex + direction + images.length) % images.length;

      return {
        ...current,
        [product.id]: nextIndex,
      };
    });
  }

  function updateProductSelection(productId: number, field: keyof ProductSelection, value: string) {
    const product = products.find((entry) => entry.id === productId);

    if (!product) return;

    setProductSelections((current) => {
      const nextSelection = {
        color: current[productId]?.color ?? product.color ?? "",
        size: current[productId]?.size ?? product.size ?? "",
        sim: current[productId]?.sim ?? product.sim ?? "",
        storage: current[productId]?.storage ?? product.storage ?? "",
        [field]: value,
      };

      return {
        ...current,
        [productId]: nextSelection,
      };
    });

    if (field === "color") {
      setProductImageIndexes((current) => ({
        ...current,
        [productId]: 0,
      }));
    }
  }

  function getCartQty(product: Product) {
    return cart.find((item) => item.key === getCartKey(getConfiguredProduct(product)))?.qty ?? 0;
  }

  function openProductDetails(product: Product) {
    setDetailProduct(getConfiguredProduct(product));
  }

  function openOrder(product: Product) {
    setSelectedProduct(getConfiguredProduct(product));
    setOrderStatus("");
    setForm({
      comment: "",
      name: "",
      phone: "",
      telegram: "",
    });
  }

  function addToCart(product: Product) {
    const configuredProduct = getConfiguredProduct(product);
    const key = getCartKey(configuredProduct);

    setRecentlyAddedKey(key);

    if (recentlyAddedTimer.current) {
      clearTimeout(recentlyAddedTimer.current);
    }

    recentlyAddedTimer.current = setTimeout(() => {
      setRecentlyAddedKey("");
    }, 1300);

    setCart((current) => {
      const found = current.find((item) => item.key === key);

      if (found) {
        return current.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item));
      }

      return [...current, { key, product: configuredProduct, qty: 1 }];
    });
  }

  function updateCartQty(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  }

  function clearCart() {
    setCart([]);
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToTop() {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }

  async function sendSingleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct) return;

    if (!form.name.trim() || (!form.phone.trim() && !form.telegram.trim())) {
      setOrderStatus("Укажите имя и телефон или Telegram для связи.");
      return;
    }

    setIsSending(true);
    setOrderStatus("");

    try {
      const response = await fetch("/api/order", {
        body: JSON.stringify({
          color: selectedProduct.color,
          comment: form.comment.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          price: selectedProduct.price,
          product: selectedProduct.name,
          size: selectedProduct.size,
          sim: selectedProduct.sim,
          storage: selectedProduct.storage,
          telegram: form.telegram.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setOrderStatus(data?.message ?? "Не удалось отправить заявку. Напишите нам в Telegram.");
        return;
      }

      setOrderStatus("Заявка отправлена. Мы подтвердим наличие и детали в Telegram.");
    } finally {
      setIsSending(false);
    }
  }

  async function sendCartOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cart.length) {
      setAccountStatus("Корзина пуста.");
      return;
    }

    const phoneDigits = getRuPhoneDigits(checkoutForm.phone);

    if (!checkoutForm.name.trim() || phoneDigits.length <= 1) {
      setAccountStatus("Укажите имя и номер телефона.");
      return;
    }

    if (phoneDigits.length !== 11) {
      setAccountStatus("Номер телефона должен состоять ровно из 11 цифр.");
      return;
    }

    if (!phoneDigits.startsWith("79")) {
      setAccountStatus("Введите мобильный номер в формате +7 (9xx) xxx-xx-xx.");
      return;
    }

    if (checkoutForm.contactMethod === "Telegram" && !checkoutForm.telegram.trim()) {
      setAccountStatus("Укажите Telegram, если хотите связь через Telegram.");
      return;
    }

    if (!checkoutForm.privacyAccepted) {
      setAccountStatus("Подтвердите согласие на обработку персональных данных.");
      return;
    }

    const orderNumber = createOrderNumber();

    setIsSending(true);
    setAccountStatus("");

    try {
      const response = await fetch("/api/order", {
        body: JSON.stringify({
          comment: checkoutForm.comment.trim(),
          name: checkoutForm.name.trim(),
          orderNumber,
          phone: checkoutForm.phone.trim(),
          telegram: checkoutForm.telegram.trim(),
          product: "Корзина appsale store",
          storage: `${cartCount} поз.`,
          contactMethod: checkoutForm.contactMethod,
          deliveryMethod: checkoutForm.deliveryMethod,
          deliveryAddress: "",
          sdekCity: "",
          sdekPoint: "",
          items: cart.map((item) => ({
            color: item.product.color,
            name: item.product.name,
            price: item.product.price,
            qty: item.qty,
            size: item.product.size,
            sim: item.product.sim,
            storage: item.product.storage,
          })),
          total: cartTotalLabel,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setAccountStatus(data?.message ?? "Не удалось отправить корзину. Напишите нам в Telegram.");
        return;
      }

      setSuccessOrder({
        itemsCount: cartCount,
        number: orderNumber,
        total: cartTotalLabel,
      });
      setAccountStatus("");
      clearCart();
      setIsCartOpen(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="appsale store">
          <img className="brandLogo" src="/appsale-logo.webp" alt="" />
          <span>appsale store</span>
        </a>
        <nav>
          <div className="headerPrimary">
            <a href="#catalog">Каталог</a>
            {showcaseCategories.map((category) => (
              <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => selectCategory(category)} type="button">
                {category}
              </button>
            ))}
          </div>
          <div className="headerSecondary">
            <a href="#how">Как купить</a>
            <a href="https://t.me/appsale_store" rel="noreferrer" target="_blank">
              Telegram
            </a>
            <a href="https://vk.com/appsale_store" rel="noreferrer" target="_blank">
              VK
            </a>
            <button className="topbarButton cartButton" onClick={() => setIsCartOpen(true)} type="button">
              Корзина
              <span>{cartCount}</span>
            </button>
          </div>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="heroProduct" aria-label="Витрина техники appsale store">
          <img src="/appsale-hero.webp" alt="appsale store: iPhone в цветах Deep Blue, Desert Orange и Silver Titanium" />
        </div>
        <div className="heroCopy">
          <h1>Премиальная техника в наличии и под заказ.</h1>
          <p className="heroLead">iPhone, AirPods, Dyson и аксессуары. Выберите устройство, оставьте заявку, и мы свяжемся с вами для уточнения деталей.</p>
          <div className="heroActions">
            <a href="#catalog">Смотреть каталог</a>
            <a href="https://t.me/evgenypulkov" rel="noreferrer" target="_blank">
              Написать в Telegram
            </a>
          </div>
        </div>
      </section>

      <section className="trustStrip" aria-label="Преимущества">
        <div>
          <span className="trustIcon checkIcon" />
          <p>Только оригинальная техника Apple.</p>
        </div>
        <div>
          <span className="trustIcon checkIcon" />
          <p>Честные цены и прозрачные условия покупки.</p>
        </div>
        <div>
          <span className="trustIcon checkIcon" />
          <p>Поможем подобрать устройство, которое подойдет именно вам.</p>
        </div>
        <div>
          <span className="trustIcon checkIcon" />
          <p>Поддержка до и после покупки — всегда на связи, если понадобится помощь.</p>
        </div>
      </section>

      <section className="catalogSection" id="catalog">
        <div className="sectionHead">
          <div>
            <span>Каталог</span>
            <h2>Все товары</h2>
          </div>
        </div>

        <label className="catalogSearch">
          <span>Поиск</span>
          <input onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Например: iPhone 17, AirPods, iPad" value={catalogQuery} />
        </label>

        <div className="categoryBar">
          {categories.map((category) => (
            <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)} type="button">
              {category}
            </button>
          ))}
        </div>

        <div className="productGrid">
          {visibleProducts.map((product) => (
            <article className="productCard" key={product.id}>
              <div
                className="productVisualOpen"
                onClick={() => openProductDetails(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProductDetails(product);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <DeviceVisual accent={product.accent} category={product.category} imageAlt={product.name} imageFit={getProductImageFit(product)} imageSrc={getProductImage(product)} />
              </div>
              {getProductImages(product).length > 1 ? (
                <div className="productThumbs" aria-label={`Р’С‹Р±РѕСЂ С„РѕС‚Рѕ ${product.name}`}>
                  {getProductImages(product).map((image, index) => (
                    <button
                      className={(productImageIndexes[product.id] ?? 0) === index ? "active" : ""}
                      key={image}
                      onClick={() => selectProductImage(product.id, index)}
                      type="button"
                    >
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="productThumbs productThumbsPlaceholder" aria-hidden="true" />
              )}
              <div className="productInfo">
                <div>
                  <button className="productTitleButton" onClick={() => openProductDetails(product)} type="button">
                    {product.name}
                  </button>
                </div>
                {product.variantOptions ? (
                  <div className="variantPanel" aria-label={`Выбор комплектации ${product.name}`}>
                    <div>
                      <span>Цвет</span>
                      <div className="variantOptions colorOptions">
                        {product.variantOptions.colors.map((color) => (
                          <button
                            className={productSelections[product.id]?.color === color ? "active" : ""}
                            key={color}
                            onClick={() => updateProductSelection(product.id, "color", color)}
                            type="button"
                            aria-label={color}
                            title={color}
                            data-color={color}
                          >
                            <i aria-hidden="true" />
                            <span>{color}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {product.category === "Apple Watch" && product.variantOptions.sizes?.length ? (
                      <div>
                        <span>{getSizeOptionLabel(product)}</span>
                        <div className="variantOptions storageOptions">
                          {product.variantOptions.sizes.map((size) => (
                            <button
                              className={productSelections[product.id]?.size === size ? "active" : ""}
                              key={size}
                              onClick={() => updateProductSelection(product.id, "size", size)}
                              type="button"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {product.variantOptions.storages.length ? (
                      <div>
                        <span>{getStorageOptionLabel(product)}</span>
                        <div className="variantOptions storageOptions">
                          {product.variantOptions.storages.map((storage) => (
                            <button
                              className={productSelections[product.id]?.storage === storage ? "active" : ""}
                              key={storage}
                              onClick={() => updateProductSelection(product.id, "storage", storage)}
                              type="button"
                            >
                              {storage}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {product.category !== "Apple Watch" && product.variantOptions.sizes?.length ? (
                      <div>
                        <span>{getSizeOptionLabel(product)}</span>
                        <div className="variantOptions storageOptions">
                          {product.variantOptions.sizes.map((size) => (
                            <button
                              className={productSelections[product.id]?.size === size ? "active" : ""}
                              key={size}
                              onClick={() => updateProductSelection(product.id, "size", size)}
                              type="button"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {product.variantOptions.sims.length ? (
                      <div>
                        <span>SIM-карта</span>
                        <div className="variantOptions simOptions">
                          {product.variantOptions.sims.map((sim) => (
                            <button
                              className={productSelections[product.id]?.sim === sim ? "active" : ""}
                              key={sim}
                              onClick={() => updateProductSelection(product.id, "sim", sim)}
                              type="button"
                            >
                              {sim}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <footer>
                  <b>{getConfiguredProduct(product).price}</b>
                  <div className="cardActions">
                    {getCartQty(product) > 0 ? (
                      <div className="cardQtyControl" aria-label={`Количество ${product.name} в корзине`}>
                        <button onClick={() => updateCartQty(getCartKey(getConfiguredProduct(product)), -1)} type="button">
                          -
                        </button>
                        <span>{getCartQty(product)}</span>
                        <button onClick={() => addToCart(product)} type="button">
                          +
                        </button>
                      </div>
                    ) : (
                      <>
                        <button className="detailsButton" onClick={() => openProductDetails(product)} type="button">
                          Подробнее
                        </button>
                      </>
                    )}
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="howSection" id="how">
        <div className="sectionHead">
          <div>
            <span>Как купить</span>
            <h2>Простая схема без лишних шагов.</h2>
          </div>
        </div>
        <div className="steps">
          <article>
            <span>01</span>
            <strong>Выберите устройство</strong>
            <p>Откройте карточку товара, выберите цвет, память и версию.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Добавьте в корзину</strong>
            <p>Соберите один или несколько товаров в корзине и проверьте итог.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Подтвердите детали</strong>
            <p>Согласуем наличие, способ получения, бронь и удобный формат оплаты.</p>
          </article>
        </div>
      </section>

      <section className="reviewsSection" aria-label="Отзывы клиентов">
        <div className="sectionHead">
          <div>
            <span>Отзывы</span>
            <h2>Отзывы тех, кто уже выбрал нас. Станьте следующим довольным клиентом.</h2>
          </div>
        </div>
        <div className="reviewsGrid">
          <article>
            <div>
              <strong>Вероника</strong>
              <span>iPhone 17 Pro Max Silver</span>
            </div>
            <p>Покупкой очень довольна, спасибо большое за ответы на все вопросы и быструю отправку. Не нарадуюсь новому устройству.</p>
          </article>
          <article>
            <div>
              <strong>Надежда</strong>
              <span>iPhone 17 Pro Max Deep Blue</span>
            </div>
            <p>Как всегда все быстро и четко. Возник вопрос с App Store, Женя быстро помог разобраться и оперативно решил вопрос.</p>
          </article>
          <article>
            <div>
              <strong>Вадим</strong>
              <span>iPhone 17 Pro Max Cosmic Orange</span>
            </div>
            <p>Спасибо за консультацию и оперативность. Айфон топ!</p>
          </article>
          <article>
            <div>
              <strong>Ольга</strong>
              <span>iPad Air 11 M3 (2025)</span>
            </div>
            <p>Уже второй Apple-девайс. Все оригинальное, все работает, с доставкой. Евгений внимательный, поможет с выбором и объяснит.</p>
          </article>
          <article>
            <div>
              <strong>Маша</strong>
              <span>AirPods Max USB-C (2024) Starlight</span>
            </div>
            <p>Спасибо огромное за поздравления и за наушники, роскошные.</p>
          </article>
          <article>
            <div>
              <strong>Екатерина</strong>
              <span>MacBook Air M4 (2025)</span>
            </div>
            <p>Не жалею ни единого потраченного рубля. Перешла с Windows, зарядку держит три дня, легкий и компактный.</p>
          </article>
        </div>
      </section>

      <section className="paymentSection" aria-label="Оплата доставка и гарантия">
        <div className="sectionHead">
          <div>
            <span>Сервис</span>
            <h2>Оплата, доставка и гарантия.</h2>
          </div>
        </div>
        <div className="serviceGrid">
          <article>
            <span>01</span>
            <strong>Оплата</strong>
            <p>Все цены на сайте указаны с максимальной скидкой за наличный расчет. При выборе других способов оплаты итоговую стоимость уточняйте.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Доставка</strong>
            <p>Самовывоз или доставка. В корзине можно выбрать удобный вариант, а детали согласуем перед отправкой.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Гарантия</strong>
            <p>Гарантия на заводской брак действует на все новые устройства.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>appsale store</strong>
          <p>Техника Apple. Эстетика. Выбор.</p>
        </div>
        <div>
          <a href="https://t.me/appsale_store" rel="noreferrer" target="_blank">
            t.me/appsale_store
          </a>
          <a href="https://vk.com/appsale_store" rel="noreferrer" target="_blank">
            vk.com/appsale_store
          </a>
        </div>
      </footer>

      <nav className="mobileTabbar" aria-label="Навигация appsale store">
        <button onClick={() => selectCategory("Все")} type="button">
          <i className="tabIcon tabIconCatalog" aria-hidden="true" />
          <span>Каталог</span>
        </button>
        <button className="mobileCartTab" onClick={() => setIsCartOpen(true)} type="button">
          <i className="tabIcon tabIconCart" aria-hidden="true" />
          <span>Корзина</span>
          {cartCount ? <b>{cartCount}</b> : null}
        </button>
        <button onClick={() => setIsSupportOpen(true)} type="button">
          <i className="tabIcon tabIconHelp" aria-hidden="true" />
          <span>Поддержка</span>
        </button>
        <button onClick={() => setIsProfileOpen(true)} type="button">
          <i className="tabIcon tabIconProfile" aria-hidden="true" />
          <span>Профиль</span>
        </button>
      </nav>

      <button className={`backToTop ${showBackToTop ? "visible" : ""}`} onClick={scrollToTop} type="button" aria-label="Наверх">
        <span aria-hidden="true">↑</span>
      </button>

      {detailProduct
        ? (() => {
            const product = getConfiguredProduct(detailProduct);
            const productImages = getProductImages(product);
            const isDetailProductAdded = recentlyAddedKey === getCartKey(product);
            const detailCartKey = getCartKey(product);
            const detailCartQty = cart.find((item) => item.key === detailCartKey)?.qty ?? 0;

            return (
              <div className="orderOverlay" role="dialog" aria-modal="true" aria-label={`Карточка ${product.name}`}>
                <button className="overlayBackdrop" onClick={() => setDetailProduct(null)} type="button" aria-label="Закрыть" />
                <section className="orderPanel detailPanel">
                  <button className="closeButton" onClick={() => setDetailProduct(null)} type="button">
                    Закрыть
                  </button>
                  <span>Карточка товара</span>
                  <div
                    className="detailHero"
                    onClick={() => showProductImage(product, 1)}
                    role="button"
                    tabIndex={0}
                  >
                    <DeviceVisual accent={product.accent} category={product.category} imageAlt={product.name} imageFit={getProductImageFit(product)} imageSrc={getProductImage(product)} />
                    {productImages.length > 1 ? <small>{(productImageIndexes[product.id] ?? 0) + 1} / {productImages.length}</small> : null}
                  </div>
                  {productImages.length > 1 ? (
                    <div className="detailThumbs" aria-label={`Выбор фото ${product.name}`}>
                      {productImages.map((image, index) => (
                        <button
                          className={(productImageIndexes[product.id] ?? 0) === index ? "active" : ""}
                          key={image}
                          onClick={() => selectProductImage(product.id, index)}
                          type="button"
                        >
                          <img src={image} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <h2>{product.name}</h2>
                  <p>{[product.size, product.storage, product.color, product.sim].filter(Boolean).join(" · ")}</p>
                  <strong className="detailPrice">{product.price}</strong>
                  {product.variantOptions ? (
                    <div className="detailOptions">
                      <span>Цвет</span>
                      <div className="variantOptions colorOptions">
                        {product.variantOptions.colors.map((color) => (
                          <button
                            className={productSelections[product.id]?.color === color ? "active" : ""}
                            data-color={color}
                            key={color}
                            onClick={() => updateProductSelection(product.id, "color", color)}
                            title={color}
                            type="button"
                            aria-label={color}
                          >
                            <i aria-hidden="true" />
                            <span>{color}</span>
                          </button>
                        ))}
                      </div>
                      {product.category === "Apple Watch" && product.variantOptions.sizes?.length ? (
                        <>
                          <span>{getSizeOptionLabel(product)}</span>
                          <div className="variantOptions storageOptions">
                            {product.variantOptions.sizes.map((size) => (
                              <button
                                className={productSelections[product.id]?.size === size ? "active" : ""}
                                key={size}
                                onClick={() => updateProductSelection(product.id, "size", size)}
                                type="button"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {product.variantOptions.storages.length ? (
                        <>
                          <span>{getStorageOptionLabel(product)}</span>
                          <div className="variantOptions storageOptions">
                            {product.variantOptions.storages.map((storage) => (
                              <button
                                className={productSelections[product.id]?.storage === storage ? "active" : ""}
                                key={storage}
                                onClick={() => updateProductSelection(product.id, "storage", storage)}
                                type="button"
                              >
                                {storage}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {product.category !== "Apple Watch" && product.variantOptions.sizes?.length ? (
                        <>
                          <span>{getSizeOptionLabel(product)}</span>
                          <div className="variantOptions storageOptions">
                            {product.variantOptions.sizes.map((size) => (
                              <button
                                className={productSelections[product.id]?.size === size ? "active" : ""}
                                key={size}
                                onClick={() => updateProductSelection(product.id, "size", size)}
                                type="button"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {product.variantOptions.sims.length ? (
                        <>
                          <span>SIM-карта</span>
                          <div className="variantOptions simOptions">
                            {product.variantOptions.sims.map((sim) => (
                              <button
                                className={productSelections[product.id]?.sim === sim ? "active" : ""}
                                key={sim}
                                onClick={() => updateProductSelection(product.id, "sim", sim)}
                                type="button"
                              >
                                {sim}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="detailAddBar">
                    {detailCartQty > 0 ? (
                      <div className={isDetailProductAdded ? "detailQtyControl added" : "detailQtyControl"} aria-label={`Количество ${product.name} в корзине`}>
                        <button onClick={() => updateCartQty(detailCartKey, -1)} type="button">
                          -
                        </button>
                        <span>
                          Добавлено
                          <b>{detailCartQty} шт</b>
                        </span>
                        <button onClick={() => addToCart(product)} type="button">
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="detailAddButton" onClick={() => addToCart(product)} type="button">
                        В корзину
                      </button>
                    )}
                  </div>
                </section>
              </div>
            );
          })()
        : null}

      {isProfileOpen ? (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-label="Профиль">
          <button className="overlayBackdrop" onClick={() => setIsProfileOpen(false)} type="button" aria-label="Закрыть" />
          <section className="orderPanel profilePanel">
            <button className="closeButton" onClick={() => setIsProfileOpen(false)} type="button">
              Закрыть
            </button>
            <span>Профиль</span>
            <h2>{checkoutForm.name || "Клиент appsale store"}</h2>
            <p>{checkoutForm.telegram || "Telegram подставится автоматически при открытии Mini App."}</p>
            <div className="profileList">
              <a href="https://t.me/evgenypulkov" rel="noreferrer" target="_blank">
                Написать менеджеру
              </a>
              <button onClick={() => setIsCartOpen(true)} type="button">
                Открыть корзину
              </button>
              <a href="https://vk.com/appsale_store" rel="noreferrer" target="_blank">
                VK appsale store
              </a>
            </div>
          </section>
        </div>
      ) : null}

      {isSupportOpen ? (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-label="Поддержка">
          <button className="overlayBackdrop" onClick={() => setIsSupportOpen(false)} type="button" aria-label="Закрыть" />
          <section className="orderPanel supportPanel">
            <button className="closeButton" onClick={() => setIsSupportOpen(false)} type="button">
              Закрыть
            </button>
            <span>Поддержка</span>
            <div className="supportContent">
              <div className="supportIcon" aria-hidden="true">
                ?
              </div>
              <h2>Нужна помощь?</h2>
              <p>Поможем выбрать устройство, уточним наличие, доставку и детали заказа.</p>
              <a className="supportButton" href="https://t.me/evgenypulkov" rel="noreferrer" target="_blank">
                Написать в поддержку
              </a>
              <small>Обычно отвечаем в течение 5 минут</small>
            </div>
          </section>
        </div>
      ) : null}

      {selectedProduct ? (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-label="Заявка на товар">
          <button className="overlayBackdrop" onClick={() => setSelectedProduct(null)} type="button" aria-label="Закрыть" />
          <form className="orderPanel" onSubmit={sendSingleOrder}>
            <button className="closeButton" onClick={() => setSelectedProduct(null)} type="button">
              Закрыть
            </button>
            <span>Заявка на устройство</span>
            <h2>{selectedProduct.name}</h2>
            <p>{getProductSpecs(selectedProduct)}</p>
            <label>
              Имя
              <input onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Как к вам обращаться" value={form.name} />
            </label>
            <label>
              Телефон
              <input onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+7 999 000-00-00" value={form.phone} />
            </label>
            <label>
              Telegram
              <input onChange={(event) => setForm((current) => ({ ...current, telegram: event.target.value }))} placeholder="@username" value={form.telegram} />
            </label>
            <label>
              Комментарий
              <textarea onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Например: нужна доставка или другой цвет" value={form.comment} />
            </label>
            {orderStatus ? <p className="orderStatus">{orderStatus}</p> : null}
            <button disabled={isSending} type="submit">
              {isSending ? "Отправляем" : "Отправить заявку"}
            </button>
          </form>
        </div>
      ) : null}

      {isCartOpen ? (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-label="Корзина">
          <button className="overlayBackdrop" onClick={() => setIsCartOpen(false)} type="button" aria-label="Закрыть" />
          <form className="orderPanel cartPanel" onSubmit={sendCartOrder}>
            <button className="closeButton" onClick={() => setIsCartOpen(false)} type="button">
              Закрыть
            </button>
            <span>Корзина</span>
            <h2>{cart.length ? `${cartCount} товар(а)` : "Корзина пуста"}</h2>
            <p>Заполните контакты и выберите способ получения заказа.</p>
            <div className="cartItems">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <article className="cartItem" key={item.key}>
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>{getProductSpecs(item.product)}</p>
                    </div>
                    <div className="cartQty">
                      <button onClick={() => updateCartQty(item.key, -1)} type="button">
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.key, 1)} type="button">
                        +
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="emptyCart">Добавьте товары в корзину, чтобы оформить заявку.</p>
              )}
            </div>
            <div className="cartSummary">
              <span>Итого</span>
              <strong>{cartTotalLabel}</strong>
            </div>
            <label>
              Ваше имя
              <input onChange={(event) => setCheckoutForm((current) => ({ ...current, name: event.target.value }))} placeholder="Как к вам обращаться" value={checkoutForm.name} />
            </label>
            <label>
              Номер телефона
              <input
                inputMode="tel"
                maxLength={18}
                onChange={(event) => setCheckoutForm((current) => ({ ...current, phone: formatRuPhone(event.target.value) }))}
                onFocus={() => setCheckoutForm((current) => ({ ...current, phone: formatRuPhone(current.phone) }))}
                onKeyDown={(event) => {
                  const input = event.currentTarget;
                  const isCursorAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;

                  if (event.key === "Backspace" && isCursorAtEnd) {
                    event.preventDefault();
                    setCheckoutForm((current) => ({ ...current, phone: removeLastRuPhoneDigit(current.phone) }));
                  }
                }}
                placeholder="+7 (999) 000-00-00"
                value={checkoutForm.phone}
              />
            </label>
            <label>
              Telegram (юзернейм)
              <input onChange={(event) => setCheckoutForm((current) => ({ ...current, telegram: event.target.value }))} placeholder="@username" value={checkoutForm.telegram} />
            </label>
            <fieldset className="contactChoice">
              <legend>Предпочтительный способ связи</legend>
              {["Звонок", "Telegram"].map((method) => (
                <label className={checkoutForm.contactMethod === method ? "active" : ""} key={method}>
                  <input
                    checked={checkoutForm.contactMethod === method}
                    name="contactMethod"
                    onChange={() => setCheckoutForm((current) => ({ ...current, contactMethod: method }))}
                    type="radio"
                  />
                  {method}
                </label>
              ))}
            </fieldset>
            <fieldset className="contactChoice">
              <legend>Способ получения заказа</legend>
              {["Самовывоз", "Доставка"].map((method) => (
                <label className={checkoutForm.deliveryMethod === method ? "active" : ""} key={method}>
                  <input
                    checked={checkoutForm.deliveryMethod === method}
                    name="deliveryMethod"
                    onChange={() => setCheckoutForm((current) => ({ ...current, deliveryMethod: method }))}
                    type="radio"
                  />
                  {method}
                </label>
              ))}
            </fieldset>
            <label className="privacyConsent">
              <input
                checked={checkoutForm.privacyAccepted}
                onChange={(event) => setCheckoutForm((current) => ({ ...current, privacyAccepted: event.target.checked }))}
                type="checkbox"
              />
              <span>
                Я согласен на обработку персональных данных и принимаю{" "}
                <a href="/privacy" rel="noreferrer" target="_blank">
                  политику конфиденциальности
                </a>
                .
              </span>
            </label>
            {accountStatus ? <p className="orderStatus">{accountStatus}</p> : null}
            <div className="cartButtons">
              <button disabled={isSending || !cart.length} type="submit">
                {isSending ? "Отправляем" : "Оформить заказ"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {successOrder ? (
        <div className="orderOverlay" role="dialog" aria-modal="true" aria-label="Заявка принята">
          <button className="overlayBackdrop" onClick={() => setSuccessOrder(null)} type="button" aria-label="Закрыть" />
          <section className="orderPanel successPanel">
            <button className="closeButton" onClick={() => setSuccessOrder(null)} type="button">
              Закрыть
            </button>
            <span>Заявка принята</span>
            <h2>Заказ {successOrder.number}</h2>
            <p>Мы получили ваш заказ и свяжемся с вами для уточнения наличия, оплаты и получения.</p>
            <div className="successSummary">
              <div>
                <span>Товаров</span>
                <strong>{successOrder.itemsCount}</strong>
              </div>
              <div>
                <span>Итого</span>
                <strong>{successOrder.total}</strong>
              </div>
            </div>
            <div className="successActions">
              <a href="https://t.me/evgenypulkov" rel="noreferrer" target="_blank">
                Написать менеджеру
              </a>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                type="button"
              >
                Вернуться в каталог
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

