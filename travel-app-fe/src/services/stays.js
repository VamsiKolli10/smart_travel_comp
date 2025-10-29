// src/services/stays.js
import api from "./api";

export const searchStays = async (params) => {
  const { data } = await api.get("/stays/search", { params }); // no /api here
  return data;
};

export const getStay = async (id, params = {}) => {
  const { data } = await api.get(`/stays/${id}`, { params });
  return data;
};
