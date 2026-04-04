export default function PredikciaLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Page heading skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-stone-200 dark:bg-stone-700" />
        <div className="mt-2 h-4 w-96 bg-stone-200 dark:bg-stone-700" />
      </div>

      {/* Split layout: probability bars left, parliament grid right */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 mb-12">
        {/* Win probability bars */}
        <div>
          <div className="h-5 w-48 bg-stone-200 dark:bg-stone-700 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="h-4 w-16 bg-stone-200 dark:bg-stone-700" />
                  <div className="h-7 w-14 bg-stone-200 dark:bg-stone-700" />
                </div>
                <div className="h-8 bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div
                    className="h-full bg-stone-300 dark:bg-stone-600"
                    style={{ width: `${75 - i * 8}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <div className="h-3 w-28 bg-stone-100 dark:bg-stone-800" />
                  <div className="h-3 w-10 bg-stone-100 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parliament grid placeholder */}
        <div className="mt-10 lg:mt-0">
          <div className="h-5 w-40 bg-stone-200 dark:bg-stone-700 mb-4" />
          <div className="h-72 bg-stone-200 dark:bg-stone-700" />
        </div>
      </div>

      {/* Detail table skeleton */}
      <div className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-6">
        <div className="h-5 w-48 bg-stone-200 dark:bg-stone-700 mb-4" />
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex gap-4 pb-2 border-b-2 border-stone-300 dark:border-stone-600">
            <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700" />
            <div className="ml-auto flex gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-12 bg-stone-200 dark:bg-stone-700" />
              ))}
            </div>
          </div>
          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-stone-300 dark:bg-stone-600 shrink-0" />
                <div className="h-3 w-28 bg-stone-200 dark:bg-stone-700" />
              </div>
              <div className="ml-auto flex gap-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-3 w-12 bg-stone-200 dark:bg-stone-700" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
