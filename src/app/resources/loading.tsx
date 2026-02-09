import { Skeleton } from "@/components/skeleton";

function ResourceCardSkeleton() {
  return (
    <div className="block p-6 rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-02)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Skeleton width={160} height={20} className="rounded" />
          </div>
          {/* Description */}
          <div className="mt-2 space-y-1.5">
            <Skeleton width="100%" height={14} className="rounded" />
            <Skeleton width="80%" height={14} className="rounded" />
          </div>
          {/* Tags */}
          <div className="flex items-center gap-2 mt-4">
            <Skeleton width={50} height={24} className="rounded-md" />
            <Skeleton width={60} height={24} className="rounded-md" />
            <Skeleton width={45} height={24} className="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center" aria-hidden="true">
      {/* Header Skeleton */}
      <header className="mt-[20vh] mb-[10vh] flex flex-col items-center">
        <div className="flex items-center gap-4">
          {/* RESOURCES text */}
          <Skeleton width={200} height={48} className="rounded-lg" />
          {/* Line */}
          <Skeleton width={128} height={2} className="rounded" />
          {/* Count */}
          <Skeleton width={24} height={48} className="rounded-lg" />
        </div>
      </header>

      {/* Resources List Skeleton */}
      <section className="w-full max-w-3xl px-5">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
