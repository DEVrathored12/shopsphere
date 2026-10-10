import api from "./api";

export const fetchAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data.data;
};

export const fetchAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data.data.user;
};

export const toggleUserActive = async (userId, isActive) => {
  const { data } = await api.put(`/admin/users/${userId}/active`, { isActive });
  return data.data.user;
};

export const fetchAdminShops = async (params = {}) => {
  const { data } = await api.get("/admin/shops", { params });
  return data.data;
};

export const toggleShopVerified = async (shopId, isVerified) => {
  const { data } = await api.put(`/admin/shops/${shopId}/verify`, { isVerified });
  return data.data.shop;
};

export const toggleShopActive = async (shopId, isActive) => {
  const { data } = await api.put(`/shops/${shopId}`, { isActive });
  return data.data.shop;
};

export const adminDeleteShop = async (shopId) => {
  const { data } = await api.delete(`/shops/${shopId}`);
  return data;
};

export const fetchAdminProducts = async (params = {}) => {
  const { data } = await api.get("/admin/products", { params });
  return data.data;
};

export const adminDeleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
};

export const fetchAdminCategories = async (params = {}) => {
  const { data } = await api.get("/categories", { params: { all: true, ...params } });
  return data.data.categories;
};

export const createCategory = async (payload) => {
  const { data } = await api.post("/categories", payload);
  return data.data.category;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

export const adminUpdateShop = async (shopId, payload) => {
  const { data } = await api.put(`/shops/${shopId}`, payload);
  return data.data.shop;
};

export const adminUpdateProduct = async (productId, payload) => {
  const { data } = await api.put(`/products/${productId}`, payload);
  return data.data.product;
};

export const fetchAdminReviews = async (params = {}) => {
  const { data } = await api.get("/admin/reviews", { params });
  return data.data;
};

export const adminDeleteReview = async (reviewId) => {
  const { data } = await api.delete(`/admin/reviews/${reviewId}`);
  return data;
};

export const fetchAdminRequests = async (params = {}) => {
  const { data } = await api.get("/admin/requests", { params });
  return data.data;
};

export const adminToggleRequest = async (requestId) => {
  const { data } = await api.patch(`/admin/requests/${requestId}/toggle`);
  return data.data.request;
};

