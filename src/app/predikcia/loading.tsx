export default function PredikciaLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Heading skeleton */}
      <div className="mb-6">
        <div className="h-7 w-56 bg-neutral-200 rounded" />
        <div className="mt-2 h-4 w-80 bg-neutral-100 rounded" />
      </div>

      {/* Probability cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-2xl" />
        ))}
      </div>

      {/* Seats chart skeleton */}
      <div className="h-72 bg-neutral-100 rounded-2xl" />
    </div>
  );
}
