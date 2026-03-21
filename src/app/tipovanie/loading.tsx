export default function TipovanieLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Heading skeleton */}
      <div className="mb-6">
        <div className="h-7 w-40 bg-neutral-200 rounded" />
        <div className="mt-2 h-4 w-72 bg-neutral-100 rounded" />
      </div>

      {/* Party selection grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />
        ))}
      </div>

      {/* Results bar skeleton */}
      <div className="h-48 bg-neutral-100 rounded-2xl" />
    </div>
  );
}
