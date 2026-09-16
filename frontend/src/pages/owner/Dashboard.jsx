import { Link } from "react-router-dom";
import { Store, Package, Plus, ArrowRight, Star, Eye, Heart } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { fetchShops } from "../../services/shopService";
import { fetchProducts } from "../../services/productService";
import { LoadingSkeleton, EmptyState, ErrorState, Badge } from "../../components/ui";
import { formatPrice } from "../../utils/format";

const COMPLETION_FIELDS = [
  { key: "shopName", label: "Shop name" },
  { key: "categoryId", label: "Category" },
  { key: "description", label: "Description" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "openingHours", label: "Opening hours", check: (v) => v && Object.values(v).some((d) => d.open && d.close && !d.isClosed) },
  { key: "coverImage", label: "Cover image" },
  { key: "galleryImages", label: "Gallery", check: (v) => Array.isArray(v) && v.length > 0 },
];

function calcCompletion(shop, productCount) {
  const fields = [...COMPLETION_FIELDS, { key: "_products", label: "Products" }];
  const done = fields.filter(({ key, check }) => {
    if (key === "_products") return productCount > 0;
    const val = shop[key];
    if (check) return check(val);
    return Boolean(val);
  });
  return { done: done.length, total: fields.length, pct: Math.round((done.length / fields.length) * 100), fields, doneKeys: new Set(done.map((f) => f.key)) };
}

export default function OwnerDashboard() {
  const { user } = useAuth();

  const shopData = useAsync(() => fetchShops({ ownerId: user?._id, limit: 1 }), [user?._id]);
  const shop = shopData.data?.shops?.[0] ?? null;

  const productsData = useAsync(
    () => (shop ? fetchProducts({ shopId: shop._id, limit: 5, sort: "createdAt:desc" }) : Promise.resolve(null)),
    [shop?._id]
  );

  const productCount = productsData.data?.pagination?.total ?? 0;
  const completion = shop ? calcCompletion(shop, productCount) : null;

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">
        Welcome back, {user?.name?.split(" ")[0]} 👋
      </h1>

      {shopData.loading && <LoadingSkeleton count={3} />}
      {shopData.error && <ErrorState onRetry={shopData.retry} />}

      {!shopData.loading && !shopData.error && !shop && (
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <Store className="w-10 h-10 text-secondary/40 mx-auto mb-3" />
          <p className="font-medium text-primary mb-1">You don't have a shop yet.</p>
          <p className="text-sm text-secondary mb-5">Create your shop to start listing products.</p>
          <Button icon={Plus} as={Link} to="/owner/shop/create">
            <Link to="/owner/shop/create">Create Your Shop</Link>
          </Button>
        </div>
      )}

      {shop && (
        <>
          {/* Profile completion circle */}
          {completion && completion.pct < 100 && (
            <div className="flex justify-end mb-4">
              <Link to="/owner/shop/edit" title={`Profile ${completion.pct}% complete — click to finish`}>
                <ProfileCircle pct={completion.pct} />
              </Link>
            </div>
          )}

          {/* Shop summary card */}
          <div className="bg-white border border-border rounded-2xl p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {shop.coverImage ? (
                  <img src={shop.coverImage} alt={shop.shopName} className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Store className="w-7 h-7 text-accent" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-primary text-lg">{shop.shopName}</h2>
                  <p className="text-sm text-secondary">{[shop.area, shop.city].filter(Boolean).join(", ")}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge tone={shop.isActive ? "success" : "danger"}>{shop.isActive ? "Active" : "Inactive"}</Badge>
                    {shop.isVerified && <Badge tone="accent">Verified</Badge>}
                  </div>
                </div>
              </div>
              <Link to="/owner/shop" className="text-sm text-accent hover:underline shrink-0">
                Manage →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
              <Stat icon={Star} label="Rating" value={shop.rating ? `${shop.rating} / 5` : "No reviews"} />
              <Stat icon={Eye} label="Reviews" value={shop.totalReviews ?? 0} />
              <Stat icon={Package} label="Products" value={productCount || 0} />
              <Stat icon={Heart} label="Favorites" value={shop.totalFavorites ?? "—"} />
            </div>
          </div>

          {/* Recent products */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">Recent Products</h3>
              <Link to="/owner/products" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {productsData.loading && <LoadingSkeleton count={3} />}
            {!productsData.loading && !productsData.data?.products?.length && (
              <EmptyState
                title="No products yet."
                action={{ label: "Add Product", href: "/owner/products/create" }}
              />
            )}
            {productsData.data?.products?.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-border/40 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-secondary/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{p.name}</p>
                    <p className="text-xs text-secondary">{formatPrice(p)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={p.availability === "available" ? "success" : "danger"}>
                    {p.availability === "available" ? "In stock" : "Out of stock"}
                  </Badge>
                  <Link to={`/owner/products/${p._id}/edit`} className="text-xs text-accent hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileCircle({ pct }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-12 h-12 group">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          className="text-accent transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">
        {pct}%
      </span>
      <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1 whitespace-nowrap">
        Profile {pct}% complete
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div>
        <p className="text-xs text-secondary">{label}</p>
        <p className="font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
}
