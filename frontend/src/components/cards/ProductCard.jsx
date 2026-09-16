import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import Badge from "../ui/Badge";
import FavoriteButton from "../favorites/FavoriteButton";
import { formatPrice, formatDistance } from "../../utils/format";
import { cn } from "../../lib/cn";

/**
 * Product summary card used on the homepage and /explore. `product`
 * is a Product document as returned by the API (shopId populated with
 * at least shopName when not filtered by a single shop).
 */
export default function ProductCard({ product, favorite, onToggleFavorite, className }) {
  const shopName = product.shopId?.shopName;
  const distanceLabel = formatDistance(product.distanceKm);
  const inStock = product.availability === "available";

  return (
    <Link
      to={`/product/${product._id}`}
      className={cn(
        "group block bg-white border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-square bg-border/40 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-7 h-7 text-secondary/50" />
          </div>
        )}
        <FavoriteButton
          active={favorite}
          onToggle={onToggleFavorite}
          size="sm"
          className="absolute top-2.5 right-2.5"
        />
        {!inStock && (
          <Badge tone="danger" className="absolute top-2.5 left-2.5 bg-white/90">
            Out of stock
          </Badge>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="text-sm font-medium text-primary line-clamp-1">{product.name}</h3>
        <p className="text-sm font-semibold text-accent mt-1">{formatPrice(product)}</p>
        {shopName && <p className="text-xs text-secondary mt-1 line-clamp-1">{shopName}</p>}
        {distanceLabel && <p className="text-xs text-secondary">{distanceLabel}</p>}
      </div>
    </Link>
  );
}
