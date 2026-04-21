"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="err-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E8C068" />
              <stop offset="1" stopColor="#B8912E" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="none" stroke="#2C2C2C" strokeWidth="2" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#err-grad)" strokeWidth="2" strokeDasharray="20 12" opacity="0.6" />
          <path
            d="M100 60 L100 110 M100 130 L100 138"
            stroke="url(#err-grad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        <h1 className="text-2xl lg:text-3xl font-bold mb-3">Что-то пошло не так</h1>
        <p className="text-text-dim text-sm leading-relaxed mb-6">
          Мы уже знаем об ошибке. Попробуйте обновить страницу или вернуться на главную.
        </p>
        {error.digest && (
          <p className="text-text-faint text-[11px] font-mono mb-6">
            ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold px-5 py-3 rounded-xl shadow-[0_4px_18px_rgba(212,165,74,0.25)]"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="glass-card text-text-dim hover:text-gold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
