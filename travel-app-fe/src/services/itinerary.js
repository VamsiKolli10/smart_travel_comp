import api from "./api";

export async function generateItinerary(params = {}) {
  const { data } = await api.post("/itinerary/generate", params);
  return data; // { destination, params, days: [...], tips: [...] }
}
