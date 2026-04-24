"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface Review {
  id: string;
  customerName: string;
  carModel: string;
  text: string;
  rating: number;
  photos: string[];
  approved: boolean;
  createdAt: string;
}

export function ReviewsManager({ initial }: { initial: Review[] }) {
  const router = useRouter();
  const t = useT();
  const [busy, startBusy] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending",
  );

  const filtered = initial.filter((r) =>
    filter === "all"
      ? true
      : filter === "pending"
        ? !r.approved
        : r.approved,
  );

  const toggle = (id: string, approved: boolean) => {
    startBusy(async () => {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm(t("admin.reviewsConfirmDelete"))) return;
    startBusy(async () => {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-1 inline-flex">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
              filter === f ? "bg-gold/15 text-gold" : "text-text-dim"
            }`}
          >
            {t(`admin.reviewsFilter.${f}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-text-dim">
          {t("admin.reviewsEmpty")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-text font-semibold">
                      {r.customerName}
                    </span>
                    <span className="text-gold text-sm">
                      {"★".repeat(r.rating)}
                      <span className="text-text-faint">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </span>
                    <span className="text-text-faint text-xs">
                      {r.carModel}
                    </span>
                    {!r.approved && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-yellow-400/30 text-yellow-400">
                        {t("admin.reviewsStatusPending")}
                      </span>
                    )}
                    {r.approved && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-400/30 text-green-400">
                        {t("admin.reviewsStatusApproved")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text mt-2 whitespace-pre-line">
                    {r.text}
                  </p>
                  {r.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.photos.map((url, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-border/30"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-xs shrink-0">
                  {!r.approved ? (
                    <button
                      onClick={() => toggle(r.id, true)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg text-green-400 hover:bg-green-400/10 uppercase tracking-wider font-semibold"
                    >
                      {t("admin.reviewsApprove")}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggle(r.id, false)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg text-text-dim hover:bg-white/5 uppercase tracking-wider font-semibold"
                    >
                      {t("admin.reviewsUnapprove")}
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-lg text-error hover:bg-error/10 uppercase tracking-wider font-semibold"
                  >
                    {t("admin.reviewsDelete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
