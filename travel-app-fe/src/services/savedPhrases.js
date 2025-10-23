// Uses axios instance (with Firebase ID token) to CRUD saved phrases in Firestore.

import api from "./api";

/** GET /api/saved-phrases -> { items: [...] } */
export async function listSavedPhrases() {
  const { data } = await api.get("/api/saved-phrases");
  return data.items;
}

/** POST /api/saved-phrases -> { id } */
export async function addSavedPhrase(payload) {
  const { data } = await api.post("/api/saved-phrases", payload);
  return data.id;
}

/** DELETE /api/saved-phrases/:id -> true */
export async function removeSavedPhrase(id) {
  await api.delete(`/api/saved-phrases/${id}`);
  return true;
}
