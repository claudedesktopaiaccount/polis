export default function PrieskumyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Heading skeleton */}
      <div className="mb-6">
        <div className="h-7 w-72 bg-neutral-200 rounded" />
        <div className="mt-2 h-4 w-96 bg-neutral-100 rounded" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 bg-neutral-200 rounded-lg" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 bg-neutral-100 rounded-2xl mb-8" />

      {/* Bar chart skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
