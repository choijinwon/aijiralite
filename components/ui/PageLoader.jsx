// components/ui/PageLoader.jsx
'use client';

import Loading from './Loading';
import { SkeletonCard, SkeletonList } from './Skeleton';

export default function PageLoader({ variant = 'spinner', count = 3 }) {
  if (variant === 'spinner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <SkeletonList count={count} />
        </div>
      </div>
    );
  }

  return null;
}

