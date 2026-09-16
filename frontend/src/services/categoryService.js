import api from "./api";

/**
 * GET /api/categories
 * Returns { categories }
 */
export const fetchCategories = async (params = {}) => {
  const { data } = await api.get("/categories", { params });
  return data.data.categories;
};

export const fetchCategoryById = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}`);
  return data.data.category;
};
