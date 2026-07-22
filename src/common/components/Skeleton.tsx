export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`bg-slate-800 rounded animate-pulse ${className}`} />;
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-12 h-12 rounded-icon bg-slate-800 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 w-2/3 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}
