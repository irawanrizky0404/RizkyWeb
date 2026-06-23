interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/5 ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-rule p-4 space-y-3">
      <Skeleton className="w-full h-48" />
      <Skeleton className="w-2/3 h-6" />
      <Skeleton className="w-1/3 h-4" />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="h-[100svh] min-h-[560px] bg-black relative">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-12 space-y-4">
        <Skeleton className="h-32 w-64" />
        <Skeleton className="h-32 w-96" />
      </div>
    </div>
  );
}
