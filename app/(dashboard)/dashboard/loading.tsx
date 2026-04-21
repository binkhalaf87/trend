function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-[24px] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="rounded-[32px] border border-white/40 bg-card/80 p-6 shadow-sm">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-5 h-12 w-64" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
        <SkeletonBlock className="mt-2 h-4 w-3/4 max-w-xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-20 w-full" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-white/40 bg-card/80 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-10 w-20" />
                <SkeletonBlock className="h-3 w-32" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6 shadow-sm">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-[28px] border border-border/60 p-4">
                  <SkeletonBlock className="h-6 w-24" />
                  <SkeletonBlock className="mt-4 h-6 w-2/3" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-4/5" />
                  <SkeletonBlock className="mt-5 h-2 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6 shadow-sm">
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-[24px] border border-border/60 p-4">
                  <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-4/5" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#221b40] p-6 shadow-sm">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="mt-5 h-8 w-40" />
            <SkeletonBlock className="mt-2 h-4 w-28" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-full" />
              ))}
            </div>
            <SkeletonBlock className="mt-6 h-11 w-full rounded-full" />
          </div>

          <div className="rounded-[32px] border border-white/40 bg-card/80 p-6 shadow-sm">
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-20 w-full" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
