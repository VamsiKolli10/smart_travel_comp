const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "gpt-4o-mini";

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
  const body = {
    model: DEFAULT_MODEL,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  // ✅ Provider-safe response_format handling
  if (response_format === "json_object") {
    body.response_format = { type: "json_object" };
  } else if (typeof response_format === "object" && response_format !== null) {
    // Allow passing an object directly if you ever need to
    body.response_format = response_format;
  }
  // else: omit response_format entirely

  const { data } = await axios.post(OPENROUTER_API_URL, body, { headers });
  const text = data?.choices?.[0]?.message?.content || "";
  return text;
}

module.exports = { chatComplete };
