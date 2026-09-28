"use client";

import { useT } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/pricing";

export interface OrderEventView {
  type: string;
  /** Parsed OrderEvent.detail JSON. */
  detail: Record<string, string | number | null> | null;
  at: string;
}

/**
 * Stripe decline/error codes → plain reason keys. Anything unmapped
 * falls back to Stripe's own message, which is already human-readable
 * (English).
 */
const DECLINE_KEYS: Record<string, string> = {
  insufficient_funds: "admin.declineFunds",
  card_declined: "admin.declineGeneric",
  generic_decline: "admin.declineGeneric",
  do_not_honor: "admin.declineGeneric",
  incorrect_cvc: "admin.declineCvc",
  invalid_cvc: "admin.declineCvc",
  expired_card: "admin.declineExpired",
  incorrect_number: "admin.declineNumber",
  invalid_number: "admin.declineNumber",
  authentication_required: "admin.decline3ds",
  payment_intent_authentication_failure: "admin.decline3ds",
  processing_error: "admin.declineProcessing",
  lost_card: "admin.declineFraud",
  stolen_card: "admin.declineFraud",
  fraudulent: "admin.declineFraud",
  card_velocity_exceeded: "admin.declineLimit",
  withdrawal_count_limit_exceeded: "admin.declineLimit",
};

const DOT: Record<string, string> = {
  created: "bg-text-faint",
  checkout_opened: "bg-gold/70",
  payment_failed: "bg-error",
  paid: "bg-success",
  expired: "bg-text-faint",
  async_failed: "bg-error",
  status: "bg-gold/40",
};

export function PaymentHistory({
  events,
  statusLabel,
}: {
  events: OrderEventView[];
  statusLabel: (status: string) => string;
}) {
  const t = useT();
  if (events.length === 0) {
    return <p className="text-[11px] text-text-faint">{t("admin.historyEmpty")}</p>;
  }

  const describe = (e: OrderEventView): string => {
    const d = e.detail ?? {};
    const amount = typeof d.amount === "number" ? formatPrice(d.amount) : "";
    switch (e.type) {
      case "created":
        return t("admin.evCreated", {
          amount: typeof d.total === "number" ? formatPrice(d.total) : "",
        });
      case "checkout_opened":
        return t("admin.evCheckout");
      case "payment_failed": {
        const code = String(d.decline ?? d.code ?? "");
        const key = DECLINE_KEYS[code];
        const reason = key ? t(key) : String(d.message ?? code ?? "");
        return t("admin.evFailed", { reason });
      }
      case "paid":
        return t("admin.evPaid", { amount });
      case "expired":
        return t("admin.evExpired");
      case "async_failed":
        return t("admin.evAsyncFailed");
      case "status":
        return t("admin.evStatus", {
          from: statusLabel(String(d.from ?? "")),
          to: statusLabel(String(d.to ?? "")),
        });
      default:
        return e.type;
    }
  };

  return (
    <ol className="space-y-1.5">
      {events.map((e, i) => (
        <li key={i} className="flex items-start gap-2.5 text-xs">
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${DOT[e.type] ?? "bg-text-faint"}`}
            aria-hidden
          />
          <span className="text-text-faint tabular-nums shrink-0 w-[92px]">
            {new Date(e.at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className={e.type === "payment_failed" ? "text-error" : "text-text-dim"}>
            {describe(e)}
          </span>
        </li>
      ))}
    </ol>
  );
}
