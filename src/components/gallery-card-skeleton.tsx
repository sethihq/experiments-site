import { Skeleton } from "./skeleton";

export function GalleryCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="block rounded-2xl p-2"
    >
      {/* Preview Thumbnail - matches h-52 (208px) from gallery-card */}
      <Skeleton className="h-52 rounded-xl" />

      {/* Title Row - matches px-1 pb-1 pt-3 gap-3 structure */}
      <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
        {/* Title placeholder */}
        <Skeleton width={100} height={16} className="rounded" />
        {/* Divider line */}
        <span className="flex-1 h-px bg-[var(--fg-06)]" />
        {/* Year placeholder */}
        <Skeleton width={32} height={16} className="rounded" />
      </div>
    </div>
  );
}
