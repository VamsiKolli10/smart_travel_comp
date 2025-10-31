// src/services/api.js
import axios from "axios";
import { getAuth } from "firebase/auth";

/**
 * Axios instance for all backend requests.
 * Base URL includes /api, so service paths should NOT prefix it again.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api", // ✅ includes /api
});

// 🔒 Automatically attach Firebase auth token (if logged in)
api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
