import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Numbered pagination with prev/next. Collapses long ranges with
 * ellipses so it never overflows small screens.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const add = (p) => pages.push(p);
  const windowSize = 1;

  add(1);
  for (let p = page - windowSize; p <= page + windowSize; p++) {
    if (p > 1 && p < totalPages) add(p);
  }
  if (totalPages > 1) add(totalPages);

  const deduped = [...new Set(pages)].sort((a, b) => a - b);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-white text-primary disabled:opacity-40 hover:bg-background transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {deduped.map((p, i) => {
        const prev = deduped[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="text-secondary px-1">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                p === page ? "bg-accent text-white" : "bg-white border border-border text-primary hover:bg-background"
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-white text-primary disabled:opacity-40 hover:bg-background transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
