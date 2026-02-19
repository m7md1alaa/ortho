import { Skeleton } from "@/components/ui/skeleton";

export function ListCardSkeleton() {
  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-9" />
      </div>

      <div className="mb-4 flex items-center gap-6 text-sm text-zinc-500">
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
