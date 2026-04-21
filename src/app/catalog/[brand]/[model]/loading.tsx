export default function Loading() {
  return (
    <div>
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-3 w-48 bg-border/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="aspect-[4/3] glass-card rounded-xl animate-pulse" />
            <div className="flex gap-3 mt-4">
              <div className="h-16 flex-1 glass-card rounded-lg animate-pulse" />
              <div className="h-16 flex-1 glass-card rounded-lg animate-pulse" />
            </div>
          </div>
          <div>
            <div className="h-9 w-3/4 bg-border/30 rounded animate-pulse" />
            <div className="h-4 w-40 bg-border/20 rounded animate-pulse mt-3" />
            <div className="h-10 w-32 bg-border/30 rounded animate-pulse mt-4" />
            <div className="space-y-6 mt-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-24 bg-border/20 rounded animate-pulse mb-3" />
                  <div className="h-12 bg-border/15 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
