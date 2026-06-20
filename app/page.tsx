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
  variantOptions?: {
    colors: string[];
    sims: string[];
    storages: string[];
  };
};

type CartItem = {
  key: string;
  product: Product;
  qty: number;
};

type ProductSelection = {
  color: string;
  sim: string;
  storage: string;
};

type PriceOverride = {
  finalPrice?: number;
  price: string;
  sourceLine?: string;
  supplierPrice?: number;
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

const ipad11Options = {
  colors: ["Silver", "Blue", "Pink", "Yellow"],
  sims: ["Wi-Fi", "LTE"],
  storages: ["128GB", "256GB"],
};

const iphone17ProImages = {
  "Cosmic Orange": [
    "/products/iphone-17-pro-cosmic-orange-1.png",
    "/products/iphone-17-pro-cosmic-orange-2.png",
    "/products/iphone-17-pro-cosmic-orange-3.png",
    "/products/iphone-17-pro-cosmic-orange-4.png",
    "/products/iphone-17-pro-cosmic-orange-5.png",
  ],
  "Deep Blue": [
    "/products/iphone-17-pro-deep-blue-1.png",
    "/products/iphone-17-pro-deep-blue-2.png",
    "/products/iphone-17-pro-deep-blue-3.png",
    "/products/iphone-17-pro-deep-blue-4.png",
    "/products/iphone-17-pro-deep-blue-5.png",
  ],
  Silver: [
    "/products/iphone-17-pro-silver-1.png",
    "/products/iphone-17-pro-silver-2.png",
    "/products/iphone-17-pro-silver-3.png",
    "/products/iphone-17-pro-silver-4.png",
    "/products/iphone-17-pro-silver-5.png",
  ],
};

const iphone17Images = {
  Black: [
    "/products/iphone-17-black-1.png",
    "/products/iphone-17-black-2.png",
    "/products/iphone-17-black-3.png",
    "/products/iphone-17-black-4.png",
    "/products/iphone-17-black-5.png",
  ],
  White: [
    "/products/iphone-17-white-1.png",
    "/products/iphone-17-white-2.png",
    "/products/iphone-17-white-3.png",
    "/products/iphone-17-white-4.png",
    "/products/iphone-17-white-5.png",
  ],
  Sage: [
    "/products/iphone-17-sage-1.png",
    "/products/iphone-17-sage-2.png",
    "/products/iphone-17-sage-3.png",
    "/products/iphone-17-sage-4.png",
    "/products/iphone-17-sage-5.png",
  ],
  "Mist Blue": [
    "/products/iphone-17-mist-blue-1.png",
    "/products/iphone-17-mist-blue-2.png",
    "/products/iphone-17-mist-blue-3.png",
    "/products/iphone-17-mist-blue-4.png",
    "/products/iphone-17-mist-blue-5.png",
  ],
  Lavender: [
    "/products/iphone-17-lavender-1.png",
    "/products/iphone-17-lavender-2.png",
    "/products/iphone-17-lavender-3.png",
    "/products/iphone-17-lavender-4.png",
    "/products/iphone-17-lavender-5.png",
  ],
};

const iphoneAirImages = {
  "Light Gold": [
    "/products/iphone-air-light-gold-1.png",
    "/products/iphone-air-light-gold-2.png",
    "/products/iphone-air-light-gold-3.png",
    "/products/iphone-air-light-gold-4.png",
    "/products/iphone-air-light-gold-5.png",
  ],
  "Sky Blue": [
    "/products/iphone-air-sky-blue-1.png",
    "/products/iphone-air-sky-blue-2.png",
    "/products/iphone-air-sky-blue-3.png",
    "/products/iphone-air-sky-blue-4.png",
    "/products/iphone-air-sky-blue-5.png",
  ],
  "Cloud White": [
    "/products/iphone-air-cloud-white-1.png",
    "/products/iphone-air-cloud-white-2.png",
    "/products/iphone-air-cloud-white-3.png",
    "/products/iphone-air-cloud-white-4.png",
    "/products/iphone-air-cloud-white-5.png",
  ],
  "Space Black": [
    "/products/iphone-air-space-black-1.png",
    "/products/iphone-air-space-black-2.png",
    "/products/iphone-air-space-black-3.png",
    "/products/iphone-air-space-black-4.png",
    "/products/iphone-air-space-black-5.png",
  ],
};

const iphone16Images = {
  Black: [
    "/products/iphone-16-black-1.png",
    "/products/iphone-16-black-2.png",
    "/products/iphone-16-black-3.png",
    "/products/iphone-16-black-4.png",
    "/products/iphone-16-black-5.png",
    "/products/iphone-16-black-6.png",
  ],
  White: [
    "/products/iphone-16-white-1.png",
    "/products/iphone-16-white-2.png",
    "/products/iphone-16-white-3.png",
    "/products/iphone-16-white-4.png",
    "/products/iphone-16-white-5.png",
    "/products/iphone-16-white-6.png",
  ],
  Pink: [
    "/products/iphone-16-pink-1.png",
    "/products/iphone-16-pink-2.png",
    "/products/iphone-16-pink-3.png",
    "/products/iphone-16-pink-4.png",
    "/products/iphone-16-pink-5.png",
    "/products/iphone-16-pink-6.png",
  ],
  Teal: [
    "/products/iphone-16-teal-1.png",
    "/products/iphone-16-teal-2.png",
    "/products/iphone-16-teal-3.png",
    "/products/iphone-16-teal-4.png",
    "/products/iphone-16-teal-5.png",
    "/products/iphone-16-teal-6.png",
  ],
  Ultramarine: [
    "/products/iphone-16-ultramarine-1.png",
    "/products/iphone-16-ultramarine-2.png",
    "/products/iphone-16-ultramarine-3.png",
    "/products/iphone-16-ultramarine-4.png",
    "/products/iphone-16-ultramarine-5.png",
    "/products/iphone-16-ultramarine-6.png",
  ],
};

const ipad11Images = {
  Silver: [
    "/products/ipad-11-a16-silver-1.png",
    "/products/ipad-11-a16-silver-2.png",
    "/products/ipad-11-a16-silver-3.png",
  ],
  Blue: [
    "/products/ipad-11-a16-blue-1.png",
    "/products/ipad-11-a16-blue-2.png",
    "/products/ipad-11-a16-blue-3.png",
  ],
  Pink: [
    "/products/ipad-11-a16-pink-1.png",
    "/products/ipad-11-a16-pink-2.png",
    "/products/ipad-11-a16-pink-3.png",
  ],
  Yellow: [
    "/products/ipad-11-a16-yellow-1.png",
    "/products/ipad-11-a16-yellow-2.png",
    "/products/ipad-11-a16-yellow-3.png",
  ],
};

function getAirPodsImages(name: string) {
  if (name.includes("AirPods Pro 3")) {
    return {
      "": [
        "/products/airpods-pro-3-1.png",
        "/products/airpods-pro-3-2.png",
        "/products/airpods-pro-3-3.png",
        "/products/airpods-pro-3-4.png",
      ],
    };
  }

  if (name.includes("AirPods Pro 2")) {
    return {
      "": [
        "/products/airpods-pro-2-1.png",
        "/products/airpods-pro-2-2.png",
        "/products/airpods-pro-2-3.png",
        "/products/airpods-pro-2-4.png",
        "/products/airpods-pro-2-5.png",
        "/products/airpods-pro-2-6.png",
      ],
    };
  }

  if (name.includes("ANC")) {
    return {
      "": [
        "/products/airpods-4-anc-1.png",
        "/products/airpods-4-anc-2.png",
        "/products/airpods-4-anc-3.png",
        "/products/airpods-4-anc-4.png",
      ],
    };
  }

  if (name.includes("AirPods 4")) {
    return {
      "": [
        "/products/airpods-4-1.png",
        "/products/airpods-4-2.png",
        "/products/airpods-4-3.png",
      ],
    };
  }

  return undefined;
}

const products: Product[] = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone Air",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPad 11 A16 (2025)",
  "AirPods Pro 3",
  "AirPods Pro 2",
  "AirPods 4 (Без шумоподавления)",
  "AirPods 4 ANC (С шумоподавлением)",
].map((name, index) => ({
  accent: index % 3 === 0 ? "orange" : index % 3 === 1 ? "blue" : "silver",
  brand: "Apple",
  category: name.includes("AirPods") ? "AirPods" : name === "iPad 11 A16 (2025)" ? "iPad" : "iPhone",
  color:
    name.includes("AirPods")
      ? ""
      : 
    name === "iPhone 17 Pro Max"
      ? "Silver"
      : name === "iPhone 17"
        ? "Mist Blue"
        : name === "iPhone Air"
          ? "Light Gold"
          : name === "iPhone 16 Plus"
            ? "Pink"
            : name === "iPhone 16"
              ? "Ultramarine"
              : name === "iPad 11 A16 (2025)"
                ? "Silver"
                : "Cosmic Orange",
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
        : name === "iPhone Air"
          ? iphoneAirImages
          : name === "iPhone 16" || name === "iPhone 16 Plus"
            ? iphone16Images
            : name === "iPad 11 A16 (2025)"
              ? ipad11Images
              : undefined,
  name,
  price: "цена по запросу",
  sim: name.includes("AirPods") ? "" : name === "iPad 11 A16 (2025)" ? "Wi-Fi" : name === "iPhone 16" || name === "iPhone 16 Plus" ? "Nano-SIM + eSIM" : "Dual eSIM",
  status: "В наличии",
  storage: name.includes("AirPods") ? "" : name === "iPhone 16" || name === "iPhone 16 Plus" || name === "iPad 11 A16 (2025)" ? "128GB" : "256GB",
  variantOptions:
    name.includes("AirPods")
      ? undefined
      : name === "iPhone 17 Pro Max"
      ? iphoneProMaxOptions
      : name === "iPhone 17"
        ? iphone17Options
        : name === "iPhone Air"
          ? iphoneAirOptions
          : name === "iPhone 16"
            ? iphone16Options
            : name === "iPhone 16 Plus"
              ? iphone16PlusOptions
              : name === "iPad 11 A16 (2025)"
                ? ipad11Options
                : iphoneOptions,
}));

