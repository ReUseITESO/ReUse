import Skeleton from '@/components/ui/Skeleton';

export default function CommentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
