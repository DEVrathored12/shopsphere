import { Link } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import Rating from "../ui/Rating";
import Badge from "../ui/Badge";
import FavoriteButton from "../favorites/FavoriteButton";
import { formatDistance, isShopOpenNow } from "../../utils/format";
import { cn } from "../../lib/cn";

/**
 * Shop summary card used on the homepage, /explore, and category pages.
 * `shop` is a Shop document as returned by the API (categoryId populated).
 */
export default function ShopCard({ shop, favorite, onToggleFavorite, className }) {
  const open = isShopOpenNow(shop.openingHours);
  const distanceLabel = formatDistance(shop.distanceKm);
  const location = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <Link
      to={`/shop/${shop._id}`}
      className={cn(
        "group block bg-white border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] bg-border/40 overflow-hidden">
        {shop.coverImage ? (
          <img
            src={shop.coverImage}
            alt={shop.shopName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-8 h-8 text-secondary/50" />
          </div>
        )}
        <FavoriteButton
          active={favorite}
          onToggle={onToggleFavorite}
          className="absolute top-3 right-3"
        />
        {open !== null && (
          <Badge tone={open ? "success" : "danger"} className="absolute top-3 left-3 bg-white/90">
            {open ? "Open now" : "Closed"}
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-primary line-clamp-1">{shop.shopName}</h3>
        </div>
        {shop.categoryId?.name && (
          <p className="text-xs text-secondary mt-0.5">{shop.categoryId.name}</p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <Rating value={shop.rating} count={shop.totalReviews} />
          {distanceLabel && <span className="text-xs text-secondary">{distanceLabel}</span>}
        </div>
        {location && (
          <p className="flex items-center gap-1 text-xs text-secondary mt-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
