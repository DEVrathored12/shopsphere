import api from "./api";

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data.data; // { user, token }
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data.data; // { user, token }
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data.user;
};

/** PUT /api/users/me — body: { name, phone, avatar } */
export const updateProfile = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  return data.data.user;
};

/** PUT /api/users/me/password — body: { currentPassword, newPassword, confirmNewPassword } */
export const changePassword = async (payload) => {
  const { data } = await api.put("/users/me/password", payload);
  return data;
};
