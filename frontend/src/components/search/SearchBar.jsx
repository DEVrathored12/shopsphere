import { Search } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Controlled search input used in the hero and on /explore. Submission
 * is handled by the parent via onSubmit (Enter key or the form submit).
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search shops, products or categories...",
  size = "lg",
  className,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className={cn(
        "flex items-center gap-2 bg-white border border-border rounded-full shadow-sm focus-within:ring-2 focus-within:ring-accent transition-shadow",
        size === "lg" ? "px-5 py-3.5" : "px-4 py-2.5",
        className
      )}
    >
      <Search className={cn("text-secondary shrink-0", size === "lg" ? "w-5 h-5" : "w-4 h-4")} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent outline-none text-primary placeholder:text-secondary/70",
          size === "lg" ? "text-base" : "text-sm"
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity",
          size === "lg" ? "px-5 py-2 text-sm" : "px-4 py-1.5 text-xs"
        )}
      >
        Search
      </button>
    </form>
  );
}
