"use client";

import { createContext, useContext, useMemo } from "react";
import type { PriceOverrideMap } from "@/lib/pricing";

/**
 * Admin price overrides for client-side price display. The root layout
 * loads them server-side (cached, tag `pricing`) and passes the entries
 * down, so every price the customer sees — product page, cart drawer,
 * cart page, checkout summary — matches what the server billing paths
 * (/api/orders, Stripe checkout) will actually charge. Before this
 * existed the client rendered code-default prices while the server
 * billed override prices, and any admin override made Stripe charge a
 * different amount than the site displayed.
 */
const PriceOverridesContext = createContext<PriceOverrideMap>(new Map());

export function PriceOverridesProvider({
  entries,
  children,
}: {
  entries: [string, number][];
  children: React.ReactNode;
}) {
  const map = useMemo(() => new Map(entries), [entries]);
  return (
    <PriceOverridesContext.Provider value={map}>
      {children}
    </PriceOverridesContext.Provider>
  );
}

export function usePriceOverrides(): PriceOverrideMap {
  return useContext(PriceOverridesContext);
}
