import api from "./api";

// GET to avoid request-signature requirement on POST
export async function generateItinerary(params = {}) {
  const { data } = await api.get("/itinerary/generate", { params });
  return data; // { destination, params, days: [...], tips: [...] }
}

