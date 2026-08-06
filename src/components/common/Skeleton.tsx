import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--muted)] rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-16" />
      <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  );
}
