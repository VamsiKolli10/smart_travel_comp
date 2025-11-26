import api from "./api";

/**
 * Resolve a freeform location string into structured parts (country, city, lat/lng).
 */
export const resolveLocation = async (query, params = {}) => {
  const q = typeof query === "string" ? query.trim() : "";
  const { data } = await api.get("/location/resolve", {
    params: { q, ...params },
  });
  return data;
};

export default { resolveLocation };
