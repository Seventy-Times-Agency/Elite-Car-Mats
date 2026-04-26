"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactsPage() {
  const t = useT();
  const input =
    "w-full glass-card rounded-xl px-4 py-3.5 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none focus:shadow-[0_0_0_1px_rgba(212,165,74,0.3)] transition-all";

  const contacts = [
    { l: t("contacts.emailLabel"), v: "info@elitecarmats.us", h: "mailto:info@elitecarmats.us" },
    { l: t("contacts.addressLabel"), v: t("contacts.addressValue") },
  ];

  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!name || !email || message.length < 5) {
      setStatus("error");
      setErrMsg(t("contacts.errInvalid"));
      return;
    }
    setStatus("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}) as { error?: string });
        setStatus("error");
        setErrMsg(data?.error ?? t("contacts.errGeneric"));
      }
    } catch {
      setStatus("error");
      setErrMsg(t("contacts.errGeneric"));
    }
  }

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">{t("contacts.label")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">{t("contacts.title")}</h1>
          <p className="mt-3 text-text-dim">{t("contacts.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {contacts.map((c) => (
              <div key={c.l} className="glass-card rounded-xl p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">{c.l}</div>
                {c.h ? (
                  <a href={c.h} className="text-text hover:text-gold transition-colors font-medium">{c.v}</a>
                ) : (
                  <div className="text-text font-medium">{c.v}</div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              required
              maxLength={120}
              placeholder={t("contacts.namePlaceholder")}
              className={input}
              disabled={status === "sending"}
            />
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              placeholder={t("contacts.emailPlaceholder")}
              className={input}
              disabled={status === "sending"}
            />
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={4000}
              placeholder={t("contacts.messagePlaceholder")}
              rows={5}
              className={input + " resize-none"}
              disabled={status === "sending"}
            />
            {status === "sent" && (
              <p className="text-[12px] text-gold">{t("contacts.sentOk")}</p>
            )}
            {status === "error" && errMsg && (
              <p className="text-[12px] text-error">{errMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? t("contacts.sending") : t("contacts.sendBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
