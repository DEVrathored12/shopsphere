import { forwardRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Labeled text input with optional leading icon and error message.
 * Uncontrolled/controlled agnostic — forwards all native input props.
 */
const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, containerClassName, id, ...props },
  ref
) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={id} className="block text-sm text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-primary placeholder:text-secondary/70 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            Icon && "pl-9",
            error ? "border-danger" : "border-border",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
