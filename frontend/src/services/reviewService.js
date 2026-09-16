import api from "./api";

export const fetchReviews = async (params = {}) => {
  const { data } = await api.get("/reviews", { params });
  return data.data;
};

export const createReview = async (payload) => {
  const { data } = await api.post("/reviews", payload);
  return data.data.review;
};

export const updateReview = async (reviewId, payload) => {
  const { data } = await api.put(`/reviews/${reviewId}`, payload);
  return data.data.review;
};

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};
