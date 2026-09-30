export default function Loading() {
  return (
    <div className="admin-root min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:ml-[232px]">
      <div className="h-6 w-32 bg-border/40 rounded animate-pulse mb-6" />
      <div className="admin-card overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-border last:border-b-0 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
