import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay`ms
 * of no further changes. Used to avoid firing an API request on every
 * keystroke in search inputs.
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
