import { useCallback, useEffect, useState } from "react";
import { fetchMyFavorites, addFavorite, removeFavorite } from "../services/favoriteService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * Tracks which shops/products the current user has saved, and exposes
 * optimistic toggle functions for the FavoriteButton scattered across
 * cards and detail pages. Unauthenticated visitors get empty sets and
 * a toast nudging them to log in when they try to save something —
 * favorites are never persisted locally-only, since Part 11's
 * Favorites page reads from the same API.
 */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const [shopIds, setShopIds] = useState(() => new Set());
  const [productIds, setProductIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setShopIds(new Set());
      setProductIds(new Set());
      setReady(true);
      return () => {};
    }
    setReady(false);
    fetchMyFavorites()
      .then(({ shopIds: sIds, productIds: pIds }) => {
        if (cancelled) return;
        setShopIds(new Set((sIds || []).map(String)));
        setProductIds(new Set((pIds || []).map(String)));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const toggle = useCallback(
    async (kind, id, nextActive) => {
      if (!isAuthenticated) {
        info("Log in to save favorites.");
        return;
      }
      const setter = kind === "shop" ? setShopIds : setProductIds;
      const key = kind === "shop" ? "shopId" : "productId";

      // Optimistic update, rolled back on failure.
      setter((prev) => {
        const next = new Set(prev);
        if (nextActive) next.add(id);
        else next.delete(id);
        return next;
      });

      try {
        if (nextActive) await addFavorite({ [key]: id });
        else await removeFavorite({ [key]: id });
      } catch {
        setter((prev) => {
          const next = new Set(prev);
          if (nextActive) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [isAuthenticated, info]
  );

  const toggleShop = useCallback((id, next) => toggle("shop", id, next), [toggle]);
  const toggleProduct = useCallback((id, next) => toggle("product", id, next), [toggle]);

  return { shopIds, productIds, toggleShop, toggleProduct, ready };
}
