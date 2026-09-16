import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/cn";

/** Clickable 1-5 star input, for review forms. */
export default function RatingInput({ value = 0, onChange, className }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="p-0.5"
        >
          <Star className={cn("w-6 h-6 transition-colors", n <= shown ? "fill-accent text-accent" : "text-border")} />
        </button>
      ))}
    </div>
  );
}
