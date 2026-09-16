import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Input, Textarea, Select, Button, LoadingSkeleton } from "../../components/ui";
import ImageUpload from "../../components/ui/ImageUpload";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { fetchShops } from "../../services/shopService";
import { createProduct } from "../../services/productService";
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

export default function OwnerProductCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    name: "", categoryId: "", description: "",
    price: "", priceType: "fixed", availability: "available",
    images: "", sizes: "", colors: "",
  });

  useEffect(() => {
    Promise.all([
      fetchShops({ ownerId: user?._id, limit: 1 }),
      fetchCategories(),
    ]).then(([shopData, cats]) => {
      setShop(shopData?.shops?.[0] ?? null);
      setCategories(cats);
    }).catch(() => {}).finally(() => setLoadingInit(false));
  }, [user?._id]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      const payload = {
        shopId: shop._id,
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        priceType: form.priceType,
        availability: form.availability,
        images: productImages.length ? productImages : (form.images ? form.images.split("\n").map((s) => s.trim()).filter(Boolean) : []),
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (form.priceType !== "contact_shop" && form.price !== "") {
        payload.price = Number(form.price);
      }
      await createProduct(payload);
      toast.success("Product added!");
      navigate("/owner/products");
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not create product."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) return <LoadingSkeleton count={4} />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Add Product</h1>

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

        <SectionTitle>Product Images</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {productImages.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-border/20">
              <img src={url} alt={`Product ${i+1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setProductImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary/70 text-white flex items-center justify-center hover:bg-danger"
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          ))}
          {productImages.length < 5 && (
            <ImageUpload
              value={null}
              onUpload={(url) => setProductImages((imgs) => [...imgs, url])}
              onRemove={() => {}}
              label=""
              aspectRatio="aspect-square"
            />
          )}
        </div>
        <p className="text-xs text-secondary">Or paste URLs (one per line):</p>
        <Textarea
          placeholder={"https://…\nhttps://…"}
          value={form.images}
          onChange={(e) => set({ images: e.target.value })}
          rows={2}
        />
        <Input label="Sizes (comma-separated)" placeholder="S, M, L, XL" value={form.sizes} onChange={(e) => set({ sizes: e.target.value })} />
        <Input label="Colors (comma-separated)" placeholder="Red, Blue, Black" value={form.colors} onChange={(e) => set({ colors: e.target.value })} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/products")}>Cancel</Button>
          <Button type="submit" loading={submitting}>Add Product</Button>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold text-secondary uppercase tracking-wide pt-2">{children}</p>;
}
