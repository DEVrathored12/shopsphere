import { useState } from "react";
import { Images, Trash2, Star, Plus } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchShops, updateShop } from "../../services/shopService";
import { LoadingSkeleton, EmptyState, ErrorState, Button, Input } from "../../components/ui";

export default function OwnerPhotos() {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const { data, loading, error, retry } = useAsync(
    () => fetchShops({ ownerId: user?._id, limit: 1 }),
    [user?._id]
  );
  const shop = data?.shops?.[0] ?? null;

  const save = async (patch) => {
    setSaving(true);
    try {
      await updateShop(shop._id, patch);
      toast.success("Photos updated.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update photos.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGallery = () => {
    const url = newUrl.trim();
    if (!url) return;
    const gallery = [...(shop.galleryImages || []), url];
    setNewUrl("");
    save({ galleryImages: gallery });
  };

  const handleRemoveGallery = (idx) => {
    const gallery = shop.galleryImages.filter((_, i) => i !== idx);
    save({ galleryImages: gallery });
  };

  const handleSetCover = (url) => {
    save({ coverImage: url });
  };

  const handleRemoveCover = () => {
    save({ coverImage: "" });
  };

  if (loading) return <LoadingSkeleton count={4} />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!shop) return <EmptyState title="No shop found." description="Create your shop first." />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Photos</h1>

      {/* Cover image */}
      <section className="bg-white border border-border rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" /> Cover Image
        </h2>
        {shop.coverImage ? (
          <div className="relative group w-full aspect-[3/1] rounded-xl overflow-hidden bg-border/30">
            <img src={shop.coverImage} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="danger"
                icon={Trash2}
                loading={saving}
                onClick={handleRemoveCover}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[3/1] rounded-xl bg-border/20 flex flex-col items-center justify-center gap-2 text-secondary">
            <Images className="w-8 h-8 opacity-40" />
            <p className="text-sm">No cover image. Add one from the gallery below or paste a URL.</p>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Paste cover image URL…"
            value={shop.coverImage || ""}
            onChange={(e) => {}}
            onBlur={(e) => {
              if (e.target.value !== shop.coverImage) save({ coverImage: e.target.value });
            }}
            defaultValue={shop.coverImage || ""}
            key={shop.coverImage}
          />
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Images className="w-4 h-4 text-accent" /> Gallery ({shop.galleryImages?.length ?? 0})
        </h2>

        {shop.galleryImages?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {shop.galleryImages.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-border/20">
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Star}
                    loading={saving}
                    onClick={() => handleSetCover(url)}
                    className="w-full text-xs"
                  >
                    Set as Cover
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    loading={saving}
                    onClick={() => handleRemoveGallery(idx)}
                    className="w-full text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary mb-4">No gallery images yet.</p>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL to add…"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGallery())}
          />
          <Button icon={Plus} loading={saving} onClick={handleAddGallery} className="shrink-0">
            Add
          </Button>
        </div>
        <p className="text-xs text-secondary mt-2">
          Tip: In Part 14, direct file upload will replace URL input.
        </p>
      </section>
    </div>
  );
}
