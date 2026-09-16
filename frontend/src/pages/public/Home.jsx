import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Compass, Grid3x3, LocateFixed, Search, Sparkles,
  MousePointerClick, Handshake, ArrowRight, Store,
  Star, MapPin, ShoppingBag,
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

// Mock phone screen cards
const PHONE_CARDS = [
  { name: "Zara Fashion", cat: "Fashion", rating: 4.8, area: "Bandra, Mumbai", color: "bg-pink-50" },
  { name: "FreshMart", cat: "Grocery", rating: 4.6, area: "Koramangala, Bengaluru", color: "bg-green-50" },
  { name: "TechZone", cat: "Electronics", rating: 4.9, area: "Connaught Place, Delhi", color: "bg-blue-50" },
];

function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => run(), [run]);
  return { ...state, retry: run };
}

// Floating phone mockup with animated shop cards
function PhoneMockup() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % PHONE_CARDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      className="relative w-[260px] mx-auto"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75 translate-y-8" />

      {/* Phone frame */}
      <div className="relative bg-primary rounded-[2.5rem] p-3 shadow-2xl">
        <div className="bg-background rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-primary px-5 pt-3 pb-2 flex items-center justify-between">
            <span className="text-white/70 text-[10px]">9:41</span>
            <div className="w-16 h-4 bg-primary rounded-full" />
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 bg-white/70 rounded-full" style={{ height: `${6 + i * 2}px` }} />
              ))}
            </div>
          </div>

          {/* App content */}
          <div className="bg-background px-3 pb-4 pt-3 min-h-[380px]">
            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-border mb-3">
              <Search className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs text-secondary/60">Search shops near you…</span>
            </div>

            <p className="text-[10px] font-semibold text-secondary uppercase tracking-wide mb-2">Nearby Shops</p>

            {/* Animated cards */}
            <div className="space-y-2">
              {PHONE_CARDS.map((card, i) => (
                <motion.div
                  key={card.name}
                  animate={{
                    scale: active === i ? 1 : 0.97,
                    opacity: active === i ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`${card.color} rounded-xl p-2.5 border border-border/50`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary truncate">{card.name}</p>
                      <p className="text-[10px] text-secondary truncate">{card.area}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5 shrink-0">
                      <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                      <span className="text-[10px] font-medium text-primary">{card.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-around mt-4 pt-3 border-t border-border">
              {[Store, Search, ShoppingBag, MapPin].map((Icon, i) => (
                <div key={i} className={`p-1.5 rounded-lg ${i === 0 ? "bg-accent/10" : ""}`}>
                  <Icon className={`w-4 h-4 ${i === 0 ? "text-accent" : "text-secondary/50"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-16 bg-white rounded-xl shadow-lg border border-border px-3 py-2 flex items-center gap-2"
      >
        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
          <Store className="w-3 h-3 text-success" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-primary">Shop Open</p>
          <p className="text-[9px] text-secondary">2 mins away</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-8 bottom-24 bg-white rounded-xl shadow-lg border border-border px-3 py-2"
      >
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-accent fill-accent" />
          <p className="text-[10px] font-semibold text-primary">4.9 Rating</p>
        </div>
        <p className="text-[9px] text-secondary">128 reviews</p>
      </motion.div>
    </motion.div>
  );
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container-app relative py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — content */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1.5 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" /> Local shops, right at your fingertips
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl font-bold text-primary leading-[1.1]"
              >
                Find what you need.
                <br />
                <span className="text-accent">Right around</span> the corner.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-secondary text-base sm:text-lg mt-5 max-w-lg"
              >
                Discover local shops, explore their products, check prices and connect directly with businesses near you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 mt-6"
              >
                <Button icon={Compass} onClick={() => navigate("/explore")}>Explore Shops</Button>
                <Button variant="outline" icon={Grid3x3} onClick={() => navigate("/categories")}>Browse Categories</Button>
                <button
                  type="button" onClick={locate} disabled={locating}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors disabled:opacity-60"
                >
                  <LocateFixed className="w-4 h-4" />
                  {locating ? "Locating..." : coords ? "Location set ✓" : "Use my location"}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap items-center gap-2 mt-6"
              >
                <span className="text-xs text-secondary">Popular:</span>
                {POPULAR_SEARCHES.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => handleSearch(term)}
                    className="text-xs font-medium text-primary bg-white border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                  >
                    {term}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Right — phone mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="container-app py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary">What are you looking for?</h2>
          <Button variant="ghost" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/categories")}>
            View All
          </Button>
        </motion.div>

        {categories.loading && <LoadingSkeleton count={8} className="grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" />}
        {categories.error && <ErrorState onRetry={categories.retry} />}
        {!categories.loading && !categories.error && (
          categories.data?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.data.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <CategoryCard category={cat} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title="No categories yet" description="Categories will appear here once they're added." />
          )
        )}
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="bg-white border-y border-border">
        <div className="container-app py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Explore Products Near You</h2>
            <p className="text-secondary mt-2 mb-8">See what's available at local shops before you make the trip.</p>
          </motion.div>

          {products.loading && <LoadingSkeleton count={8} />}
          {products.error && <ErrorState onRetry={products.retry} />}
          {!products.loading && !products.error && (
            products.data?.products?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.data.products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <ProductCard
                      product={product}
                      favorite={favoriteIds.has(product._id)}
                      onToggleFavorite={() => toggleFavorite(product._id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState title="No products yet" description="Products from local shops will show up here as shops add their catalog." />
            )
          )}
        </div>
      </section>

      {/* ================= SHOPS ================= */}
      <section className="container-app py-16 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-semibold text-primary mb-8"
        >
          Popular Shops Near You
        </motion.h2>

        {shops.loading && <LoadingSkeleton count={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />}
        {shops.error && <ErrorState onRetry={shops.retry} />}
        {!shops.loading && !shops.error && (
          shops.data?.shops?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops.data.shops.map((shop, i) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <ShopCard
                    shop={shop}
                    favorite={favoriteIds.has(shop._id)}
                    onToggleFavorite={() => toggleFavorite(shop._id)}
                  />
                </motion.div>
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-12"
          >
            Shopping locally just got easier.
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center sm:text-left"
              >
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span className="font-display text-3xl font-bold text-accent/30">{step}</span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center sm:mt-3">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-primary mt-3">{title}</h3>
                <p className="text-sm text-secondary mt-1.5">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BUSINESS CTA ================= */}
      <section className="container-app py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-3xl px-6 sm:px-16 py-14 sm:py-16 text-center"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white max-w-xl mx-auto">
            Your shop deserves to be discovered.
          </h2>
          <p className="text-white/70 mt-3 max-w-md mx-auto">
            Create your free digital storefront and reach customers searching for products near them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Button icon={Handshake} onClick={() => navigate("/register")}>List Your Shop — Free</Button>
            <button
              type="button" onClick={() => navigate("/for-business")}
              className="inline-flex items-center justify-center text-sm px-4 py-2.5 rounded-lg font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="container-app pb-20 sm:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Ready to discover local?</h2>
          <Button size="lg" className="mt-6" icon={Compass} onClick={() => navigate("/explore")}>
            Explore Shops
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
