// components/ui/Skeleton.jsx
'use client';

export default function Skeleton({ className = '', variant = 'default' }) {
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-6 bg-gray-200 rounded w-3/4',
    avatar: 'h-10 w-10 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded w-24',
    image: 'h-48 bg-gray-200 rounded-lg'
  };

  return (
    <div className={`animate-pulse ${variants[variant]} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-5/6" />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

