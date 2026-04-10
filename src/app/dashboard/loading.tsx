import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4 mb-8 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
