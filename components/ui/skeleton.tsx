import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-purple-950/60 relative overflow-hidden',
        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent',
        'after:-translate-x-full after:animate-[shimmer_1.8s_infinite]',
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton shapes for common patterns
function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 rounded-md', className)} />;
}

function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-purple-900/40 bg-[#12082b]/60 p-5 space-y-4', className)}>
      {children || (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <SkeletonText className="w-full" />
          <SkeletonText className="w-4/5" />
          <SkeletonText className="w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' }[size];
  return <Skeleton className={cn('rounded-xl shrink-0', s)} />;
}

function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn('h-5 w-16 rounded-full', className)} />;
}

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-xl border border-purple-900/30', className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-1/3" />
        <SkeletonText className="w-1/5 h-3" />
      </div>
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-7 w-14 rounded-lg" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonBadge, SkeletonRow };
