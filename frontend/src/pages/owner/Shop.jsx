import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, Pencil, Trash2, Plus, Phone, MapPin, Globe, Instagram } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchShops, deleteShop } from "../../services/shopService";
import { LoadingSkeleton, EmptyState, ErrorState, Badge, Button, ConfirmDialog } from "../../components/ui";

export default function OwnerShop() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, retry } = useAsync(
    () => fetchShops({ ownerId: user?._id, limit: 1 }),
    [user?._id]
  );
  const shop = data?.shops?.[0] ?? null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteShop(shop._id);
      toast.success("Shop deleted.");
      navigate("/owner/dashboard");
    } catch (err) {
      toast.error(err.message || "Could not delete shop.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;
  if (error) return <ErrorState onRetry={retry} />;

  if (!shop) {
    return (
      <EmptyState
        title="You don't have a shop yet."
        description="Create your shop to start listing products and reaching customers."
        action={{ label: "Create Shop", onClick: () => navigate("/owner/shop/create") }}
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">My Shop</h1>
        <div className="flex gap-2">
          <Button icon={Pencil} onClick={() => navigate("/owner/shop/edit")}>Edit</Button>
          <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {shop.coverImage && (
          <img src={shop.coverImage} alt={shop.shopName} className="w-full h-48 object-cover" />
        )}
        {!shop.coverImage && (
          <div className="w-full h-32 bg-accent/10 flex items-center justify-center">
            <Store className="w-10 h-10 text-accent/40" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-primary">{shop.shopName}</h2>
              <p className="text-sm text-secondary mt-0.5">{shop.categoryId?.name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge tone={shop.isActive ? "success" : "danger"}>{shop.isActive ? "Active" : "Inactive"}</Badge>
              {shop.isVerified && <Badge tone="accent">Verified</Badge>}
            </div>
          </div>

          {shop.description && <p className="text-sm text-secondary mb-5">{shop.description}</p>}

          <div className="space-y-2.5">
            <InfoRow icon={MapPin} text={[shop.address, shop.area, shop.city, shop.state, shop.pincode].filter(Boolean).join(", ")} />
            <InfoRow icon={Phone} text={shop.phone} />
            {shop.website && <InfoRow icon={Globe} text={shop.website} href={shop.website} />}
            {shop.instagram && <InfoRow icon={Instagram} text={`@${shop.instagram}`} href={`https://instagram.com/${shop.instagram}`} />}
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-border">
            <Link
              to={`/shop/${shop._id}`}
              className="text-sm text-accent hover:underline"
              target="_blank"
            >
              View public page →
            </Link>
            <Link to="/owner/products" className="text-sm text-accent hover:underline">
              Manage products →
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete shop?"
        description="This will permanently delete your shop and all its products. This cannot be undone."
        confirmLabel="Delete Shop"
      />
    </div>
  );
}

function InfoRow({ icon: Icon, text, href }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-primary">
      <Icon className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">{text}</a>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
