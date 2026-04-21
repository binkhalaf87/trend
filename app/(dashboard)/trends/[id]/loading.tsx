function Skeleton({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-[24px] ${className}`} />;
}

export default function TrendDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-card/80 p-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-5 h-10 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-2xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            <Skeleton className="mt-6 h-[320px] w-full" />
          </div>
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
            <Skeleton className="h-6 w-36" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
            <Skeleton className="h-6 w-44" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
            <Skeleton className="h-6 w-52" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
            <Skeleton className="h-6 w-32" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
