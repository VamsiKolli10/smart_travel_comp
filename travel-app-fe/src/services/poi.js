import api from "./api";

export async function searchPOIs(params = {}) {
  const { data } = await api.get("/poi/search", { params });
  return data; // { items, total, page, pageSize }
}

export async function getPOIDetails(id, lang = "en") {
  const { data } = await api.get(`/poi/${encodeURIComponent(id)}`, { params: { lang } });
  return data;
}

