import { LocateFixed } from "lucide-react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
  { value: "1", label: "1+ stars" },
];

const RADIUS_OPTIONS = [
  { value: "", label: "Any distance" },
  { value: "1", label: "Within 1 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
  { value: "25", label: "Within 25 km" },
  { value: "50", label: "Within 50 km" },
];

/**
 * Filter controls shared by /explore and /categories/:slug. `tab`
 * decides which extra fields show (Open Now + rating only make sense
 * for shops; price range only for products — Product has no rating
 * field and Shop has no price, so these aren't arbitrary omissions).
 *
 * Note: there's no subcategory concept in the data model (Category is
 * flat, no parent field), so a "Subcategory" filter is intentionally
 * left out rather than faked.
 */
export default function FilterPanel({
  tab,
  categories = [],
  hideCategory = false,
  values,
  onChange,
  onClear,
  onApply,
  coords,
  locating,
  onLocate,
}) {
  const set = (patch) => onChange({ ...values, ...patch });

  return (
    <div className="space-y-5">
      {!hideCategory && (
        <Select
          label="Category"
          placeholder="All categories"
          value={values.category}
          onChange={(e) => set({ category: e.target.value })}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input label="City" placeholder="e.g. Udaipur" value={values.city} onChange={(e) => set({ city: e.target.value })} />
        <Input label="Area" placeholder="e.g. Malviya Nagar" value={values.area} onChange={(e) => set({ area: e.target.value })} />
      </div>

      <div>
        <p className="text-sm text-secondary mb-1.5">Distance</p>
        <div className="flex items-center gap-2">
          <Select
            className="flex-1"
            value={values.radius}
            onChange={(e) => set({ radius: e.target.value })}
            options={RADIUS_OPTIONS}
            disabled={!coords}
          />
          <Button type="button" variant="outline" size="md" icon={LocateFixed} onClick={onLocate} loading={locating}>
            {coords ? "Located" : "Use my location"}
          </Button>
        </div>
        {!coords && <p className="text-xs text-secondary mt-1">Share your location to filter or sort by distance.</p>}
      </div>

      {tab === "shops" && (
        <>
          <Select
            label="Rating"
            value={values.minRating}
            onChange={(e) => set({ minRating: e.target.value })}
            options={RATING_OPTIONS}
          />
          <label className="flex items-center gap-2.5 text-sm text-primary">
            <input
              type="checkbox"
              checked={values.openNow}
              onChange={(e) => set({ openNow: e.target.checked })}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            Open Now
          </label>
        </>
      )}

      {tab === "products" && (
        <div>
          <p className="text-sm text-secondary mb-1.5">Price Range (₹)</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={values.minPrice}
              onChange={(e) => set({ minPrice: e.target.value })}
            />
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={values.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClear}>
          Clear Filters
        </Button>
        {onApply && (
          <Button type="button" className="flex-1" onClick={onApply}>
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
