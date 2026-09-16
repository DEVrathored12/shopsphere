import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, Package, ImageOff } from "lucide-react";

import { Rating, Badge, Button, LoadingSkeleton, EmptyState, ErrorState } from "../../components/ui";
import { fetchMyFavorites } from "../../services/favoriteService";
import { useAsync } from "../../hooks/useAsync";
import { useFavorites } from "../../hooks/useFavorites";
import { formatPrice } from "../../utils/format";

export default function Favorites() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("shops");
  const favorites = useFavorites();
  const { data, loading, error, retry } = useAsync(() => fetchMyFavorites(), []);

  // Filtering the fetched full documents against the live favorites
  // Sets means a "Remove" click hides the card immediately (optimistic,
  // via useFavorites) without needing to re-fetch this list.
  const shops = (data?.shops || []).filter((s) => favorites.shopIds.has(String(s._id)));
  const products = (data?.products || []).filter((p) => favorites.productIds.has(String(p._id)));
  const isEmpty = !loading && !error && shops.length === 0 && products.length === 0;

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Favorites</h1>

      {loading && <LoadingSkeleton count={6} />}
      {!loading && error && <ErrorState onRetry={retry} />}

      {isEmpty && (
        <EmptyState
          title="You haven't saved anything yet."
          action={{ label: "Explore Shops", onClick: () => navigate("/explore") }}
        />
      )}

      {!loading && !error && !isEmpty && (
        <>
          <div className="inline-flex bg-white border border-border rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab("shops")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === "shops" ? "bg-accent text-white" : "text-secondary hover:text-primary"
              }`}
            >
              <Store className="w-4 h-4" /> Shops ({shops.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("products")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === "products" ? "bg-accent text-white" : "text-secondary hover:text-primary"
              }`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
          </div>

          {tab === "shops" &&
            (shops.length === 0 ? (
              <EmptyState title="No favorite shops." action={{ label: "Explore Shops", onClick: () => navigate("/explore") }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shops.map((shop) => (
                  <FavoriteRow
                    key={shop._id}
                    href={`/shop/${shop._id}`}
                    image={shop.coverImage}
                    icon={Store}
                    title={shop.shopName}
                    subtitle={[shop.categoryId?.name, [shop.area, shop.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                    meta={<Rating value={shop.rating} count={shop.totalReviews} />}
                    onRemove={() => favorites.toggleShop(String(shop._id), false)}
                  />
                ))}
              </div>
            ))}

          {tab === "products" &&
            (products.length === 0 ? (
              <EmptyState title="No favorite products." action={{ label: "Explore Shops", onClick: () => navigate("/explore") }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <FavoriteRow
                    key={product._id}
                    href={`/product/${product._id}`}
                    image={product.images?.[0]}
                    icon={ImageOff}
                    title={product.name}
                    subtitle={product.shopId?.shopName}
                    meta={
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-accent">{formatPrice(product)}</span>
                        {product.availability === "out_of_stock" && <Badge tone="danger">Out of stock</Badge>}
                      </div>
                    }
                    onRemove={() => favorites.toggleProduct(String(product._id), false)}
                  />
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

function FavoriteRow({ href, image, icon: Icon, title, subtitle, meta, onRemove }) {
  return (
    <div className="flex gap-3 bg-white border border-border rounded-2xl p-3">
      <Link to={href} className="w-20 h-20 rounded-xl overflow-hidden bg-border/40 shrink-0 flex items-center justify-center">
        {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : <Icon className="w-6 h-6 text-secondary/50" />}
      </Link>
      <div className="flex-1 min-w-0 flex flex-col">
        <Link to={href} className="font-medium text-primary line-clamp-1 hover:text-accent">
          {title}
        </Link>
        {subtitle && <p className="text-xs text-secondary mt-0.5 line-clamp-1">{subtitle}</p>}
        <div className="mt-1.5">{meta}</div>
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            to={href}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-border text-sm font-medium text-primary px-3 py-1.5 hover:bg-background transition-colors"
          >
            View
          </Link>
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/5" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
