import api from "./api";

/**
 * GET /api/products
 * params: { shopId, categoryId, search, availability, sort, page, limit }
 * Returns { products, pagination }
 */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data.data;
};

/**
 * GET /api/products/:id
 * Returns { product, distanceKm }. `params` may include { lat, lng }.
 */
export const fetchProductById = async (productId, params = {}) => {
  const { data } = await api.get(`/products/${productId}`, { params });
  return data.data;
};

export const createProduct = async (payload) => {
  const { data } = await api.post("/products", payload);
  return data.data.product;
};

export const updateProduct = async (productId, payload) => {
  const { data } = await api.put(`/products/${productId}`, payload);
  return data.data.product;
};

export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
};
