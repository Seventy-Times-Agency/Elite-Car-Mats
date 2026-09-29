"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import {
  adsAllowed,
  hasGpcSignal,
  setConsent,
  CONSENT_EVENT,
} from "@/lib/consent";

/**
 * The "Do Not Sell or Share" control the footer link points at. One click
 * opts the visitor out of ad measurement on this browser; a GPC signal
 * is shown as already honored and can't be switched back here.
 */
export function PrivacyChoices() {
  const t = useT();
  const [state, setState] = useState<"on" | "off" | "gpc" | null>(null);

  useEffect(() => {
    const update = () =>
      setState(hasGpcSignal() ? "gpc" : adsAllowed() ? "on" : "off");
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  if (!state) return null;

  return (
    <div className="not-prose my-4 rounded-xl border border-gold/20 bg-surface p-4">
      <p className="text-sm text-text mb-3">
        {state === "gpc"
          ? t("privacy.choices.gpc")
          : state === "off"
            ? t("privacy.choices.off")
            : t("privacy.choices.on")}
      </p>
      {state !== "gpc" && (
        <button
          type="button"
          onClick={() => setConsent(state === "on" ? "rejected" : "accepted")}
          className={
            state === "on"
              ? "rounded-lg bg-gradient-to-r from-gold to-gold-light px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bg"
              : "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-dim hover:text-text"
          }
        >
          {state === "on" ? t("privacy.choices.optOut") : t("privacy.choices.optIn")}
        </button>
      )}
    </div>
  );
}
