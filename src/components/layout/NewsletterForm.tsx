"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed");
      }
      setState("success");
      setEmail("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  if (state === "success") {
    return (
      <div className="text-sm text-text-dim">
        <span className="text-gold">✓</span> You&apos;re in. We&apos;ll email you the moment we launch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          aria-label="Email for subscription"
          disabled={state === "loading"}
          className="flex-1 min-w-0 glass-card rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "loading" || !email}
          className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-4 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.2)] hover:shadow-[0_4px_18px_rgba(212,165,74,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "..." : "OK"}
        </button>
      </div>
      {error && <p className="text-[11px] text-error">{error}</p>}
      <p className="text-[10px] text-text-faint">
        One email at launch. No spam, ever.
      </p>
    </form>
  );
}
