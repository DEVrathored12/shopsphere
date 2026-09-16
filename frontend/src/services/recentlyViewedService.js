const STORAGE_KEY = "shopsphere:recentlyViewed";
const MAX_ITEMS = 24;

/**
 * Recently-viewed shops/products, stored in localStorage for now.
 * Every function here is async even though localStorage is
 * synchronous — that's deliberate: it means swapping the body of
 * these three functions for real `/api/recently-viewed` calls later
 * is a one-file change, since every caller already awaits a Promise.
 *
 * Each entry keeps a small `snapshot` of the item (name, image, a
 * couple of display fields) captured at view time, so the Recently
 * Viewed page can render instantly without re-fetching — the
 * tradeoff is that the snapshot can go stale (e.g. a price change)
 * until the item is viewed again.
 */

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeStore(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable/full — recently-viewed is a nice-to-have, never fatal.
  }
}

/** Records (or bumps to the top) a shop/product view. */
export async function recordView({ type, id, snapshot }) {
  if (!type || !id) return;
  const key = String(id);
  const items = readStore().filter((item) => !(item.type === type && item.id === key));
  items.unshift({ type, id: key, snapshot, viewedAt: new Date().toISOString() });
  writeStore(items.slice(0, MAX_ITEMS));
}

/** Returns all recently viewed items, most recent first. */
export async function getRecentlyViewed() {
  return readStore();
}

/** Removes a single item. */
export async function removeRecentlyViewed({ type, id }) {
  const key = String(id);
  writeStore(readStore().filter((item) => !(item.type === type && item.id === key)));
}

/** Clears the whole history. */
export async function clearRecentlyViewed() {
  writeStore([]);
}
