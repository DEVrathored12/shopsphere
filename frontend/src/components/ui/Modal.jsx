import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Base modal: dims the background, traps scroll, closes on Escape or
 * backdrop click. Compose ConfirmDialog and form modals on top of this.
 */
export default function Modal({ open, onClose, title, children, size = "md" }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full bg-white rounded-2xl border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-secondary" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
