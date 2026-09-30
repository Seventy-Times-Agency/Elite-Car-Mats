"use client";

import { useT } from "@/i18n/I18nProvider";
import { channelLabel, channelTone } from "@/lib/analytics/channel-label";

const TONE: Record<ReturnType<typeof channelTone>, string> = {
  paid: "text-sky-300 border-sky-300/30",
  shop: "text-emerald-300 border-emerald-300/30",
  free: "text-text-dim border-border",
  none: "text-text-faint border-border/60",
};

export function ChannelChip({ channel }: { channel: string | null | undefined }) {
  const t = useT();
  return (
    <span
      className={`whitespace-nowrap text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${TONE[channelTone(channel)]}`}
    >
      {channelLabel(t, channel)}
    </span>
  );
}
