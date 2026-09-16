import { Heart } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Presentational save/favorite toggle. Fully controlled so it can sit
 * on top of any data source — local state today, the /favorites API
 * once that endpoint is implemented on the backend.
 */
export default function FavoriteButton({ active = false, onToggle, size = "md", className }) {
  const dims = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.(!active);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-border shadow-sm transition-transform hover:scale-105",
        dims,
        className
      )}
    >
      <Heart className={cn("w-4 h-4 transition-colors", active ? "fill-danger text-danger" : "text-secondary")} />
    </button>
  );
}
