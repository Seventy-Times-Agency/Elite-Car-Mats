"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";
import { makeT, type TFn, type Dict } from "./dictionary";

interface I18nCtx {
  locale: Locale;
  t: TFn;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({
  locale,
  dict,
  fallback,
  children,
}: {
  locale: Locale;
  dict: Dict;
  fallback: Dict;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const t = useMemo(() => makeT(dict, fallback), [dict, fallback]);

  const setLocale = useCallback(
    (l: Locale) => {
      // 1 year cookie
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nCtx>(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback for tests / stories
    const t = makeT({}, {});
    return { locale: DEFAULT_LOCALE, t, setLocale: () => {} };
  }
  return v;
}

export function useT(): TFn {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
