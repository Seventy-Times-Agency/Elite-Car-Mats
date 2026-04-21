export default function Loading() {
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-3 w-40 bg-border/30 rounded animate-pulse mb-8" />
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-12 bg-border/30 rounded animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-border/30 rounded animate-pulse" />
            <div className="h-3 w-32 bg-border/20 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl glass-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
