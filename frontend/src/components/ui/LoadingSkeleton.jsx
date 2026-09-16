import { cn } from "../../lib/cn";

/** Generic rectangular skeleton block. Compose these for custom skeletons. */
export function SkeletonBlock({ className }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

/** Skeleton matching ShopCard/ProductCard proportions. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <SkeletonBlock className="w-full aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Grid of card skeletons — drop in wherever cards are still loading. */
export default function LoadingSkeleton({ count = 4, className }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
