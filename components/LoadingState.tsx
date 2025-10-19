/**
 * Reusable loading state component for async operations
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading state
 */
export function LoadingPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for product grid
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
