import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminShops, toggleShopVerified, toggleShopActive, adminDeleteShop, adminUpdateShop } from "../../services/adminService";
import { fetchCategories } from "../../services/categoryService";
import { Badge, Button, Input, Textarea, Select, Pagination, LoadingSkeleton, ErrorState, ConfirmDialog, Modal } from "../../components/ui";
import { useDebounce } from "../../hooks/useDebounce";

export default function AdminShops() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminShops({ page, limit: 15, search: debouncedSearch }),
    [page, debouncedSearch]
  );

  const handleVerify = async (shop) => {
    try {
      await toggleShopVerified(shop._id, !shop.isVerified);
      toast.success(shop.isVerified ? "Verification removed." : "Shop verified.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update shop.");
    }
  };

  const handleToggleActive = async (shop) => {
    try {
      await toggleShopActive(shop._id, !shop.isActive);
      toast.success(shop.isActive ? "Shop deactivated." : "Shop activated.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update shop.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteShop(toDelete._id);
      toast.success("Shop deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete shop.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Shops</h1>

      <input
        type="search"
        placeholder="Search shops…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent mb-5"
      />

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.shops?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No shops found.</p>
            )}
            {data?.shops?.map((shop, i) => (
              <div key={shop._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                {shop.coverImage ? (
                  <img src={shop.coverImage} alt={shop.shopName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${shop._id}`} className="font-medium text-primary hover:text-accent truncate block">
                    {shop.shopName}
                  </Link>
                  <p className="text-xs text-secondary truncate">
                    {shop.city} · {shop.ownerId?.name} ({shop.ownerId?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0flex-wrap">
                  <Badge tone={shop.isActive ? "success" : "danger"}>{shop.isActive ? "Active" : "Inactive"}</Badge>
                  {shop.isVerified && <Badge tone="accent">Verified</Badge>}
                  <Button size="sm" variant="ghost" icon={shop.isActive ? ToggleRight : ToggleLeft}
                    className={shop.isActive ? "text-success hover:bg-success/5" : "text-secondary"}
                    onClick={() => handleToggleActive(shop)}
                    title={shop.isActive ? "Deactivate" : "Activate"}
                  />
                  <Button size="sm" variant={shop.isVerified ? "outline" : "primary"} icon={ShieldCheck} onClick={() => handleVerify(shop)}>
                    {shop.isVerified ? "Unverify" : "Verify"}
                  </Button>
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(shop)} />
                  <Button size="sm" variant="ghost" icon={Trash2} className="text-danger hover:bg-danger/5" onClick={() => setToDelete(shop)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={data?.pagination?.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <EditShopModal
        shop={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); retry(); }}
        toast={toast}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete shop?"
        description={`"${toDelete?.shopName}" and all its products will be permanently deleted.`}
        confirmLabel="Delete Shop"
      />
    </div>
  );
}

function EditShopModal({ shop, onClose, onSaved, toast }) {
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  // Sync form when shop changes
  const open = Boolean(shop);
  if (open && form._id !== shop?._id) {
    setForm({
      _id: shop._id,
      shopName: shop.shopName || "",
      description: shop.description || "",
      phone: shop.phone || "",
      whatsapp: shop.whatsapp || "",
      address: shop.address || "",
      area: shop.area || "",
      city: shop.city || "",
      state: shop.state || "",
      pincode: shop.pincode || "",
      category: shop.categoryId?._id || shop.categoryId || "",
    });
    fetchCategories().then(setCategories).catch(() => {});
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await adminUpdateShop(shop._id, form);
      toast.success("Shop updated.");
      onSaved();
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not update shop."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Shop">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
        <Input label="Shop Name *" value={form.shopName || ""} onChange={(e) => set({ shopName: e.target.value })} required />
        <Select
          label="Category"
          value={form.category || ""}
          onChange={(e) => set({ category: e.target.value })}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
        />
        <Textarea label="Description" value={form.description || ""} onChange={(e) => set({ description: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone || ""} onChange={(e) => set({ phone: e.target.value })} />
          <Input label="WhatsApp" value={form.whatsapp || ""} onChange={(e) => set({ whatsapp: e.target.value })} />
          <Input label="City *" value={form.city || ""} onChange={(e) => set({ city: e.target.value })} required />
          <Input label="Area" value={form.area || ""} onChange={(e) => set({ area: e.target.value })} />
          <Input label="State" value={form.state || ""} onChange={(e) => set({ state: e.target.value })} />
          <Input label="Pincode" value={form.pincode || ""} onChange={(e) => set({ pincode: e.target.value })} />
        </div>
        <Textarea label="Address" value={form.address || ""} onChange={(e) => set({ address: e.target.value })} rows={2} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
