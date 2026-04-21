export default function Loading() {
  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-24 bg-border/30 rounded animate-pulse mb-3" />
        <div className="h-10 w-72 bg-border/30 rounded animate-pulse mb-10" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[5/4] rounded-xl bg-gradient-to-b from-[#1A1A1A] to-[#131313] border border-border/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
