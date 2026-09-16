import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LocateFixed, ArrowRight } from "lucide-react";

import SearchBar from "../../components/search/SearchBar";
import ShopCard from "../../components/cards/ShopCard";
import ProductCard from "../../components/cards/ProductCard";
import RecentItemCard from "../../components/cards/RecentItemCard";
import { LoadingSkeleton, EmptyState, ErrorState } from "../../components/ui";

import { fetchMyFavorites } from "../../services/favoriteService";
import { fetchShops } from "../../services/shopService";
import { getRecentlyViewed } from "../../services/recentlyViewedService";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { useGeolocation } from "../../hooks/useGeolocation";

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const favorites = useFavorites();
  const { coords, loading: locating, locate } = useGeolocation();

  const recent = useAsync(() => getRecentlyViewed(), []);
  const favoritesData = useAsync(() => fetchMyFavorites(), []);
  const nearby = useAsync(
    () =>
      fetchShops(
        coords
          ? { lat: coords.latitude, lng: coords.longitude, radius: 25, sort: "distance", limit: 8 }
          : { sort: "rating:desc", limit: 8 }
      ),
    [coords?.latitude, coords?.longitude]
  );

  const handleSearch = (value) => {
    const q = value.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  const recentItems = (recent.data || []).slice(0, 6);
  const favoriteShops = (favoritesData.data?.shops || []).slice(0, 4);
  const favoriteProducts = (favoritesData.data?.products || []).slice(0, 4);
  const nearbyShops = nearby.data?.shops || [];

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
        {greetingWord()}, {user?.name?.split(" ")[0] || "there"} 👋
      </h1>

      <div className="mt-5 max-w-xl">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} placeholder="What are you looking for today?" size="md" />
      </div>

      {/* ================= RECENTLY VIEWED ================= */}
      <Section title="Recently Viewed" viewAllTo={recentItems.length > 0 ? "/recently-viewed" : null}>
        {recent.loading && <LoadingSkeleton count={4} />}
        {!recent.loading && recentItems.length === 0 && (
          <EmptyState title="Nothing viewed yet." description="Shops and products you look at will show up here." />
        )}
        {!recent.loading && recentItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentItems.map((item) => (
              <RecentItemCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </Section>

      {/* ================= FAVORITE SHOPS ================= */}
      <Section title="Favorite Shops" viewAllTo={favoriteShops.length > 0 ? "/favorites" : null}>
        {favoritesData.loading && <LoadingSkeleton count={4} className="grid-cols-2 sm:grid-cols-4" />}
        {!favoritesData.loading && favoritesData.error && <ErrorState onRetry={favoritesData.retry} />}
        {!favoritesData.loading && !favoritesData.error && favoriteShops.length === 0 && (
          <EmptyState title="No favorite shops yet." action={{ label: "Explore Shops", onClick: () => navigate("/explore") }} />
        )}
        {!favoritesData.loading && favoriteShops.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favoriteShops.map((shop) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                favorite={favorites.shopIds.has(String(shop._id))}
                onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* ================= FAVORITE PRODUCTS ================= */}
      <Section title="Favorite Products" viewAllTo={favoriteProducts.length > 0 ? "/favorites" : null}>
        {favoritesData.loading && <LoadingSkeleton count={4} />}
        {!favoritesData.loading && !favoritesData.error && favoriteProducts.length === 0 && (
          <EmptyState title="No favorite products yet." action={{ label: "Explore Shops", onClick: () => navigate("/explore") }} />
        )}
        {!favoritesData.loading && favoriteProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                favorite={favorites.productIds.has(String(product._id))}
                onToggleFavorite={(next) => favorites.toggleProduct(String(product._id), next)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* ================= RECOMMENDED NEAR YOU ================= */}
      <Section
        title="Recommended Near You"
        action={
          !coords && (
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline disabled:opacity-60"
            >
              <LocateFixed className="w-3.5 h-3.5" /> {locating ? "Locating…" : "Use my location"}
            </button>
          )
        }
      >
        <p className="text-xs text-secondary -mt-2 mb-3">
          {coords ? "Nearby shops, closest first." : "Top-rated shops — share your location for results near you."}
        </p>
        {nearby.loading && <LoadingSkeleton count={4} className="grid-cols-2 sm:grid-cols-4" />}
        {!nearby.loading && nearby.error && <ErrorState onRetry={nearby.retry} />}
        {!nearby.loading && !nearby.error && nearbyShops.length === 0 && (
          <EmptyState title="No shops found nearby yet." />
        )}
        {!nearby.loading && nearbyShops.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {nearbyShops.map((shop) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                favorite={favorites.shopIds.has(String(shop._id))}
                onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, viewAllTo, action, children }) {
  return (
    <section className="mt-10 first:mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        {action}
      </div>
      {children}
    </section>
  );
}
