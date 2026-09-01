"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, MatSetType } from "@/types";
import {
  findModelById,
  getVehicleProfile,
  thirdRowAvailable,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";

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
  /**
   * False until localStorage has been read on the client. Pages that
   * branch on "cart is empty" should render a neutral state until this
   * flips, instead of flashing the empty-cart screen.
   */
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const VALID_PROFILES = [
  "standard",
  "minivan",
  "twoSeater",
  "pickup",
  "semi",
] as VehicleConfigProfile[];

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
    // Drop items whose mat set is no longer sold for that vehicle —
    // stale carts from before profile-aware sets would otherwise 400
    // the whole checkout ("Mat set front is not available for …").
    // Unknown modelIds (admin custom catalog) are kept as-is; the
    // server validates those against the merged catalog.
    let item = it as unknown as CartItem;
    // Drop a stored profile we don't recognize (schema drift).
    if (
      item.profile !== undefined &&
      !VALID_PROFILES.includes(item.profile)
    ) {
      item = { ...item, profile: undefined };
    }
    const model = findModelById(it.modelId as string);
    if (model) {
      const profile = getVehicleProfile(model);
      if (!MAT_SETS_BY_PROFILE[profile].some((s) => s.type === it.matSet)) {
        continue;
      }
      // Refresh the stored profile from the current catalog — the code
      // catalog is source of truth for models it knows about.
      if (item.profile !== profile) item = { ...item, profile };
      // A catalog update can reclassify a model into a profile where the
      // third-row add-on no longer applies (`full` survives the matSet
      // check for both standard and minivan). Strip the stale flag —
      // sending `thirdRow: true` would 400 the whole checkout.
      if (
        item.thirdRow === true &&
        !thirdRowAvailable(profile, item.matSet as MatSetType)
      ) {
        item = { ...item, thirdRow: false };
      }
    }
    out.push(item);
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

/** Same-configuration predicate used for cart line merging. */
function sameConfig(a: CartItem, b: Omit<CartItem, "id">): boolean {
  return (
    a.modelId === b.modelId &&
    a.year === b.year &&
    a.matSet === b.matSet &&
    a.color.id === b.color.id &&
    a.edgeColor.id === b.edgeColor.id &&
    a.badge?.id === b.badge?.id &&
    (a.badge ? (a.badgeCount ?? 1) : 0) === (b.badge ? (b.badgeCount ?? 1) : 0) &&
    (a.heelPad ?? false) === (b.heelPad ?? false) &&
    (a.thirdRow ?? false) === (b.thirdRow ?? false)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Two-phase init: the server (and the first client render) always see
  // an empty cart, localStorage is read in an effect. Reading it in a
  // lazy useState initialiser guaranteed a hydration mismatch for every
  // returning visitor with a non-empty cart (header badge, /cart,
  // /checkout, aria-labels all differed from the server HTML).
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage (an external system) — the
    // setState here is exactly the "subscribe to external state" case;
    // reading it in the useState initialiser instead is what caused the
    // hydration-mismatch bug this replaces.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prev) => {
      const stored = loadCart();
      if (prev.length === 0) return stored;
      // A very fast click can add an item before this effect runs —
      // merge it on top of the stored cart instead of dropping either.
      const merged = [...stored];
      for (const it of prev) {
        const idx = merged.findIndex((m) => sameConfig(m, it));
        if (idx >= 0) {
          merged[idx] = {
            ...merged[idx],
            quantity: Math.min(99, merged[idx].quantity + it.quantity),
          };
        } else if (merged.length < MAX_CART_ITEMS) {
          merged.push(it);
        }
      }
      return merged;
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Don't persist the pre-hydration empty state — that first
    // `items = []` render would wipe the saved cart before it's loaded.
    if (!hydrated) return;
    saveCart(items);
  }, [items, hydrated]);

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
      const existing = prev.find((i) => sameConfig(i, item));
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
    // Persist synchronously, not via the hydration-gated effect: on the
    // success page (full document load from the Stripe redirect) the
    // child's clearCart effect runs BEFORE this provider's hydration
    // effect — which would then "restore" the paid-for cart straight
    // from the untouched localStorage.
    saveCart([]);
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
        hydrated,
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
