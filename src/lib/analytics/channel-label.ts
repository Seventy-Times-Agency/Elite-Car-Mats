import type { TFn } from "@/i18n/dictionary";
import { CHANNELS, type Channel } from "@/lib/analytics/attribution";

const KNOWN = new Set<string>(CHANNELS);

/** Admin label for a stored channel; NULL = order predates attribution. */
export function channelLabel(t: TFn, channel: string | null | undefined): string {
  const key = channel && KNOWN.has(channel) ? (channel as Channel) : "unknown";
  return t(`admin.channel.${key}`);
}

/** Tone for the channel chip: paid, shop, organic/free, or unknown. */
export function channelTone(channel: string | null | undefined): "paid" | "shop" | "free" | "none" {
  switch (channel) {
    case "meta-ads":
    case "google-ads":
      return "paid";
    case "meta-shop":
    case "google-shopping":
    case "etsy":
      return "shop";
    case undefined:
    case null:
      return "none";
    default:
      return "free";
  }
}
