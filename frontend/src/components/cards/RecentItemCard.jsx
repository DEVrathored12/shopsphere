import { Link } from "react-router-dom";
import { X, Store, ImageOff } from "lucide-react";
import Badge from "../ui/Badge";
import Rating from "../ui/Rating";
import { formatPrice } from "../../utils/format";
import { cn } from "../../lib/cn";

/**
 * Renders one entry from recentlyViewedService — a lightweight
 * snapshot captured at view time, not a live shop/product document.
 */
export default function RecentItemCard({ item, onRemove, className }) {
  const { type, id, snapshot = {} } = item;
  const href = type === "shop" ? `/shop/${id}` : `/product/${id}`;

  return (
    <div className={cn("relative group bg-white border border-border rounded-2xl overflow-hidden", className)}>
      <Link to={href} className="block">
        <div className="relative aspect-square bg-border/40 overflow-hidden">
          {snapshot.image ? (
            <img src={snapshot.image} alt={snapshot.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {type === "shop" ? (
                <Store className="w-7 h-7 text-secondary/50" />
              ) : (
                <ImageOff className="w-7 h-7 text-secondary/50" />
              )}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-primary line-clamp-1">{snapshot.name || "Untitled"}</h3>
          {type === "shop" ? (
            <>
              {snapshot.category && <p className="text-xs text-secondary mt-0.5">{snapshot.category}</p>}
              <div className="flex items-center justify-between mt-1.5">
                <Rating value={snapshot.rating} count={snapshot.totalReviews} />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-accent mt-1">{formatPrice(snapshot)}</p>
              {snapshot.availability === "out_of_stock" && (
                <Badge tone="danger" className="mt-1">
                  Out of stock
                </Badge>
              )}
              {snapshot.shopName && <p className="text-xs text-secondary mt-1 line-clamp-1">{snapshot.shopName}</p>}
            </>
          )}
        </div>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove({ type, id })}
          aria-label="Remove from recently viewed"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-border flex items-center justify-center text-secondary hover:text-danger transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
