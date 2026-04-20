export default function Loading() {
  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="h-8 w-40 bg-border/30 rounded mx-auto animate-pulse" />
          <div className="h-4 w-60 bg-border/20 rounded mx-auto mt-3 animate-pulse" />
        </div>
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="h-3 w-16 bg-border/30 rounded animate-pulse" />
          <div className="h-6 w-48 bg-border/30 rounded mt-3 animate-pulse" />
          <div className="h-1.5 bg-border/20 rounded mt-6 animate-pulse" />
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
          <div className="h-16 bg-border/10 rounded mt-4 animate-pulse" />
          <div className="h-16 bg-border/10 rounded mt-3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
