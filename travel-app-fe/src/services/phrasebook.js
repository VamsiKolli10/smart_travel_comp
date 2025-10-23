// Note: Uses axios instance at /api base (VITE_API_URL) to call backend.
// What it does: Calls POST /api/phrasebook/generate and returns the JSON payload.

import api from "./api";

/**
 * generatePhrasebook
 * @param {Object} params
 * @param {string} params.topic        - e.g., "ordering food", "airport check-in"
 * @param {string} params.sourceLang   - any name or code (e.g., "English" or "en")
 * @param {string} params.targetLang   - any name or code (e.g., "Español" or "es")
 * @param {number} [params.count=10]   - 3..25 phrases
 */
export async function generatePhrasebook({ topic, sourceLang, targetLang, count = 10 }) {
  const { data } = await api.post("/api/phrasebook/generate", {
    topic, sourceLang, targetLang, count,
  });
  return data; // { topic, sourceLang, targetLang, phrases: [...] }
}
