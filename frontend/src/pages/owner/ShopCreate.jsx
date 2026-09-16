import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Input, Textarea, Select, Button } from "../../components/ui";
import OpeningHoursEditor, { defaultOpeningHours } from "../../components/ui/OpeningHoursEditor";
import { useToast } from "../../context/ToastContext";
import { createShop } from "../../services/shopService";
import { fetchCategories } from "../../services/categoryService";

export default function OwnerShopCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    shopName: "", category: "", description: "", phone: "", whatsapp: "",
    address: "", area: "", city: "", state: "", pincode: "",
    website: "", instagram: "", coverImage: "",
    openingHours: defaultOpeningHours(),
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await createShop(form);
      toast.success("Shop created!");
      navigate("/owner/shop");
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not create shop."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Create Your Shop</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 space-y-5">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}

        <SectionTitle>Basic Info</SectionTitle>
        <Input label="Shop Name *" value={form.shopName} onChange={(e) => set({ shopName: e.target.value })} required />
        <Select
          label="Category *"
          value={form.category}
          onChange={(e) => set({ category: e.target.value })}
          placeholder="Select a category"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          required
        />
        <Textarea label="Description" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} />

        <SectionTitle>Contact</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone *" value={form.phone} onChange={(e) => set({ phone: e.target.value })} required />
          <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
          <Input label="Website" value={form.website} onChange={(e) => set({ website: e.target.value })} />
          <Input label="Instagram handle" value={form.instagram} onChange={(e) => set({ instagram: e.target.value })} />
        </div>

        <SectionTitle>Location</SectionTitle>
        <Textarea label="Address *" value={form.address} onChange={(e) => set({ address: e.target.value })} rows={2} required />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Input label="Area" value={form.area} onChange={(e) => set({ area: e.target.value })} />
          <Input label="City *" value={form.city} onChange={(e) => set({ city: e.target.value })} required />
          <Input label="State" value={form.state} onChange={(e) => set({ state: e.target.value })} />
          <Input label="Pincode" value={form.pincode} onChange={(e) => set({ pincode: e.target.value })} />
        </div>

        <SectionTitle>Opening Hours</SectionTitle>
        <OpeningHoursEditor value={form.openingHours} onChange={(v) => set({ openingHours: v })} />

        <SectionTitle>Images</SectionTitle>
        <Input label="Cover Image URL" placeholder="https://…" value={form.coverImage} onChange={(e) => set({ coverImage: e.target.value })} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/shop")}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Shop</Button>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold text-secondary uppercase tracking-wide pt-2">{children}</p>;
}
