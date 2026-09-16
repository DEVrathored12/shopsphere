import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Phone, MessageCircle, Navigation, MapPin, LocateFixed, Store } from "lucide-react";

import PhotoGallery from "../../components/gallery/PhotoGallery";
import FavoriteButton from "../../components/favorites/FavoriteButton";
import { Button, Badge, Rating, LoadingSkeleton, ErrorState } from "../../components/ui";

import { fetchProductById } from "../../services/productService";
import { recordView } from "../../services/recentlyViewedService";
import { useAsync } from "../../hooks/useAsync";
import { useFavorites } from "../../hooks/useFavorites";
import { useGeolocation } from "../../hooks/useGeolocation";
import { formatPrice, formatDistance, buildWhatsAppUrl, buildDirectionsUrl } from "../../utils/format";

const PRICE_TYPE_LABEL = {
  fixed: "Fixed Price",
  starting_from: "Starting From",
  contact_shop: "Contact for Price",
};

export default function ProductDetail() {
  const { productId } = useParams();
  const favorites = useFavorites();
  const { coords, loading: locating, locate } = useGeolocation();

  const { data, loading, error, retry } = useAsync(
    () => fetchProductById(productId, coords ? { lat: coords.latitude, lng: coords.longitude } : {}),
    [productId, coords?.latitude, coords?.longitude]
  );

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="skeleton rounded-2xl aspect-square w-full" />
          <LoadingSkeleton count={2} className="grid-cols-1" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-16">
        <ErrorState onRetry={retry} />
      </div>
    );
  }

  const { product, distanceKm } = data;
  const shop = product.shopId;
  const inStock = product.availability === "available";
  const isFavorite = favorites.productIds.has(String(product._id));
  const distanceLabel = formatDistance(distanceKm);
  const location = [shop?.area, shop?.city].filter(Boolean).join(", ");

  useEffect(() => {
    recordView({
      type: "product",
      id: product._id,
      snapshot: {
        name: product.name,
        image: product.images?.[0],
        price: product.price,
        priceType: product.priceType,
        availability: product.availability,
        shopName: shop?.shopName,
        shopId: shop?._id,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);
  const [lng, lat] = shop?.location?.coordinates || [0, 0];
  const hasCoords = Boolean(lat || lng);
  const waText = `Hi, I'm interested in "${product.name}" I saw on ShopSphere.`;

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* ================= GALLERY ================= */}
        <PhotoGallery images={product.images} alt={product.name} className="grid-cols-2 sm:grid-cols-2" thumbClassName="aspect-square" />

        {/* ================= INFO ================= */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">{product.name}</h1>
            <FavoriteButton active={isFavorite} onToggle={(next) => favorites.toggleProduct(String(product._id), next)} />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <span className="text-2xl font-semibold text-accent">{formatPrice(product)}</span>
            <Badge tone="neutral">{PRICE_TYPE_LABEL[product.priceType] || "Fixed Price"}</Badge>
            <Badge tone={inStock ? "success" : "danger"}>{inStock ? "Available" : "Out of stock"}</Badge>
          </div>

          {shop && (
            <div className="flex items-center gap-1.5 text-sm text-secondary mt-3">
              <MapPin className="w-4 h-4 shrink-0" />
              <Link to={`/shop/${shop._id}`} className="hover:text-accent hover:underline">
                {shop.shopName}
              </Link>
              {location && <span>· {location}</span>}
            </div>
          )}

          <div className="mt-1.5">
            {distanceLabel ? (
              <p className="text-sm text-secondary">{distanceLabel}</p>
            ) : (
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline disabled:opacity-60"
              >
                <LocateFixed className="w-3.5 h-3.5" /> {locating ? "Locating…" : "See distance from you"}
              </button>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-secondary leading-relaxed mt-5 whitespace-pre-line">{product.description}</p>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-primary mb-1.5">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Badge key={size} tone="neutral">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-primary mb-1.5">Colors</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Badge key={color} tone="neutral">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* ================= CONTACT ACTIONS ================= */}
          {shop && (
            <div className="flex flex-wrap gap-2.5 mt-6">
              {shop.phone && (
                <Button icon={Phone} onClick={() => { window.location.href = `tel:${shop.phone}`; }}>
                  Call Shop
                </Button>
              )}
              {(shop.whatsapp || shop.phone) && (
                <Button
                  variant="secondary"
                  icon={MessageCircle}
                  onClick={() => window.open(buildWhatsAppUrl(shop.whatsapp || shop.phone, waText), "_blank", "noopener")}
                >
                  WhatsApp
                </Button>
              )}
              <Button
                variant="outline"
                icon={Navigation}
                onClick={() =>
                  window.open(
                    buildDirectionsUrl(hasCoords ? { latitude: lat, longitude: lng } : { address: `${shop.address || ""}, ${location}` }),
                    "_blank",
                    "noopener"
                  )
                }
              >
                Directions
              </Button>
            </div>
          )}

          {/* ================= SHOP PREVIEW ================= */}
          {shop && (
            <Link
              to={`/shop/${shop._id}`}
              className="flex items-center gap-3 mt-8 p-4 rounded-2xl border border-border bg-background hover:shadow-sm transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-border/40 shrink-0 flex items-center justify-center">
                {shop.coverImage ? (
                  <img src={shop.coverImage} alt={shop.shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-secondary/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary line-clamp-1">{shop.shopName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Rating value={shop.rating} count={shop.totalReviews} />
                </div>
                {location && <p className="text-xs text-secondary mt-0.5 line-clamp-1">{location}</p>}
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                View Shop
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
