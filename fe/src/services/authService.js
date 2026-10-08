import api from "./api";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data; // { user, token }
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data; // { user, token }
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data.user;
};