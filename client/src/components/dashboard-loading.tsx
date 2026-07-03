import { Skeleton } from "@/components/ui/skeleton";

function SummaryCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-4">
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-6" />
        </div>
      </div>
    </div>
  );
}

function ColumnSkeleton({ taskCount }: { taskCount: number }) {
  return (
    <div className="flex flex-col gap-2 md:h-full">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 shrink-0 rounded-sm" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex min-h-24 flex-col gap-3 rounded-lg bg-white p-4 md:h-full">
        {Array.from({ length: taskCount }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="flex h-screen w-full flex-col overflow-hidden"
    >
      <header className="mx-auto flex w-full max-w-screen-xl shrink-0 flex-row items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-5 w-32 lg:h-6 lg:w-36" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-md" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-100">
        <div className="mx-auto w-full max-w-screen-xl shrink-0 py-5">
          <div className="flex flex-row items-center justify-between gap-4 px-5">
            <Skeleton className="h-6 w-48 lg:h-7 lg:w-72" />
            <Skeleton className="h-10 w-28 shrink-0" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-5 px-5 pb-5 md:flex-1">
          <section className="grid shrink-0 grid-cols-3 gap-4">
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </section>

          <section className="grid grid-cols-1 gap-6 md:flex-1 md:grid-cols-3 md:items-stretch">
            <ColumnSkeleton taskCount={1} />
            <ColumnSkeleton taskCount={1} />
            <ColumnSkeleton taskCount={1} />
          </section>
        </div>
      </div>
    </main>
  );
}
