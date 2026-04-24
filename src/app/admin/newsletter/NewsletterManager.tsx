"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
}

export function NewsletterManager({ initial }: { initial: Subscriber[] }) {
  const router = useRouter();
  const t = useT();
  const [busy, startBusy] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? initial.filter((s) =>
        s.email.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : initial;

  const remove = (id: string) => {
    if (!confirm(t("admin.newsletterConfirmDelete"))) return;
    startBusy(async () => {
      await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      router.refresh();
    });
  };

  if (initial.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center text-text-dim">
        {t("admin.newsletterEmpty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("admin.newsletterSearch")}
        className="w-full glass-card rounded-lg px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
      />
      <div className="glass-card rounded-xl divide-y divide-border/30">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="text-text text-sm truncate">{s.email}</div>
              <div className="text-text-faint text-xs mt-0.5">
                {s.source ? `${s.source} · ` : ""}
                {new Date(s.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => remove(s.id)}
              disabled={busy}
              className="text-xs text-text-dim hover:text-error uppercase tracking-wider"
            >
              {t("admin.newsletterDelete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
