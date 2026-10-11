import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LocateFixed, MapPin, Search, X, ArrowRight, Loader2 } from "lucide-react";

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
import { useDebounce } from "../../hooks/useDebounce";
import { usePersistedLocation } from "../../hooks/usePersistedLocation";

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ── Location Picker ───────────────────────────────────────────────────────────
function LocationPicker({ coords, label, locating, onLocate, onManualPick, onClear }) {
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedCity = useDebounce(cityInput, 500);
  const dropdownRef = useRef();

  useEffect(() => {
    if (debouncedCity.length < 3) { setSuggestions([]); setOpen(false); return; }
    let cancelled = false;
    setSearching(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedCity)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data.map((r) => ({
          label: r.display_name.split(",").slice(0, 3).join(", "),
          latitude: parseFloat(r.lat),
          longitude: parseFloat(r.lon),
        })));
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedCity]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s) => {
    onManualPick({ latitude: s.latitude, longitude: s.longitude }, s.label.split(",")[0].trim());
    setCityInput("");
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Row: GPS + active badge */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          className="inline-flex items-center gap-2 bg-accent text-white rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {locating
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <LocateFixed className="w-4 h-4" />}
          {locating ? "Detecting…" : "Use my location"}
        </button>

        {coords && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
            <MapPin className="w-3 h-3 text-green-600" />
            {label || "Location set"}
            <button type="button" onClick={onClear} className="ml-0.5 hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Row: manual city/area search */}
      <div className="relative" ref={dropdownRef}>
        <p className="text-xs text-secondary mb-1.5">Or search by city / area:</p>
        <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-accent max-w-sm">
          <Search className="w-4 h-4 text-secondary shrink-0" />
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="e.g. Bandra, Koramangala, Connaught Place…"
            className="flex-1 text-sm outline-none text-primary placeholder:text-secondary/50"
          />
          {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary shrink-0" />}
          {cityInput && !searching && (
            <button type="button" onClick={() => { setCityInput(""); setSuggestions([]); setOpen(false); }}>
              <X className="w-3.5 h-3.5 text-secondary hover:text-primary" />
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 w-full max-w-sm overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickSuggestion(s)}
                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent/5 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-primary line-clamp-2">{s.label}</span>
              </button>
            ))}
          </div>
        )}
        {cityInput.length >= 3 && !searching && suggestions.length === 0 && (
          <p className="text-xs text-secondary mt-1.5">No locations found. Try a different name.</p>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const favorites = useFavorites();
  const { coords, label, locating, locate, save, clear } = usePersistedLocation();

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

  const isLoading = recent.loading || favoritesData.loading;
  const totalFavorites = favoriteShops.length + favoriteProducts.length;

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
        {greetingWord()}, {user?.name?.split(" ")[0] || "there"} 👋
      </h1>

      {/* ── Personal stats bar ── */}
      {!isLoading && (
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Recently Viewed", value: recentItems.length, to: "/recently-viewed", show: recentItems.length > 0 },
            { label: "Favourite Shops", value: favoriteShops.length, to: "/favorites", show: totalFavorites > 0 },
            { label: "Favourite Products", value: favoriteProducts.length, to: "/favorites", show: totalFavorites > 0 },
          ]
            .filter((s) => s.show)
            .map(({ label, value, to }) => (
              <Link key={label} to={to}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm hover:border-accent/50 transition-colors">
                <span className="font-bold text-accent">{value}</span>
                <span className="text-secondary">{label}</span>
              </Link>
            ))}
        </div>
      )}

      <div className="mt-5 max-w-xl">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} placeholder="What are you looking for today?" size="md" />
      </div>

      {/* ================= RECENTLY VIEWED ================= */}
      {(recent.loading || recentItems.length > 0) && (
        <Section title="Continue Browsing" viewAllTo={recentItems.length > 0 ? "/recently-viewed" : null}>
          {recent.loading && <LoadingSkeleton count={4} />}
          {!recent.loading && recentItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentItems.map((item) => (
                <RecentItemCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ================= FAVORITE SHOPS ================= */}
      {(favoritesData.loading || favoriteShops.length > 0) && (
        <Section title="Favourite Shops" viewAllTo={favoriteShops.length > 0 ? "/favorites" : null}>
          {favoritesData.loading && <LoadingSkeleton count={4} className="grid-cols-2 sm:grid-cols-4" />}
          {!favoritesData.loading && favoritesData.error && <ErrorState onRetry={favoritesData.retry} />}
          {!favoritesData.loading && favoriteShops.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {favoriteShops.map((shop) => (
                <ShopCard key={shop._id} shop={shop}
                  favorite={favorites.shopIds.has(String(shop._id))}
                  onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ================= FAVORITE PRODUCTS ================= */}
      {(favoritesData.loading || favoriteProducts.length > 0) && (
        <Section title="Favourite Products" viewAllTo={favoriteProducts.length > 0 ? "/favorites" : null}>
          {favoritesData.loading && <LoadingSkeleton count={4} />}
          {!favoritesData.loading && favoriteProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {favoriteProducts.map((product) => (
                <ProductCard key={product._id} product={product}
                  favorite={favorites.productIds.has(String(product._id))}
                  onToggleFavorite={(next) => favorites.toggleProduct(String(product._id), next)} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ================= NEW USER CTA (only when nothing saved yet) ================= */}
      {!isLoading && recentItems.length === 0 && totalFavorites === 0 && (
        <div className="mt-8 rounded-3xl border border-border bg-background p-8 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <h2 className="font-display text-xl font-bold text-primary mb-1">Start exploring</h2>
          <p className="text-secondary text-sm mb-5">Browse local shops and products — your recently viewed and favourites will appear here.</p>
          <Link to="/explore"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            Explore now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ================= RECOMMENDED NEAR YOU ================= */}
      <Section title="Recommended Near You">
        <LocationPicker
          coords={coords}
          label={label}
          locating={locating}
          onLocate={locate}
          onManualPick={save}
          onClear={clear}
        />
        <p className="text-xs text-secondary mt-3 mb-4">
          {coords
            ? `Showing shops near ${label || "your location"}, sorted by distance.`
            : "Use GPS or type a city / area name to find nearby shops."}
        </p>
        {nearby.loading && <LoadingSkeleton count={4} className="grid-cols-2 sm:grid-cols-4" />}
        {!nearby.loading && nearby.error && <ErrorState onRetry={nearby.retry} />}
        {!nearby.loading && !nearby.error && nearbyShops.length === 0 && (
          <EmptyState title="No shops found nearby." />
        )}
        {!nearby.loading && nearbyShops.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {nearbyShops.map((shop) => (
              <ShopCard key={shop._id} shop={shop}
                favorite={favorites.shopIds.has(String(shop._id))}
                onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)} />
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
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {viewAllTo && (
            <Link to={viewAllTo} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
