import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Textarea = forwardRef(function Textarea(
  { label, error, className, containerClassName, id, rows = 4, ...props },
  ref
) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={id} className="block text-sm text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-primary placeholder:text-secondary/70 transition-colors resize-y",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
          error ? "border-danger" : "border-border",
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;
