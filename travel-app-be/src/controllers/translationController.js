const fs = require("fs");
const path = require("path");
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
const TRANSLATION_CACHE_TTL_MS = Number(
  process.env.TRANSLATION_CACHE_TTL_MS || 10 * 60 * 1000
);
const TRANSLATION_CACHE_MAX = Number(
  process.env.TRANSLATION_CACHE_MAX || 200
);
const translationResultCache = new Map();
const DEFAULT_MODEL_CACHE =
  process.env.TRANSFORMERS_CACHE ||
  process.env.HF_HOME ||
  path.join(process.env.TMPDIR || "/tmp", "transformers");

function ensureModelCacheDir() {
  try {
    fs.mkdirSync(DEFAULT_MODEL_CACHE, { recursive: true });
    process.env.TRANSFORMERS_CACHE = DEFAULT_MODEL_CACHE;
    process.env.HF_HOME = DEFAULT_MODEL_CACHE;
    process.env.HF_HUB_CACHE = path.join(DEFAULT_MODEL_CACHE, "hub");
  } catch (err) {
    // If we can't create the cache directory, future downloads will fail; log for diagnostics
    logError(err, { endpoint: "translation:cache:init", cache: DEFAULT_MODEL_CACHE });
  }
}
ensureModelCacheDir();

async function getTranslator(langPair) {
  if (!SUPPORTED_PAIRS.has(langPair)) {
    throw new Error(`Unsupported langPair: ${langPair}`);
  }
  if (!translatorCache.has(langPair)) {
    const loader = (async () => {
      try {
        const { pipeline } = await import("@xenova/transformers");
        return pipeline("translation", `Xenova/opus-mt-${langPair}`);
      } catch (error) {
        // Remove the cached promise so a transient failure does not brick the route
        translatorCache.delete(langPair);
        throw error;
      }
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

function getTranslationCacheKey(text, langPair) {
  return `${langPair}::${text}`;
}

function getCachedTranslation(key) {
  const entry = translationResultCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    translationResultCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedTranslation(key, value) {
  if (!value || TRANSLATION_CACHE_TTL_MS <= 0 || TRANSLATION_CACHE_MAX <= 0) {
    return;
  }
  if (translationResultCache.size >= TRANSLATION_CACHE_MAX) {
    const oldestKey = translationResultCache.keys().next().value;
    if (oldestKey) translationResultCache.delete(oldestKey);
  }
  translationResultCache.set(key, {
    value,
    expiresAt: Date.now() + TRANSLATION_CACHE_TTL_MS,
  });
}

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

    const cacheKey = getTranslationCacheKey(
      cleanText.value,
      normalizedPair.value
    );
    const cached = getCachedTranslation(cacheKey);
    if (cached) {
      return res.json({ translation: cached, provider: "cache" });
    }

    const translatorLoader = await getTranslator(normalizedPair.value);
    let translator;
    try {
      translator = await translatorLoader;
    } catch (err) {
      translatorCache.delete(normalizedPair.value);
      throw err;
    }

    const result = await translator(cleanText.value);
    const translation = result[0]?.translation_text || "";
    setCachedTranslation(cacheKey, translation);
    res.json({ translation });
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
