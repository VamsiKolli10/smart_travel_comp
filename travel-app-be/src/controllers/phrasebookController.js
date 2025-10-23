const { chatComplete } = require("../lib/openrouterClient");


function sanitizeStr(s) {
  return (typeof s === "string" ? s.trim() : "");
}
function clamp(n, lo, hi) {
  const v = Number.parseInt(n ?? 10, 10);
  return Math.min(Math.max(v, lo), hi);
}

async function generatePhrases(req, res) {
  try {
    const topic = sanitizeStr(req.body?.topic);
    const sourceLang = sanitizeStr(req.body?.sourceLang);
    const targetLang = sanitizeStr(req.body?.targetLang);
    const n = 3
    // const n = clamp(req.body?.count, 3, 25);

    if (!topic || !sourceLang || !targetLang) {
      return res.status(400).json({ error: "Missing required fields", missing: ["topic", "sourceLang", "targetLang"] });
    }
    if (sourceLang.toLowerCase() === targetLang.toLowerCase()) {
      return res.status(400).json({ error: "sourceLang and targetLang must be different" });
    }

    const system = [
      "You generate compact travel phrasebooks as STRICT JSON.",
      "Output ONLY valid JSON (no markdown or extra text).",
      "Return phrases in the TARGET language.",
      "Include 'transliteration' ONLY when target language typically needs romanization (e.g., scripts like Arabic, Devanagari, Kanji/Kana, Hangul, Cyrillic).",
      "When transliteration is not useful, return an empty string for that field.",
      "Also include a 'sourceTranslation' which is the phrase translated into the SOURCE language (not a definition).",
      "Use safe, polite, travel-relevant language. Keep phrases short and practical."
    ].join(" ");

    // Schema the model should follow
    const user = JSON.stringify({
      instruction: "Create a phrase list for travelers.",
      topic,
      sourceLang,
      targetLang,
      count: n,
      format: {
        type: "object",
        properties: {
          topic: { type: "string" },
          sourceLang: { type: "string" },
          targetLang: { type: "string" },
          phrases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                targetPhrase: { type: "string", description: "The phrase in the TARGET language." },
                transliteration: { type: "string", description: "Romanization if helpful; otherwise empty string." },
                sourceTranslation: { type: "string", description: "The phrase translated into the SOURCE language." },
                usageExample: { type: "string", description: "Short example using the target phrase in context (in target language)." }
              },
              required: ["targetPhrase", "sourceTranslation", "usageExample"]
            }
          }
        },
        required: ["topic", "sourceLang", "targetLang", "phrases"]
      }
    });

    // Ask the model for JSON output; client normalizes response_format for providers
    const raw = await chatComplete({
      system,
      user,
      temperature: 0.4,
      response_format: "json_object"
    });

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      payload = match ? JSON.parse(match[0]) : null;
    }

    if (!payload || !Array.isArray(payload.phrases)) {
      return res.status(502).json({ error: "Upstream returned an unexpected format", raw });
    }

    // Normalize output to your stable response shape
    const normalized = {
      topic: payload.topic || topic,
      sourceLang: payload.sourceLang || sourceLang,
      targetLang: payload.targetLang || targetLang,
      phrases: payload.phrases.map(p => {
        const phrase = sanitizeStr(p.targetPhrase);
        const transliteration = sanitizeStr(p.transliteration);
        const meaning = sanitizeStr(p.sourceTranslation);
        const usageExample = sanitizeStr(p.usageExample);
        return { phrase, transliteration, meaning, usageExample };
      }).filter(p => p.phrase && p.meaning && p.usageExample)
    };

    return res.status(200).json(normalized);
  } catch (err) {
    console.error("Phrasebook generate error:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to generate phrases", detail: err?.message || "unknown" });
  }
}

module.exports = { generatePhrases };
