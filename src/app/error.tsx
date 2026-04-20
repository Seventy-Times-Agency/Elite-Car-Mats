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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4 opacity-40">⚠</div>
        <h1 className="text-2xl font-bold mb-3">Что-то пошло не так</h1>
        <p className="text-text-dim text-sm mb-8">
          Мы уже знаем об ошибке и разбираемся. Попробуйте обновить страницу.
        </p>
        {error.digest && (
          <p className="text-text-faint text-[11px] font-mono mb-6">
            ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold px-5 py-3 rounded-xl"
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
