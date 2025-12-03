const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_MODEL = "gpt-4o-mini";
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || FALLBACK_MODEL;

/**
 * chatComplete
 * - Ensures response_format is provider-compatible:
 *   - "json_object" (string) -> { type: "json_object" } (object)
 *   - anything else -> omit (safer across providers)
 */
async function chatComplete({ system, user, temperature = 0.4, response_format = undefined }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }

  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    // Optional but recommended by OpenRouter:
    "HTTP-Referer": "https://voxtrail.local",
    "X-Title": "VoxTrail",
  };

  // Build request body
  const baseBody = {
    model: PRIMARY_MODEL,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  // ✅ Provider-safe response_format handling
  if (response_format === "json_object") {
    baseBody.response_format = { type: "json_object" };
  } else if (typeof response_format === "object" && response_format !== null) {
    // Allow passing an object directly if you ever need to
    baseBody.response_format = response_format;
  }
  // else: omit response_format entirely

  try {
    const { data } = await axios.post(OPENROUTER_API_URL, baseBody, { headers });
    const text = data?.choices?.[0]?.message?.content || "";
    return text;
  } catch (err) {
    const status = err?.response?.status;

    const shouldRetryWithFallback =
      status === 404 && baseBody.model !== FALLBACK_MODEL;

    if (!shouldRetryWithFallback) {
      throw err;
    }

    // Retry once with the known-good fallback model to avoid hard failures
    const fallbackBody = { ...baseBody, model: FALLBACK_MODEL };
    const { data } = await axios.post(OPENROUTER_API_URL, fallbackBody, {
      headers,
    });
    const text = data?.choices?.[0]?.message?.content || "";
    return text;
  }
}

module.exports = { chatComplete };
