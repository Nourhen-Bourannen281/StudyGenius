import api from "./api";

export const getMyBadges = async () => {
  const response = await api.get("/badges");
  return response.data.badges;
};

export const getMyStreak = async () => {
  const response = await api.get("/badges/streak");
  return response.data.streak;
};