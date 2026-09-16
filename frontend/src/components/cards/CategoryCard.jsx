import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Tag } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Category tile for the homepage and /categories. `category.icon` is
 * expected to be a lucide-react icon name (e.g. "ShoppingBag"); falls
 * back to a generic tag icon when absent/unrecognized.
 */
export default function CategoryCard({ category, className }) {
  const Icon = (category.icon && Icons[category.icon]) || Tag;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        "group flex flex-col items-center text-center gap-3 bg-white border border-border rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent group-hover:text-white text-accent">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary">{category.name}</p>
        {typeof category.shopCount === "number" && (
          <p className="text-xs text-secondary mt-0.5">{category.shopCount} shops</p>
        )}
      </div>
    </Link>
  );
}
