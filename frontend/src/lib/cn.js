/**
 * Tiny classnames combinator: joins truthy values with a space.
 * Keeps components free of a dependency just for conditional classes.
 */
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}
