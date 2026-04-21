interface Props {
  title: string;
  intro?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, intro, updatedAt, children }: Props) {
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 pb-8 border-b border-border/40">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          {intro && <p className="mt-4 text-text-dim text-base leading-relaxed">{intro}</p>}
          {updatedAt && (
            <p className="mt-4 text-text-faint text-xs uppercase tracking-[0.2em]">
              Last updated: {updatedAt}
            </p>
          )}
        </header>
        <article className="prose-content space-y-6 text-text-dim text-[15px] leading-relaxed">
          {children}
        </article>
      </div>
    </div>
  );
}
