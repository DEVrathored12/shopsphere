/**
 * Very small in-process debounce so that rapid page refreshes from the
 * same visitor don't inflate a product's view count. This is a
 * best-effort/practical measure, not a strict anti-fraud system:
 * it's per-process memory, so it resets on restart and isn't shared
 * across multiple server instances. That's an acceptable trade-off
 * for a "views" counter (not a security-sensitive figure).
 */
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const lastSeen = new Map();

// Periodically forget old entries so the map doesn't grow forever.
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, ts] of lastSeen.entries()) {
    if (ts < cutoff) lastSeen.delete(key);
  }
}, WINDOW_MS).unref?.();

/**
 * Returns true the first time a given (visitor, product) pair is seen
 * within the debounce window, and false on subsequent calls until the
 * window expires — the caller should only increment views when this
 * returns true.
 */
export const shouldCountView = (visitorKey, productId) => {
  const key = `${visitorKey}:${productId}`;
  const now = Date.now();
  const last = lastSeen.get(key);

  if (last && now - last < WINDOW_MS) return false;

  lastSeen.set(key, now);
  return true;
};
