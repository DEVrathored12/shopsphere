import axios from "axios";

const TOKEN_KEY = "shopsphere_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the bearer token to every outgoing request, if present.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so callers can read a consistent message/errors shape
// regardless of whether the failure was a network error or an API error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.message;
    const apiErrors = error.response?.data?.errors;
    return Promise.reject({
      status: error.response?.status,
      message: apiMessage || error.message || "Something went wrong",
      errors: apiErrors || [],
    });
  }
);

export default api;
