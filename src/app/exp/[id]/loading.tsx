import { Skeleton } from "@/components/skeleton";

export default function ExperimentLoading() {
  return (
    <div className="min-h-screen" aria-hidden="true">
      {/* Desktop Sidebar Skeleton */}
      <aside className="fixed left-2 z-20 h-[100dvh] w-[320px] p-4 pl-2 pr-2 hidden lg:block">
        <div className="relative flex flex-col h-full w-full overflow-hidden rounded-3xl bg-[var(--muted)] text-[15px]">
          {/* Sidebar Header */}
          <div className="pt-6 pl-4 pb-4">
            <Skeleton width={36} height={36} className="rounded-xl" />
          </div>

          {/* Sort Dropdown Skeleton */}
          <div className="px-4 pt-16">
            <Skeleton width={100} height={20} className="rounded" />
          </div>

          {/* Section Header */}
          <div className="flex items-center gap-3 px-4 pt-8 pb-4">
            <Skeleton width={48} height={1} className="rounded" />
            <Skeleton width={100} height={16} className="rounded" />
          </div>

          {/* Experiments List Skeleton */}
          <nav className="flex flex-col gap-0.5 pb-8 px-2 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5 px-2"
              >
                <Skeleton width={40} height={1} className="rounded" />
                <Skeleton width={120 + (i % 3) * 20} height={14} className="rounded" />
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Info Panel Skeleton */}
      <aside className="fixed left-0 top-0 z-10 h-[100dvh] w-[420px] border-r border-[var(--border)] bg-[var(--background)] hidden lg:block">
        <div className="h-full flex flex-col p-8 pt-24">
          {/* Experiment Number */}
          <Skeleton width={60} height={24} className="rounded mb-4" />

          {/* Title */}
          <Skeleton width="80%" height={32} className="rounded-lg mb-4" />

          {/* Description */}
          <div className="space-y-2 mb-8">
            <Skeleton width="100%" height={16} className="rounded" />
            <Skeleton width="90%" height={16} className="rounded" />
            <Skeleton width="70%" height={16} className="rounded" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-8">
            <Skeleton width={60} height={28} className="rounded-lg" />
            <Skeleton width={80} height={28} className="rounded-lg" />
            <Skeleton width={50} height={28} className="rounded-lg" />
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 mt-auto">
            <Skeleton width={40} height={40} className="rounded-xl" />
            <Skeleton width={40} height={40} className="rounded-xl" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen flex flex-col lg:ml-[420px]">
        {/* Top Bar Skeleton */}
        <header className="fixed top-6 right-6 z-[99]">
          <div className="flex items-center gap-1.5 bg-[var(--muted)] rounded-2xl p-1.5 border border-[var(--border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={32} height={32} className="rounded-[16px]" />
            ))}
          </div>
        </header>

        {/* Canvas Area Skeleton */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <Skeleton className="w-full max-w-5xl aspect-video rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
