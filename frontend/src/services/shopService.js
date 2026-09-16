import api from "./api";

/**
 * GET /api/shops
 * params: { category, city, area, search, sort, page, limit }
 * Returns { shops, pagination }
 */
export const fetchShops = async (params = {}) => {
  const { data } = await api.get("/shops", { params });
  return data.data;
};

/**
 * GET /api/shops/:id
 * Returns { shop, category, owner, products, rating, gallery, distanceKm }
 * `params` may include { lat, lng } to get distanceKm from the visitor.
 */
export const fetchShopById = async (shopId, params = {}) => {
  const { data } = await api.get(`/shops/${shopId}`, { params });
  return data.data;
};

export const createShop = async (payload) => {
  const { data } = await api.post("/shops", payload);
  return data.data.shop;
};

export const updateShop = async (shopId, payload) => {
  const { data } = await api.put(`/shops/${shopId}`, payload);
  return data.data.shop;
};

export const deleteShop = async (shopId) => {
  const { data } = await api.delete(`/shops/${shopId}`);
  return data;
};
