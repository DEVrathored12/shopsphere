import api from "./api";

/**
 * GET /api/favorites
 * Returns { shops, products, shopIds, productIds } for the current user.
 */
export const fetchMyFavorites = async () => {
  const { data } = await api.get("/favorites");
  return data.data;
};

/** Saves a shop or product. Pass exactly one of { shopId } / { productId }. */
export const addFavorite = async (target) => {
  const { data } = await api.post("/favorites", target);
  return data.data;
};

/** Un-saves a shop or product. Pass exactly one of { shopId } / { productId }. */
export const removeFavorite = async (target) => {
  const { data } = await api.delete("/favorites", { data: target });
  return data.data;
};
