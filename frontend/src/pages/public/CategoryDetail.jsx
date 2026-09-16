import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, Store, Package, ChevronLeft } from "lucide-react";

import FilterPanel from "../../components/search/FilterPanel";
import ShopCard from "../../components/cards/ShopCard";
import ProductCard from "../../components/cards/ProductCard";
import { Button, Select, Modal, LoadingSkeleton, EmptyState, ErrorState, Pagination } from "../../components/ui";

import { fetchShops } from "../../services/shopService";
import { fetchProducts } from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";
import { useAsync } from "../../hooks/useAsync";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useFavorites } from "../../hooks/useFavorites";

const SHOP_SORTS = [
  { value: "", label: "Recommended" },
  { value: "distance", label: "Nearest" },
  { value: "rating:desc", label: "Highest Rated" },
  { value: "createdAt:desc", label: "Newest" },
  { value: "totalReviews:desc", label: "Most Reviewed" },
];

const PRODUCT_SORTS = [
  { value: "", label: "Recommended" },
  { value: "distance", label: "Nearest" },
  { value: "createdAt:desc", label: "Newest" },
  { value: "views:desc", label: "Most Viewed" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
];

const EMPTY_FILTERS = { city: "", area: "", minRating: "", openNow: false, minPrice: "", maxPrice: "", radius: "" };

function readFilters(params) {
  return {
    city: params.get("city") || "",
    area: params.get("area") || "",
    minRating: params.get("minRating") || "",
    openNow: params.get("openNow") === "true",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    radius: params.get("radius") || "",
  };
}

export default function CategoryDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "shops" ? "shops" : "products";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page"), 10) || 1;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(() => readFilters(searchParams));
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const { coords, loading: locating, locate } = useGeolocation();
  const favorites = useFavorites();

  // Categories are few — resolving the slug from the already-cheap full
  // list avoids a dedicated slug-lookup endpoint.
  const categories = useAsync(() => fetchCategories(), []);
  const category = categories.data?.find((c) => c.slug === slug) || null;

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === "" || value === false || value === undefined || value === null) next.delete(key);
        else next.set(key, String(value));
      });
      if (resetPage) next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const switchTab = (nextTab) => updateParams({ tab: nextTab === "products" ? "" : nextTab, sort: "" });

  const openFilters = () => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  };
  const applyDraftFilters = () => {
    updateParams(draftFilters);
    setFiltersOpen(false);
  };
  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    updateParams(EMPTY_FILTERS);
    setFiltersOpen(false);
  };
  const handleSortChange = (value) => {
    if (value === "distance" && !coords) locate();
    updateParams({ sort: value });
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => (k === "openNow" ? v : Boolean(v))).length;

  const queryParams = useMemo(() => {
    if (!category) return null;
    const params = {
      page,
      limit: 12,
      category: category._id,
      categoryId: category._id,
      city: filters.city || undefined,
      area: filters.area || undefined,
      sort: sort || undefined,
    };
    if (coords) {
      params.lat = coords.latitude;
      params.lng = coords.longitude;
      if (filters.radius) params.radius = filters.radius;
    }
    if (filters.openNow) params.openNow = "true";
    if (tab === "shops" && filters.minRating) params.minRating = filters.minRating;
    if (tab === "products") {
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    }
    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page, filters, sort, coords, tab]);

  const results = useAsync(
    () => {
      if (!queryParams) return Promise.resolve(null);
      return tab === "shops" ? fetchShops(queryParams) : fetchProducts(queryParams);
    },
    [tab, JSON.stringify(queryParams)]
  );

  if (categories.loading) {
    return (
      <div className="container-app py-10">
        <LoadingSkeleton count={8} className="grid-cols-2 sm:grid-cols-4" />
      </div>
    );
  }

  if (categories.error) {
    return (
      <div className="container-app py-10">
        <ErrorState onRetry={categories.retry} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Category not found"
          description="This category may have been removed or renamed."
          action={{ label: "Browse Categories", onClick: () => (window.location.href = "/categories") }}
        />
      </div>
    );
  }

  const list = tab === "shops" ? results.data?.shops : results.data?.products;
  const pagination = results.data?.pagination;
  const sortOptions = tab === "shops" ? SHOP_SORTS : PRODUCT_SORTS;

  return (
    <div className="container-app py-8 sm:py-10">
      <Link to="/categories" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-accent mb-4">
        <ChevronLeft className="w-4 h-4" /> All Categories
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">{category.name} Shops Near You</h1>
      {category.description && <p className="text-secondary mt-2 max-w-2xl">{category.description}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-2">
        <div className="inline-flex bg-white border border-border rounded-full p-1">
          <button
            type="button"
            onClick={() => switchTab("products")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === "products" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <Package className="w-4 h-4" /> Products
          </button>
          <button
            type="button"
            onClick={() => switchTab("shops")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === "shops" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <Store className="w-4 h-4" /> Shops
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={SlidersHorizontal} onClick={openFilters}>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
          <Select value={sort} onChange={(e) => handleSortChange(e.target.value)} options={sortOptions} className="min-w-[160px]" />
        </div>
      </div>

      <p className="text-sm text-secondary mb-6">
        {results.loading ? "Searching…" : `${pagination?.total ?? 0} results found`}
      </p>

      {results.loading && <LoadingSkeleton count={12} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />}
      {!results.loading && results.error && <ErrorState onRetry={results.retry} />}
      {!results.loading && !results.error && (!list || list.length === 0) && (
        <EmptyState
          title="No shops or products found."
          description="Try changing your search or filters."
          action={{ label: "Clear Filters", onClick: clearFilters }}
        />
      )}

      {!results.loading && !results.error && list && list.length > 0 && (
        <>
          <div
            className={
              tab === "shops"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            }
          >
            {tab === "shops"
              ? list.map((shop) => (
                  <ShopCard
                    key={shop._id}
                    shop={shop}
                    favorite={favorites.shopIds.has(String(shop._id))}
                    onToggleFavorite={(next) => favorites.toggleShop(String(shop._id), next)}
                  />
                ))
              : list.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    favorite={favorites.productIds.has(String(product._id))}
                    onToggleFavorite={(next) => favorites.toggleProduct(String(product._id), next)}
                  />
                ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateParams({ page: p }, { resetPage: false })}
              />
            </div>
          )}
        </>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" size="sm">
        <FilterPanel
          tab={tab}
          hideCategory
          values={draftFilters}
          onChange={setDraftFilters}
          onClear={clearFilters}
          onApply={applyDraftFilters}
          coords={coords}
          locating={locating}
          onLocate={locate}
        />
      </Modal>
    </div>
  );
}
