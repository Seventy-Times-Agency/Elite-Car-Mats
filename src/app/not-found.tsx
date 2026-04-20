import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl lg:text-8xl font-bold text-gold/30 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Страница не найдена</h1>
        <p className="text-text-dim text-sm mb-8">
          Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold px-5 py-3 rounded-xl"
          >
            На главную
          </Link>
          <Link
            href="/catalog"
            className="glass-card text-text-dim hover:text-gold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            Каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
