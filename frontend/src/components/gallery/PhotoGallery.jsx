import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Thumbnail grid + click-to-open lightbox. Used for a shop's gallery
 * and a product's image set alike — anywhere we show >1 image.
 */
export default function PhotoGallery({ images = [], alt = "", className, thumbClassName }) {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, images.length]);

  if (!images.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-secondary">
        <ImageOff className="w-6 h-6 mb-2" />
        <p className="text-sm">No photos yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden bg-border/40 group",
              thumbClassName
            )}
          >
            <img
              src={src}
              alt={`${alt} photo ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-primary/90 flex items-center justify-center px-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpenIndex(null);
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img
              src={images[openIndex]}
              alt={`${alt} photo ${openIndex + 1}`}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i + 1) % images.length)}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <span className="absolute bottom-4 text-xs text-white/70">
              {openIndex + 1} / {images.length}
            </span>
          </div>,
          document.body
        )}
    </>
  );
}
