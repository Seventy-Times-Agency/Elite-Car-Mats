"use client";

import { useState } from "react";

export function CopyNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable; silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors"
      title="Copy number"
    >
      <span>{value}</span>
      <span className="text-[11px] text-text-faint">
        {copied ? "Copied ✓" : "Copy"}
      </span>
    </button>
  );
}
