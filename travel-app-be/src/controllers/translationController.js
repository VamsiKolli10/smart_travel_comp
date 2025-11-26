const { sanitizeTextInput, normalizeLangPair } = require("../utils/validation");
const {
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");

const SUPPORTED_PAIRS = new Set([
  "en-es",
  "en-fr",
  "en-de",
  "es-en",
  "es-fr",
  "es-de",
  "fr-en",
  "fr-es",
  "fr-de",
  "de-en",
  "de-es",
  "de-fr",
]);

const translatorCache = new Map();
const MAX_TEXT_LENGTH = Number(process.env.MAX_TRANSLATION_CHARS || 500);
const DEFAULT_WARM_PAIRS = (process.env.TRANSLATION_WARM_PAIRS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

async function getTranslator(langPair) {
  if (!SUPPORTED_PAIRS.has(langPair)) {
    throw new Error(`Unsupported langPair: ${langPair}`);
  }
  if (!translatorCache.has(langPair)) {
    const loader = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("translation", `Xenova/opus-mt-${langPair}`);
    })();
    translatorCache.set(langPair, loader);
  }
  return translatorCache.get(langPair);
}

// Best-effort warmup for configured pairs on startup
async function warmDefaultPairs() {
  if (!DEFAULT_WARM_PAIRS.length) return;
  await Promise.allSettled(
    DEFAULT_WARM_PAIRS.map((pair) =>
      SUPPORTED_PAIRS.has(pair) ? getTranslator(pair) : null
    )
  );
}
warmDefaultPairs().catch((e) =>
  logError(e, { endpoint: "translation:warmup:init" })
);

exports.translateText = async (req, res) => {
  try {
    const { text, langPair } = req.body || {};

    const cleanText = sanitizeTextInput(text, {
      maxLength: MAX_TEXT_LENGTH,
      label: "text",
    });
    if (cleanText.error) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            ERROR_CODES.VALIDATION_ERROR,
            cleanText.error
          )
        );
    }

    const normalizedPair = normalizeLangPair(langPair, SUPPORTED_PAIRS);
    if (normalizedPair.error) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            ERROR_CODES.VALIDATION_ERROR,
            normalizedPair.error
          )
        );
    }

    const translator = await getTranslator(normalizedPair.value);
    const result = await (await translator)(cleanText.value);
    res.json({ translation: result[0]?.translation_text || "" });
  } catch (err) {
    logError(err, { endpoint: "/api/translate" });
    res
      .status(500)
      .json(
        createErrorResponse(
          500,
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          "Translation failed"
        )
      );
  }
};

exports.warmup = async (req, res) => {
  try {
    const pairs = (req.query.pairs || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const warmed = [];
    for (const p of pairs) {
      if (SUPPORTED_PAIRS.has(p)) {
        await getTranslator(p);
        warmed.push(p);
      }
    }
    res.json({ warmed });
  } catch (err) {
    logError(err, { endpoint: "/api/translate/warmup" });
    res
      .status(500)
      .json(
        createErrorResponse(
          500,
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          "Warmup failed"
        )
      );
  }
};
