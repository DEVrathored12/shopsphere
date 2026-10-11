import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LocateFixed, MapPin, Search, X, ArrowRight, Loader2, ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debouncedCity = useDebounce(cityInput, 500);
  const panelRef = useRef();

  // Geocode suggestions
  useEffect(() => {
    if (debouncedCity.length < 3) { setSuggestions([]); return; }
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
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedCity]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s) => {
    onManualPick({ latitude: s.latitude, longitude: s.longitude }, s.label.split(",")[0].trim());
    setCityInput("");
    setSuggestions([]);
    setOpen(false);
  };

  const handleLocate = () => {
    onLocate();
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-2 bg-white hover:border-accent hover:bg-accent/5 transition-colors text-sm font-medium text-primary"
      >
        <MapPin className="w-4 h-4 text-accent shrink-0" />
        <span className="max-w-[160px] truncate">{coords ? label || "Location set" : "Set location"}</span>
        {coords && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            onKeyDown={(e) => e.key === "Enter" && handleClear()}
            className="ml-1 text-secondary hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-2xl shadow-xl z-30 w-80 overflow-hidden">
          {/* GPS option */}
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors border-b border-border disabled:opacity-60"
          >
            {locating
              ? <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
              : <LocateFixed className="w-4 h-4 text-accent shrink-0" />}
            <div className="text-left">
              <p className="text-sm font-medium text-primary">{locating ? "Detecting your location…" : "Use my current location"}</p>
              <p className="text-xs text-secondary">Uses your device GPS</p>
            </div>
          </button>

          {/* City search */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
              <Search className="w-4 h-4 text-secondary shrink-0" />
              <input
                autoFocus
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search city or area…"
                className="flex-1 text-sm outline-none text-primary placeholder:text-secondary/60"
              />
              {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary shrink-0" />}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="max-h-52 overflow-y-auto">
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

          {/* Empty hint */}
          {cityInput.length > 0 && cityInput.length < 3 && (
            <p className="px-4 py-3 text-xs text-secondary">Type at least 3 characters to search…</p>
          )}
          {cityInput.length >= 3 && !searching && suggestions.length === 0 && (
            <p className="px-4 py-3 text-xs text-secondary">No locations found. Try a different name.</p>
          )}
        </div>
      )}
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
              <ShopCard key={shop._id} shop={shop}
                favorite={favorites.shopIds.has(String(shop._id))}
                onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)} />
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
              <ProductCard key={product._id} product={product}
                favorite={favorites.productIds.has(String(product._id))}
                onToggleFavorite={(next) => favorites.toggleProduct(String(product._id), next)} />
            ))}
          </div>
        )}
      </Section>

      {/* ================= RECOMMENDED NEAR YOU ================= */}
      <Section
        title="Recommended Near You"
        action={
          <LocationPicker
            coords={coords}
            label={label}
            locating={locating}
            onLocate={locate}
            onManualPick={save}
            onClear={clear}
          />
        }
      >
        <p className="text-xs text-secondary -mt-1 mb-3">
          {coords
            ? `Showing shops near ${label || "your location"}, sorted by distance.`
            : "Set your location to see nearby shops with distance."}
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
