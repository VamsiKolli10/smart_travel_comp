import api from "./api";

export async function fetchProfile() {
  const { data } = await api.get("/api/profile");
  return data;
}

export async function updateUserProfile(updates) {
  const { data } = await api.patch("/api/users/" + updates.id, updates);
  return data;
}
