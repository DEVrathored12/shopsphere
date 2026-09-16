import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Grid3x3,
  LocateFixed,
  Search,
  Sparkles,
  MousePointerClick,
  Handshake,
  ArrowRight,
} from "lucide-react";

import SearchBar from "../../components/search/SearchBar";
import CategoryCard from "../../components/cards/CategoryCard";
import ProductCard from "../../components/cards/ProductCard";
import ShopCard from "../../components/cards/ShopCard";
import Button from "../../components/ui/Button";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";

import { fetchCategories } from "../../services/categoryService";
import { fetchProducts } from "../../services/productService";
import { fetchShops } from "../../services/shopService";
import { useGeolocation } from "../../hooks/useGeolocation";

const POPULAR_SEARCHES = ["Shoes", "Sherwani", "Jewellery", "Mobile", "Grocery", "Bakery"];

const HOW_IT_WORKS = [
  { step: "01", title: "Search", desc: "Look up a shop, product, or category near you.", icon: Search },
  { step: "02", title: "Discover", desc: "Browse real shops and what they actually stock.", icon: Compass },
  { step: "03", title: "Explore", desc: "Check prices, photos, and availability before you go.", icon: Sparkles },
  { step: "04", title: "Connect", desc: "Call, message, or get directions — straight to the shop.", icon: MousePointerClick },
];

/** Generic async-list loader: fetch on mount, expose data/loading/error/retry. */
function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, retry: run };
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const { coords, loading: locating, locate } = useGeolocation();

  const categories = useAsync(() => fetchCategories(), []);
  const products = useAsync(() => fetchProducts({ limit: 8, sort: "createdAt:desc" }), []);
  const shops = useAsync(() => fetchShops({ limit: 6, sort: "rating:desc" }), []);

  const handleSearch = (value) => {
    const q = value.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.06] to-transparent" />
        <div className="container-app relative py-16 sm:py-24 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Local shops, right at your fingertips
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[1.1] max-w-3xl">
            Find what you need.
            <br />
            Right around the corner.
          </h1>

          <p className="text-secondary text-base sm:text-lg mt-5 max-w-xl">
            Discover local shops, explore their products, check prices and connect directly with
            businesses near you.
          </p>

          <div className="w-full max-w-2xl mt-8">
            <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Button icon={Compass} onClick={() => navigate("/explore")}>
              Explore Shops
            </Button>
            <Button variant="outline" icon={Grid3x3} onClick={() => navigate("/categories")}>
              Browse Categories
            </Button>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors px-2 disabled:opacity-60"
            >
              <LocateFixed className="w-4 h-4" />
              {locating ? "Locating..." : coords ? "Location set" : "Use my location"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-secondary mr-1">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSearch(term)}
                className="text-xs font-medium text-primary bg-white border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="container-app py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary">What are you looking for?</h2>
          <Button variant="ghost" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/categories")}>
            View All Categories
          </Button>
        </div>

        {categories.loading && <LoadingSkeleton count={8} className="grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" />}
        {categories.error && <ErrorState onRetry={categories.retry} />}
        {!categories.loading && !categories.error && (
          categories.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.data.slice(0, 8).map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          ) : (
            <EmptyState title="No categories yet" description="Categories will appear here once they're added." />
          )
        )}
      </section>

      {/* ================= PRODUCT DISCOVERY ================= */}
      <section className="bg-white border-y border-border">
        <div className="container-app py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Explore Products Near You</h2>
          </div>
          <p className="text-secondary mb-8">See what's available at local shops before you make the trip.</p>

          {products.loading && <LoadingSkeleton count={8} />}
          {products.error && <ErrorState onRetry={products.retry} />}
          {!products.loading && !products.error && (
            products.data?.products?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.data.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    favorite={favoriteIds.has(product._id)}
                    onToggleFavorite={() => toggleFavorite(product._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No products yet"
                description="Products from local shops will show up here as shops add their catalog."
              />
            )
          )}
        </div>
      </section>

      {/* ================= POPULAR SHOPS ================= */}
      <section className="container-app py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-8">Popular Shops Near You</h2>

        {shops.loading && <LoadingSkeleton count={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />}
        {shops.error && <ErrorState onRetry={shops.retry} />}
        {!shops.loading && !shops.error && (
          shops.data?.shops?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops.data.shops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  favorite={favoriteIds.has(shop._id)}
                  onToggleFavorite={() => toggleFavorite(shop._id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No shops yet" description="Shops will appear here as they join ShopSphere." />
          )
        )}
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white border-y border-border">
        <div className="container-app py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-12">
            Shopping locally just got easier.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center sm:text-left">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span className="font-display text-3xl font-bold text-accent/30">{step}</span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center sm:mt-3">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-primary mt-3">{title}</h3>
                <p className="text-sm text-secondary mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BUSINESS CTA ================= */}
      <section className="container-app py-16 sm:py-20">
        <div className="bg-primary rounded-3xl px-6 sm:px-16 py-14 sm:py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white max-w-xl mx-auto">
            Your shop deserves to be discovered.
          </h2>
          <p className="text-white/70 mt-3 max-w-md mx-auto">
            Create your free digital storefront and reach customers searching for products near
            them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Button icon={Handshake} onClick={() => navigate("/register")}>
              List Your Shop — Free
            </Button>
            <button
              type="button"
              onClick={() => navigate("/for-business")}
              className="inline-flex items-center justify-center text-sm px-4 py-2.5 rounded-lg font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="container-app pb-20 sm:pb-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Ready to discover local?</h2>
        <Button size="lg" className="mt-6" icon={Compass} onClick={() => navigate("/explore")}>
          Explore Shops
        </Button>
      </section>
    </div>
  );
}
