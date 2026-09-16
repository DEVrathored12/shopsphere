import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Navigation,
  Store,
  MapPin,
  Globe,
  Clock,
  ImageOff,
} from "lucide-react";

import PhotoGallery from "../../components/gallery/PhotoGallery";
import ProductCard from "../../components/cards/ProductCard";
import FavoriteButton from "../../components/favorites/FavoriteButton";
import { Button, Badge, Rating, RatingInput, Avatar, Textarea, LoadingSkeleton, EmptyState, ErrorState } from "../../components/ui";

import { fetchShopById } from "../../services/shopService";
import { fetchReviews, createReview, updateReview } from "../../services/reviewService";
import { recordView } from "../../services/recentlyViewedService";
import { useAsync } from "../../hooks/useAsync";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isShopOpenNow, buildWhatsAppUrl, buildDirectionsUrl } from "../../utils/format";
import { cn } from "../../lib/cn";

const TABS = ["Overview", "Products", "Photos", "Reviews"];
const DAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function ShopDetail() {
  const { shopId } = useParams();
  const [tab, setTab] = useState("Overview");
  const favorites = useFavorites();

  const { data, loading, error, retry } = useAsync(() => fetchShopById(shopId), [shopId]);

  useEffect(() => {
    if (!data?.shop) return;
    const { shop, category } = data;
    recordView({
      type: "shop",
      id: shop._id,
      snapshot: {
        name: shop.shopName,
        image: shop.coverImage,
        category: category?.name,
        rating: shop.rating,
        totalReviews: shop.totalReviews,
        city: shop.city,
        area: shop.area,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.shop?._id]);

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton rounded-2xl aspect-[21/9] w-full mb-6" />
        <LoadingSkeleton count={4} />
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

  const { shop, category, products = [], gallery = [] } = data;

  const isFavorite = favorites.shopIds.has(String(shop._id));

  const open = isShopOpenNow(shop.openingHours);
  const location = [shop.area, shop.city].filter(Boolean).join(", ");
  const [lng, lat] = shop.location?.coordinates || [0, 0];
  const hasCoords = Boolean(lat || lng);

  const waText = `Hi, I found ${shop.shopName} on ShopSphere and wanted to know more.`;
  const galleryImages = [shop.coverImage, ...(gallery || [])].filter(Boolean);

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-border/40 overflow-hidden">
        {shop.coverImage ? (
          <img src={shop.coverImage} alt={shop.shopName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-10 h-10 text-secondary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />
        <FavoriteButton active={isFavorite} onToggle={(next) => favorites.toggleShop(String(shop._id), next)} className="absolute top-4 right-4" />
      </div>

      <div className="container-app -mt-10 relative">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">{shop.shopName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Rating value={shop.rating} count={shop.totalReviews} size="lg" />
                {category?.name && <Badge tone="accent">{category.name}</Badge>}
                {open !== null && <Badge tone={open ? "success" : "danger"}>{open ? "Open now" : "Closed"}</Badge>}
              </div>
              {location && (
                <p className="flex items-center gap-1.5 text-sm text-secondary mt-2.5">
                  <MapPin className="w-4 h-4 shrink-0" /> {location}
                </p>
              )}
            </div>
          </div>

          {/* ================= CONTACT ACTIONS ================= */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            {shop.phone && (
              <Button icon={Phone} onClick={() => { window.location.href = `tel:${shop.phone}`; }}>
                Call
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
                  shop.mapLink || buildDirectionsUrl(hasCoords ? { latitude: lat, longitude: lng } : { address: `${shop.address}, ${location}` }),
                  "_blank",
                  "noopener"
                )
              }
            >
              Directions
            </Button>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-1 mt-6 border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                tab === t ? "border-accent text-accent" : "border-transparent text-secondary hover:text-primary"
              )}
            >
              {t}
              {t === "Products" && ` (${products.length})`}
              {t === "Reviews" && ` (${shop.totalReviews})`}
            </button>
          ))}
        </div>

        <div className="py-6 pb-14">
          {tab === "Overview" && <OverviewTab shop={shop} />}
          {tab === "Products" && <ProductsTab products={products} favorites={favorites} />}
          {tab === "Photos" && <PhotoGallery images={galleryImages} alt={shop.shopName} />}
          {tab === "Reviews" && <ReviewsTab shop={shop} onRatingChanged={retry} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ shop }) {
  const fullAddress = [shop.address, shop.area, shop.city, shop.state, shop.pincode].filter(Boolean).join(", ");

  return (
    <div className="grid sm:grid-cols-3 gap-8">
      <div className="sm:col-span-2 space-y-6">
        {shop.description && (
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1.5">About</h3>
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">{shop.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Opening Hours
          </h3>
          <div className="rounded-xl border border-border overflow-hidden text-sm">
            {Object.entries(DAY_LABELS).map(([key, label], i) => {
              const day = shop.openingHours?.[key];
              return (
                <div
                  key={key}
                  className={cn("flex items-center justify-between px-4 py-2", i % 2 === 0 ? "bg-white" : "bg-background")}
                >
                  <span className="text-primary">{label}</span>
                  <span className="text-secondary">
                    {day?.isClosed || !day?.open || !day?.close ? "Closed" : `${day.open} – ${day.close}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Contact</h3>
        {fullAddress && (
          <p className="flex items-start gap-2 text-sm text-secondary">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {fullAddress}
          </p>
        )}
        {shop.phone && (
          <p className="flex items-center gap-2 text-sm text-secondary">
            <Phone className="w-4 h-4 shrink-0" /> {shop.phone}
          </p>
        )}
        {shop.whatsapp && (
          <p className="flex items-center gap-2 text-sm text-secondary">
            <MessageCircle className="w-4 h-4 shrink-0" /> {shop.whatsapp}
          </p>
        )}
        {shop.instagram && (
          <a
            href={shop.instagram.startsWith("http") ? shop.instagram : `https://instagram.com/${shop.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <Globe className="w-4 h-4 shrink-0" /> Instagram
          </a>
        )}
        {shop.website && (
          <a
            href={shop.website.startsWith("http") ? shop.website : `https://${shop.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <Globe className="w-4 h-4 shrink-0" /> Website
          </a>
        )}
      </div>
    </div>
  );
}

function ProductsTab({ products, favorites }) {
  if (!products.length) {
    return <EmptyState icon={ImageOff} title="No products listed yet." description="This shop hasn't added any products." />;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          favorite={favorites.productIds.has(String(product._id))}
          onToggleFavorite={(next) => favorites.toggleProduct(String(product._id), next)}
        />
      ))}
    </div>
  );
}

function ReviewsTab({ shop, onRatingChanged }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { data, loading, error, retry } = useAsync(() => fetchReviews({ shopId: shop._id, limit: 20 }), [shop._id]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const reviews = data?.reviews || [];
  const myReview = reviews.find((r) => r.userId?._id === user?._id);
  const canReview = isAuthenticated && user?.role === "customer" && !myReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await createReview({ shopId: shop._id, rating, comment });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      retry();
      onRatingChanged?.();
    } catch (err) {
      toast.error(err?.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    setEditRating(myReview.rating);
    setEditComment(myReview.comment || "");
    setEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editRating) { toast.error("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      await updateReview(myReview._id, { rating: editRating, comment: editComment });
      toast.success("Review updated!");
      setEditing(false);
      retry();
      onRatingChanged?.();
    } catch (err) {
      toast.error(err?.message || "Could not update review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid sm:grid-cols-3 gap-8">
      <div className="sm:col-span-2 space-y-5">
        {loading && <LoadingSkeleton count={3} className="grid-cols-1" />}
        {!loading && error && <ErrorState onRetry={retry} />}
        {!loading && !error && reviews.length === 0 && (
          <EmptyState title="No reviews yet." description="Be the first to review this shop." />
        )}
        {!loading &&
          !error &&
          reviews.map((review) => (
            <div key={review._id} className="flex gap-3 pb-5 border-b border-border last:border-0">
              <Avatar src={review.userId?.avatar} name={review.userId?.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-primary">{review.userId?.name || "ShopSphere user"}</p>
                  <span className="text-xs text-secondary shrink-0">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <Rating value={review.rating} />
                {review.comment && <p className="text-sm text-secondary mt-1.5">{review.comment}</p>}
              </div>
            </div>
          ))}
      </div>

      <div>
        {canReview && (
          <form onSubmit={handleSubmit} className="space-y-3 bg-background rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-primary">Write a review</h3>
            <RatingInput value={rating} onChange={setRating} />
            <Textarea placeholder="Share your experience (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            <Button type="submit" className="w-full" loading={submitting}>
              Submit Review
            </Button>
          </form>
        )}
        {myReview && !editing && (
          <div className="bg-background rounded-xl border border-border p-4 space-y-2">
            <p className="text-sm font-semibold text-primary">Your review</p>
            <Rating value={myReview.rating} />
            {myReview.comment && <p className="text-sm text-secondary">{myReview.comment}</p>}
            <Button size="sm" variant="outline" onClick={startEdit}>Edit Review</Button>
          </div>
        )}
        {myReview && editing && (
          <form onSubmit={handleUpdate} className="space-y-3 bg-background rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-primary">Edit your review</h3>
            <RatingInput value={editRating} onChange={setEditRating} />
            <Textarea placeholder="Share your experience (optional)" value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" loading={submitting}>Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        )}
        {!isAuthenticated && (
          <p className="text-sm text-secondary bg-background rounded-xl border border-border p-4">
            <Link to="/login" className="text-accent hover:underline">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}
      </div>
    </div>
  );
}