const categories = ["Все", "iPhone", "AirPods", "iPad", "Apple Watch"];
const showcaseCategories = ["iPhone", "AirPods", "iPad", "Apple Watch"];
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
      {category === "iPhone" || category === "iPad" || imageSrc ? (
        <img
          src={imageSrc ?? "/appsale-product.png"}
          alt={imageAlt ?? ""}
          onError={(event) => {
            event.currentTarget.src = "/appsale-product.png";
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

function getCartKey(product: Product) {
  return [product.id, product.color, product.storage, product.sim ?? ""].join("|");
}

function getPriceKey(product: Pick<Product, "color" | "name" | "sim" | "storage">) {
  return [product.name, product.storage, product.color, product.sim ?? ""].join("|");
}

function getProductPrice(product: Pick<Product, "color" | "name" | "price" | "sim" | "storage">) {
  return productPriceOverrides[getPriceKey(product)]?.price ?? product.price;
}

function getProductSpecs(product: Product) {
  return [product.storage, product.color, product.sim, product.price].filter(Boolean).join(" · ");
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

function removeLastRuPhoneDigit(value: string) {
  const digits = getRuPhoneDigits(value);
  const nextDigits = digits.length > 1 ? digits.slice(0, -1) : "7";

  return formatRuPhone(nextDigits);
}

export default function Home() {
  const recentlyAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSelections, setProductSelections] = useState<Record<number, ProductSelection>>({
    ...Object.fromEntries(
      products.map((product) => [
        product.id,
        {
          color: product.color,
          sim: product.sim ?? "",
          storage: product.storage,
        },
      ]),
    ),
  });
  const [productImageIndexes, setProductImageIndexes] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
      const stored = JSON.parse(savedCart) as Array<{ color?: string; id: number; key?: string; qty: number; sim?: string; storage?: string }>;
      const items = stored
        .map((item) => {
          const product = products.find((entry) => entry.id === item.id);
          if (!product) return null;

          const configuredProduct = {
            ...product,
            color: item.color ?? product.color,
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
          sim: item.product.sim,
          storage: item.product.storage,
        })),
      ),
    );
  }, [cart]);

  useEffect(() => {
    return () => {
      if (recentlyAddedTimer.current) {
        clearTimeout(recentlyAddedTimer.current);
      }
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        activeCategory === "Все" || (activeCategory === "Под заказ" ? product.status === "Под заказ" : product.category === activeCategory);
      const searchMatches =
        !query || [product.name, product.category, product.color, product.storage, product.sim].filter(Boolean).join(" ").toLowerCase().includes(query);

      return categoryMatches && searchMatches;
    });
  }, [activeCategory, catalogQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + parsePrice(item.product.price) * item.qty, 0);

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

    return product.imagesByColor?.[selectedColor] ?? ["/appsale-product.png"];
  }

  function getProductImage(product: Product) {
    const images = getProductImages(product);
    const imageIndex = productImageIndexes[product.id] ?? 0;

    return images[imageIndex] ?? images[0] ?? "/appsale-product.png";
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
    setProductSelections((current) => ({
      ...current,
      [productId]: {
        color: current[productId]?.color ?? products.find((product) => product.id === productId)?.color ?? "",
        sim: current[productId]?.sim ?? products.find((product) => product.id === productId)?.sim ?? "",
        storage: current[productId]?.storage ?? products.find((product) => product.id === productId)?.storage ?? "",
        [field]: value,
      },
    }));

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

    if (checkoutForm.contactMethod === "Telegram" && !checkoutForm.telegram.trim()) {
      setAccountStatus("Укажите Telegram, если хотите связь через Telegram.");
      return;
    }

    if (checkoutForm.deliveryMethod === "Доставка по городу" && !checkoutForm.cityAddress.trim()) {
      setAccountStatus("Укажите адрес доставки по городу.");
      return;
    }

    if (checkoutForm.deliveryMethod === "СДЭК по России" && (!checkoutForm.sdekCity.trim() || !checkoutForm.sdekPoint.trim())) {
      setAccountStatus("Для СДЭК укажите город получения и адрес ПВЗ.");
      return;
    }

    setIsSending(true);
    setAccountStatus("");

    try {
      const response = await fetch("/api/order", {
        body: JSON.stringify({
          comment: checkoutForm.comment.trim(),
          name: checkoutForm.name.trim(),
          phone: checkoutForm.phone.trim(),
          telegram: checkoutForm.telegram.trim(),
          product: "Корзина appsale store",
          storage: `${cartCount} поз.`,
          contactMethod: checkoutForm.contactMethod,
          deliveryMethod: checkoutForm.deliveryMethod,
          deliveryAddress: checkoutForm.deliveryMethod === "Доставка по городу" ? checkoutForm.cityAddress.trim() : "",
          sdekCity: checkoutForm.deliveryMethod === "СДЭК по России" ? checkoutForm.sdekCity.trim() : "",
          sdekPoint: checkoutForm.deliveryMethod === "СДЭК по России" ? checkoutForm.sdekPoint.trim() : "",
          items: cart.map((item) => ({
            color: item.product.color,
            name: item.product.name,
            price: item.product.price,
            qty: item.qty,
            sim: item.product.sim,
            storage: item.product.storage,
          })),
          total: `${cartTotal} ₽`,
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

      setAccountStatus("Корзина отправлена в Telegram.");
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
          <img className="brandLogo" src="/appsale-logo.png" alt="" />
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
          <img src="/appsale-hero.png" alt="appsale store: iPhone в цветах Deep Blue, Desert Orange и Silver Titanium" />
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
          <strong>Оригинальная техника</strong>
          <p>Только официальные устройства</p>
        </div>
        <div>
          <span className="trustIcon checkIcon" />
          <strong>Поможем с выбором</strong>
          <p>Подберем устройство под ваши задачи</p>
        </div>
        <div>
          <span className="trustIcon checkIcon" />
          <strong>Быстрая доставка</strong>
          <p>По всей России</p>
        </div>
      </section>

      <section className="catalogSection" id="catalog">
        <div className="sectionHead">
          <div>
            <span>Каталог</span>
            <h2>Популярные товары</h2>
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
                    <div>
                      <span>Память</span>
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
                  </div>
                ) : null}
                <footer>
                  <b>{product.price}</b>
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
                  <p>{[product.storage, product.color, product.sim].filter(Boolean).join(" · ")}</p>
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
                      <span>Память</span>
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
            <p>Заполните контакты и способ получения заказа.</p>
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
              <strong>{cartTotal.toLocaleString("ru-RU")} ₽</strong>
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
              {["Самовывоз", "Доставка по городу", "СДЭК по России"].map((method) => (
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
            {checkoutForm.deliveryMethod === "Доставка по городу" ? (
              <div className="deliveryFields">
                <label>
                  Адрес доставки
                  <input
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, cityAddress: event.target.value }))}
                    placeholder="Город, улица, дом, квартира"
                    value={checkoutForm.cityAddress}
                  />
                </label>
              </div>
            ) : null}
            {checkoutForm.deliveryMethod === "СДЭК по России" ? (
              <div className="deliveryFields">
                <label>
                  Город получения
                  <input
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, sdekCity: event.target.value }))}
                    placeholder="Например: Санкт-Петербург"
                    value={checkoutForm.sdekCity}
                  />
                </label>
                <label>
                  Адрес ПВЗ СДЭК
                  <input
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, sdekPoint: event.target.value }))}
                    placeholder="Улица и номер пункта выдачи"
                    value={checkoutForm.sdekPoint}
                  />
                </label>
              </div>
            ) : null}
            <label>
              Комментарий к заказу
              <textarea
                onChange={(event) => setCheckoutForm((current) => ({ ...current, comment: event.target.value }))}
                placeholder="Например: связаться после 18:00, нужен другой город доставки"
                value={checkoutForm.comment}
              />
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
    </main>
  );
}

