import { Star } from "lucide-react";
import { cn } from "../../lib/cn";

/** Read-only star rating with optional numeric value and review count. */
export default function Rating({ value = 0, count, size = "sm", className }) {
  const starSize = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(starSize, "fill-accent text-accent")} />
      <span className="text-sm font-medium text-primary">{value ? value.toFixed(1) : "New"}</span>
      {typeof count === "number" && (
        <span className="text-xs text-secondary">({count})</span>
      )}
    </div>
  );
}
