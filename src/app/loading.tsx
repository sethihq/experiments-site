import { Skeleton } from "@/components/skeleton";
import { GalleryCardSkeleton } from "@/components/gallery-card-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center" aria-hidden="true">
      {/* Header Skeleton */}
      <header className="mt-[20vh] mb-[10vh] flex flex-col items-center">
        <div className="flex items-center gap-4">
          {/* GALLERY text */}
          <Skeleton width={160} height={48} className="rounded-lg" />
          {/* Line */}
          <Skeleton width={128} height={2} className="rounded" />
          {/* Count */}
          <Skeleton width={32} height={48} className="rounded-lg" />
        </div>
      </header>

      {/* Gallery Skeleton */}
      <section className="w-full max-w-5xl px-5">
        <div className="mb-16">
          {/* Year Label Skeleton */}
          <div className="my-3 px-5">
            <Skeleton width={140} height={16} className="rounded" />
          </div>

          {/* Grid - matches grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <GalleryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
