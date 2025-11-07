// src/services/translation.js
import api from "./api";

/**
 * Translate text from source language to target language
 * @param {string} text - Text to translate
 * @param {string} langPair - Language pair (e.g., "en-es" for English to Spanish)
 * @returns {Promise<{translation: string}>} Translation result
 */
export async function translateText(text, langPair) {
  try {
    const { data } = await api.post("/translate", {
      text,
      langPair,
    });
    return data; // { translation: "..." }
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
}

