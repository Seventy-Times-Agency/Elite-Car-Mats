"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * One row in the saved-for-later list. We persist enough to render the
 * /wishlist grid without a DB lookup, but on click we route the user
 * back into the configurator at /catalog/<brand>/<model> — saved items
 * are intentionally *unconfigured*: colour, year, set are picked at
 * order time, not here.
 */
export interface WishlistItem {
  modelId: string;
  brandSlug: string;
  modelSlug: string;
  brandName: string;
  modelName: string;
  bodyType?: string;
  /** Newest-first sort key. ISO timestamp. */
  savedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  has: (modelId: string) => boolean;
  toggle: (item: Omit<WishlistItem, "savedAt">) => void;
  remove: (modelId: string) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "ecm_wishlist_v1";
const MAX_ITEMS = 100;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isItem(x: unknown): x is WishlistItem {
  if (!isObject(x)) return false;
  return (
    typeof x.modelId === "string" &&
    typeof x.brandSlug === "string" &&
    typeof x.modelSlug === "string" &&
    typeof x.brandName === "string" &&
    typeof x.modelName === "string" &&
    typeof x.savedAt === "string"
  );
}

function load(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
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
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isItem).slice(0, MAX_ITEMS);
}

function save(items: WishlistItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota / privacy mode — silently no-op; UI keeps working in memory.
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  // Lazy init: read localStorage once on first render so a fast click
  // can't drop the saved list during the mount → effect gap. Same
  // pattern as CartContext.
  const [items, setItems] = useState<WishlistItem[]>(() => load());

  const persist = useCallback((next: WishlistItem[]) => {
    setItems(next);
    save(next);
  }, []);

  const has = useCallback(
    (modelId: string) => items.some((i) => i.modelId === modelId),
    [items],
  );

  const toggle = useCallback(
    (item: Omit<WishlistItem, "savedAt">) => {
      const exists = items.some((i) => i.modelId === item.modelId);
      if (exists) {
        persist(items.filter((i) => i.modelId !== item.modelId));
        return;
      }
      const next: WishlistItem = { ...item, savedAt: new Date().toISOString() };
      // Prepend newest, cap length
      persist([next, ...items].slice(0, MAX_ITEMS));
    },
    [items, persist],
  );

  const remove = useCallback(
    (modelId: string) => persist(items.filter((i) => i.modelId !== modelId)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<WishlistContextType>(
    () => ({ items, has, toggle, remove, clear, count: items.length }),
    [items, has, toggle, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist(): WishlistContextType {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used inside WishlistProvider");
  return v;
}
