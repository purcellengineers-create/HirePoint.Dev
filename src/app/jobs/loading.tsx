import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-32 mt-2" />
      </div>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="h-[400px] w-full lg:w-60 shrink-0" />
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
