import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary: "bg-accent text-white hover:opacity-90 disabled:opacity-60",
  secondary: "bg-primary text-white hover:opacity-90 disabled:opacity-60",
  outline: "bg-transparent text-primary border border-border hover:bg-white disabled:opacity-60",
  ghost: "bg-transparent text-primary hover:bg-black/5 disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-60",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-base px-6 py-3 rounded-xl gap-2",
};

/**
 * Base button used across the app. Handles loading state, icons, and
 * consistent focus/hover treatment so no page re-implements this.
 */
const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, icon: Icon, iconPosition = "left", className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 whitespace-nowrap",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
    </button>
  );
});

export default Button;
