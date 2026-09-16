import { cn } from "../../lib/cn";

const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Shows a user's avatar image, falling back to initials on a tinted circle. */
export default function Avatar({ src, name, size = "md", className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={cn("rounded-full object-cover shrink-0", SIZES[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-accent/15 text-accent font-semibold flex items-center justify-center shrink-0",
        SIZES[size],
        className
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
