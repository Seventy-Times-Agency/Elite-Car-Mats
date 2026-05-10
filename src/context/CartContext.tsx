"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemsCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "elitecarmats-cart";
const CART_SCHEMA_VERSION = 2;
// Hard-cap so a future bug in `addItem` can't run away into the GBs.
const MAX_CART_ITEMS = 50;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/**
 * Defensive parse — drops items that don't have the shape current code
 * expects. After a schema bump (e.g. adding `matSetLabel`), older saved
 * carts would otherwise crash render at the first `localizeMatSet(...)`.
 */
function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  // v1 stored a plain array; v2+ stores `{ v, items }`. Treat anything we
  // don't recognize as a fresh cart.
  let candidate: unknown;
  if (Array.isArray(parsed)) {
    candidate = parsed;
  } else if (isObject(parsed) && Array.isArray(parsed.items)) {
    candidate = parsed.items;
  } else {
    return [];
  }
  const out: CartItem[] = [];
  for (const it of candidate as unknown[]) {
    if (!isObject(it)) continue;
    if (
      typeof it.id !== "string" ||
      typeof it.modelId !== "string" ||
      typeof it.brandName !== "string" ||
      typeof it.modelName !== "string" ||
      typeof it.year !== "number" ||
      typeof it.matSet !== "string" ||
      typeof it.matSetLabel !== "string" ||
      typeof it.quantity !== "number" ||
      !isObject(it.color) ||
      !isObject(it.edgeColor)
    ) {
      continue;
    }
    out.push(it as unknown as CartItem);
    if (out.length >= MAX_CART_ITEMS) break;
  }
  return out;
}

function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ v: CART_SCHEMA_VERSION, items }),
    );
  } catch {
    // QuotaExceeded etc. — silently ignore; in-memory state still works.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: load the cart synchronously on first render so we
  // don't have a "first render = []" flash that lets a fast-clicker drop
  // their saved cart between mount and the load effect.
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Lock body scroll while the drawer is open. Capture the original value
  // once at component mount — re-running on every isOpen flip would otherwise
  // capture "hidden" the second time and "restore" to hidden on unmount.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.modelId === item.modelId &&
          i.year === item.year &&
          i.matSet === item.matSet &&
          i.color.id === item.color.id &&
          i.edgeColor.id === item.edgeColor.id &&
          i.badge?.id === item.badge?.id &&
          (i.heelPad ?? false) === (item.heelPad ?? false),
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      if (prev.length >= MAX_CART_ITEMS) return prev;
      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    const safe = Math.min(99, Math.floor(quantity));
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: safe } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemsCount,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
