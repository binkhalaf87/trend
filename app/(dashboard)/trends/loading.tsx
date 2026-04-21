function Skeleton({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-[24px] ${className}`} />;
}

export default function TrendsLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/40 bg-card/80 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-5 h-10 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/40 bg-card/80 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-white/40 bg-card/80 p-5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-5 h-2 w-full" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
