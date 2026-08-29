// src/services/stays.js
import api from "./api";

/**
 * 🔍 Search for stays (hotels, hostels, etc.)
 * Example params: { dest: "Paris", distance: 3, type: "hotel,hostel", amenities: "wifi,parking" }
 */
export const searchStays = async (params = {}) => {
  try {
    const { data } = await api.get("/stays/search", { params }); // ✅ no /api prefix
    return data;
  } catch (error) {
    console.error("Error fetching stays:", error);
    throw error;
  }
};

/**
 * 🏨 Get detailed info about a specific stay by its ID.
 * Example: getStay("node_12345")
 */
export const getStay = async (id, params = {}) => {
  if (!id) throw new Error("Missing stay id");
  try {
    const { data } = await api.get(`/stays/${encodeURIComponent(id)}`, { params }); // ✅ no /api prefix
    return data;
  } catch (error) {
    console.error("Error fetching stay details:", error);
    throw error;
  }
};
