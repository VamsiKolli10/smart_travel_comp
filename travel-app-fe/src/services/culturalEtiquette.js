import api from "./api";

/**
 * Unified Culture Intelligence service client.
 *
 * Base URL in api.js already includes /api.
 * Endpoints:
 * - GET /culture/brief
 * - POST /culture/qa
 * - POST /culture/contextual
 */

/**
 * Fetch a culture brief for a destination.
 * @param {{ destination: string, culture?: string, language?: string }} params
 * @returns {Promise<{
 *   destination: string,
 *   culture: string,
 *   language: string,
 *   categories: {
 *     greetings: string[],
 *     dining: string[],
 *     dress_code: string[],
 *     gestures: string[],
 *     taboos: string[],
 *     safety_basics?: string[]
 *   },
 *   generatedAt: string
 * }>}
 */
export async function getCultureBrief({
  destination,
  culture,
  language = "en",
  refresh = false,
}) {
  try {
    const params = { destination, culture, language };
    if (refresh) {
      params.refresh = "1";
    }
    const response = await api.get("/culture/brief", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching culture brief:", error);
    throw error;
  }
}

/**
 * Ask a culture intelligence Q&A (Culture Coach).
 * @param {{
 *   destination: string,
 *   culture?: string,
 *   language?: string,
 *   question: string,
 *   history?: Array<{ q?: string, question?: string, a?: string, answer?: string }>
 * }} payload
 * @returns {Promise<{ answer: string, highlights: string[] }>}
 */
export async function askCultureQuestion(payload) {
  try {
    const response = await api.post("/culture/qa", payload);
    return response.data;
  } catch (error) {
    console.error("Error asking culture question:", error);
    throw error;
  }
}

/**
 * Get contextual micro-tips for translations, phrasebooks, POIs, or stays.
 * @param {Object} payload
 * @returns {Promise<{ tips: string[], severity: "info" | "important" }>}
 */
export async function getContextualCultureTips(payload) {
  try {
    const response = await api.post("/culture/contextual", payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching contextual culture tips:", error);
    throw error;
  }
}

/**
 * Backwards-compatible alias for legacy callers expecting cultural etiquette.
 * Delegates to getCultureBrief using new Culture Intelligence endpoint.
 * @deprecated Prefer getCultureBrief
 */
export async function getCulturalEtiquette(destination, language = "en") {
  const brief = await getCultureBrief({ destination, language });
  // Legacy callers may expect a flat object keyed by category.
  return brief.categories || brief;
}
