import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'circle';
  count?: number;
  className?: string;
}

function SkeletonItem({ variant = 'card', className = '' }: { variant?: 'card' | 'text' | 'circle'; className?: string }) {
  if (variant === 'circle') {
    return (
      <div
        className={['animate-pulse rounded-full bg-gray-200 h-12 w-12', className].join(' ')}
        aria-hidden="true"
      />
    );
  }
  if (variant === 'text') {
    return (
      <div
        className={['animate-pulse rounded bg-gray-200 h-4 w-full', className].join(' ')}
        aria-hidden="true"
      />
    );
  }
  // card variant
  return (
    <div
      className={['animate-pulse rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3', className].join(' ')}
      aria-hidden="true"
    >
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="flex gap-2 mt-1">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="h-9 bg-gray-200 rounded w-1/2 mt-2" />
    </div>
  );
}

export function LoadingSkeleton({ variant = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} variant={variant} className={className} />
      ))}
    </>
  );
}
