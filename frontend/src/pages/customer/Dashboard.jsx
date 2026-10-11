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
import { useGeolocation } from "../../hooks/useGeolocation";
import { useDebounce } from "../../hooks/useDebounce";

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ── Location Picker ──────────────────────────────────────────────────────────
function LocationPicker({ activeCoords, locating, onLocate, onManualCoords, locationLabel, onClearLocation }) {
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedCity = useDebounce(cityInput, 500);
  const dropdownRef = useRef();

  // Fetch geocode suggestions
  useEffect(() => {
    if (debouncedCity.length < 3) { setSuggestions([]); setOpen(false); return; }
    let cancelled = false;
    setSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedCity)}&format=json&limit=5`, {
      headers: { "Accept-Language": "en" },
    })
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
      .catch(() => { if (!cancelled) setSuggestions([]); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedCity]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s) => {
    onManualCoords({ latitude: s.latitude, longitude: s.longitude }, s.label.split(",")[0]);
    setCityInput("");
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* GPS */}
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent border border-accent/30 rounded-full px-3 py-1.5 hover:bg-accent/10 transition-colors disabled:opacity-60"
      >
        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
        {locating ? "Detecting…" : "Use my location"}
      </button>

      {/* Manual city search */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-accent">
          <Search className="w-3.5 h-3.5 text-secondary shrink-0" />
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search another city…"
            className="text-sm outline-none w-40 text-primary placeholder:text-secondary/60"
          />
          {searching && <Loader2 className="w-3 h-3 animate-spin text-secondary shrink-0" />}
        </div>

        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 w-72 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-accent/5 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="line-clamp-2">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active location badge */}
      {activeCoords && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">
          <MapPin className="w-3 h-3 text-accent" />
          {locationLabel || "Location set"}
          <button type="button" onClick={onClearLocation} className="ml-0.5 hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
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
  const { coords: gpsCoords, loading: locating, locate } = useGeolocation();

  const [manualCoords, setManualCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");

  // Active coords: manual takes priority over GPS
  const activeCoords = manualCoords || gpsCoords;

  // Reverse-geocode GPS coords to get a readable label
  useEffect(() => {
    if (!gpsCoords || manualCoords) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${gpsCoords.latitude}&lon=${gpsCoords.longitude}&format=json`)
      .then((r) => r.json())
      .then((d) => {
        const a = d.address;
        setLocationLabel(a.suburb || a.neighbourhood || a.city_district || a.town || a.city || "Your location");
      })
      .catch(() => setLocationLabel("Your location"));
  }, [gpsCoords, manualCoords]);

  const handleLocate = () => {
    setManualCoords(null);
    setLocationLabel("");
    locate();
  };

  const handleManualCoords = (coords, label) => {
    setManualCoords(coords);
    setLocationLabel(label);
  };

  const handleClearLocation = () => {
    setManualCoords(null);
    setLocationLabel("");
  };

  const recent = useAsync(() => getRecentlyViewed(), []);
  const favoritesData = useAsync(() => fetchMyFavorites(), []);
  const nearby = useAsync(
    () =>
      fetchShops(
        activeCoords
          ? { lat: activeCoords.latitude, lng: activeCoords.longitude, radius: 25, sort: "distance", limit: 8 }
          : { sort: "rating:desc", limit: 8 }
      ),
    [activeCoords?.latitude, activeCoords?.longitude]
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
      <Section title="Recommended Near You">
        <LocationPicker
          activeCoords={activeCoords}
          locating={locating}
          onLocate={handleLocate}
          onManualCoords={handleManualCoords}
          locationLabel={locationLabel}
          onClearLocation={handleClearLocation}
        />
        <p className="text-xs text-secondary mt-2 mb-3">
          {activeCoords
            ? "Showing shops closest to your selected location."
            : "Top-rated shops — use GPS or search a city to see shops near you."}
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

function Section({ title, viewAllTo, children }) {
  return (
    <section className="mt-10 first:mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
