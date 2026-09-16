import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Input, Textarea, Select, Button, LoadingSkeleton, ErrorState } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { fetchProductById, updateProduct } from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed price" },
  { value: "starting_from", label: "Starting from" },
  { value: "contact_shop", label: "Contact shop" },
];

const AVAILABILITY = [
  { value: "available", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

export default function OwnerProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([fetchProductById(id), fetchCategories()])
      .then(([{ product }, cats]) => {
        setCategories(cats);
        setForm({
          name: product.name || "",
          categoryId: product.categoryId?._id || product.categoryId || "",
          description: product.description || "",
          price: product.price ?? "",
          priceType: product.priceType || "fixed",
          availability: product.availability || "available",
          images: (product.images || []).join("\n"),
          sizes: (product.sizes || []).join(", "),
          colors: (product.colors || []).join(", "),
          isActive: product.isActive,
        });
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        priceType: form.priceType,
        availability: form.availability,
        isActive: form.isActive,
        images: form.images ? form.images.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (form.priceType !== "contact_shop" && form.price !== "") {
        payload.price = Number(form.price);
      }
      await updateProduct(id, payload);
      toast.success("Product updated!");
      navigate("/owner/products");
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not update product."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;
  if (loadError) return <ErrorState message="Product not found." />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 space-y-5">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}

        <Input label="Product Name *" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
        <Select
          label="Category *"
          value={form.categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
          placeholder="Select a category"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          required
        />
        <Textarea label="Description" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Price Type"
            value={form.priceType}
            onChange={(e) => set({ priceType: e.target.value })}
            options={PRICE_TYPES}
          />
          {form.priceType !== "contact_shop" && (
            <Input
              label="Price (₹)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
            />
          )}
          <Select
            label="Availability"
            value={form.availability}
            onChange={(e) => set({ availability: e.target.value })}
            options={AVAILABILITY}
          />
        </div>

        <Textarea
          label="Image URLs (one per line)"
          placeholder={"https://…\nhttps://…"}
          value={form.images}
          onChange={(e) => set({ images: e.target.value })}
          rows={3}
        />
        <Input label="Sizes (comma-separated)" placeholder="S, M, L, XL" value={form.sizes} onChange={(e) => set({ sizes: e.target.value })} />
        <Input label="Colors (comma-separated)" placeholder="Red, Blue, Black" value={form.colors} onChange={(e) => set({ colors: e.target.value })} />

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-primary">Product is active (visible to customers)</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/products")}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
