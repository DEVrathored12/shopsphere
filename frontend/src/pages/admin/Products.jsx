import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Package, Pencil } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminProducts, adminDeleteProduct, adminUpdateProduct } from "../../services/adminService";
import { fetchCategories } from "../../services/categoryService";
import { Badge, Button, Input, Textarea, Select, Pagination, LoadingSkeleton, ErrorState, ConfirmDialog, Modal } from "../../components/ui";
import { formatPrice } from "../../utils/format";
import { useDebounce } from "../../hooks/useDebounce";

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "out_of_stock", label: "Out of stock" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting_from", label: "Starting From" },
  { value: "contact_shop", label: "Contact for Price" },
];

export default function AdminProducts() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminProducts({ page, limit: 15, search: debouncedSearch }),
    [page, debouncedSearch]
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteProduct(toDelete._id);
      toast.success("Product deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete product.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Products</h1>

      <input
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent mb-5"
      />

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.products?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No products found.</p>
            )}
            {data?.products?.map((product, i) => (
              <div key={product._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-secondary/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product._id}`} className="font-medium text-primary hover:text-accent truncate block">
                    {product.name}
                  </Link>
                  <p className="text-xs text-secondary truncate">
                    {product.shopId?.shopName} · {product.categoryId?.name} · {formatPrice(product)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={product.isActive ? "success" : "danger"}>{product.isActive ? "Active" : "Hidden"}</Badge>
                  <Badge tone={product.availability === "available" ? "neutral" : "danger"}>
                    {product.availability === "available" ? "In stock" : "Out of stock"}
                  </Badge>
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(product)} title="Edit product" />
                  <Button size="sm" variant="ghost" icon={Trash2} className="text-danger hover:bg-danger/5" onClick={() => setToDelete(product)} title="Delete product" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={data?.pagination?.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <EditProductModal
        product={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); retry(); }}
        toast={toast}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        description={`"${toDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function EditProductModal({ product, onClose, onSaved, toast }) {
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      priceType: product.priceType || "fixed",
      availability: product.availability || "available",
      categoryId: product.categoryId?._id || product.categoryId || "",
      isActive: product.isActive ?? true,
    });
    setErrors([]);
    fetchCategories().then(setCategories).catch(() => {});
  }, [product?._id]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await adminUpdateProduct(product._id, form);
      toast.success("Product updated.");
      onSaved();
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not update product."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title="Edit Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
        <Input label="Name *" value={form.name || ""} onChange={(e) => set({ name: e.target.value })} required />
        <Textarea label="Description" value={form.description || ""} onChange={(e) => set({ description: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Price Type" value={form.priceType || "fixed"} onChange={(e) => set({ priceType: e.target.value })} options={PRICE_TYPE_OPTIONS} />
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            value={form.price ?? ""}
            onChange={(e) => set({ price: e.target.value })}
            disabled={form.priceType === "contact_shop"}
          />
          <Select label="Availability" value={form.availability || "available"} onChange={(e) => set({ availability: e.target.value })} options={AVAILABILITY_OPTIONS} />
          <Select
            label="Category"
            value={form.categoryId || ""}
            onChange={(e) => set({ categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
          />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-primary">Active (visible to customers)</span>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
