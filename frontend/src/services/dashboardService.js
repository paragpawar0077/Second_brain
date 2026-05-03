import api from "./api";

export const getStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/recent");
  return response.data;
};

export const getInsights = async () => {
  const response = await api.get("/dashboard/insights");
  return response.data;
};