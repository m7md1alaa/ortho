import { Skeleton } from "@/components/ui/skeleton";

export function PracticeCardSkeleton() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Header Skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>

        {/* Main Card Skeleton */}
        <div className="border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12">
          {/* Word Display Skeleton */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>

          {/* Input Field Skeleton */}
          <div className="mb-6 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mx-auto flex max-w-md gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
