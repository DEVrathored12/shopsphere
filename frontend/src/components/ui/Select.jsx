import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Native <select> styled to match Input. `options` is an array of
 * { value, label }. Pass `placeholder` for a disabled first option.
 */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, containerClassName, id, ...props },
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
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-9 text-primary transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            error ? "border-danger" : "border-border",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
