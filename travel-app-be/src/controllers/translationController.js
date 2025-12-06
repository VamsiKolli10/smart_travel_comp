const fs = require("fs");
const path = require("path");
const { sanitizeTextInput, normalizeLangPair } = require("../utils/validation");
const {
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");
const { getCached, setCached } = require("../utils/cache");

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
    logError(err, {
      endpoint: "translation:cache:init",
      cache: DEFAULT_MODEL_CACHE,
    });
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
        console.log(`🔄 Loading translation model for ${langPair}...`);
        const { pipeline } = await import("@xenova/transformers");

        // Add timeout for model loading
        const modelPromise = pipeline(
          "translation",
          `Xenova/opus-mt-${langPair}`
        );

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Model loading timeout")), 60000);
        });

        const model = await Promise.race([modelPromise, timeoutPromise]);
        console.log(`✅ Successfully loaded model for ${langPair}`);

        return model;
      } catch (error) {
        console.error(
          `❌ Failed to load model for ${langPair}:`,
          error.message
        );

        // Remove the cached promise so a transient failure does not brick the route
        translatorCache.delete(langPair);

        // Provide helpful error context
        if (
          error.message?.includes("network") ||
          error.message?.includes("fetch")
        ) {
          throw new Error(
            `Model download failed: ${error.message}. This may be due to network restrictions in the production environment.`
          );
        } else if (error.message?.includes("timeout")) {
          throw new Error(
            `Model loading timeout: The translation model took too long to load. This may happen on cold starts in serverless environments.`
          );
        } else {
          throw new Error(`Model loading error: ${error.message}`);
        }
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
    const cached = getCached("translation", cacheKey);
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
    setCached("translation", cacheKey, translation, TRANSLATION_CACHE_TTL_MS);
    res.json({ translation });
  } catch (err) {
    // Enhanced error logging for production debugging
    const errorContext = {
      endpoint: "/api/translate",
      textLength: text?.length || 0,
      langPair: langPair || "unknown",
      nodeEnv: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    logError(err, errorContext);

    // Provide more specific error messages for common issues
    let userMessage = "Translation failed";
    let errorCode = ERROR_CODES.EXTERNAL_SERVICE_ERROR;

    if (
      err.message?.includes("model") ||
      err.message?.includes("transformers")
    ) {
      userMessage =
        "Translation model unavailable - please try again in a moment";
      errorCode = "MODEL_UNAVAILABLE";
    } else if (
      err.message?.includes("timeout") ||
      err.message?.includes("Timeout")
    ) {
      userMessage = "Translation service is slow - please try again";
      errorCode = "SERVICE_TIMEOUT";
    } else if (
      err.message?.includes("network") ||
      err.message?.includes("Network")
    ) {
      userMessage = "Network error - please check your connection";
      errorCode = "NETWORK_ERROR";
    }

    res.status(500).json(
      createErrorResponse(
        500,
        errorCode,
        userMessage,
        process.env.NODE_ENV === "development"
          ? {
              originalError: err.message,
              stack: err.stack,
            }
          : undefined
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
    const failed = [];

    for (const p of pairs) {
      if (SUPPORTED_PAIRS.has(p)) {
        try {
          await getTranslator(p);
          warmed.push(p);
          console.log(`✅ Warmed up model: ${p}`);
        } catch (error) {
          failed.push({ pair: p, error: error.message });
          console.log(`❌ Failed to warm up model ${p}:`, error.message);
        }
      }
    }

    res.json({
      warmed,
      failed,
      totalRequested: pairs.length,
      totalWarmed: warmed.length,
    });
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

// Health check endpoint for translation service
exports.healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      service: "translation",
      timestamp: new Date().toISOString(),
      models: {
        loaded: Array.from(translatorCache.keys()),
        total: translatorCache.size,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        cacheDir: process.env.TRANSFORMERS_CACHE || "default",
      },
    };

    // Test a simple model if none are loaded
    if (translatorCache.size === 0) {
      try {
        await getTranslator("en-es");
        health.models.loaded = ["en-es"];
        health.models.total = 1;
        health.warning = "No models were pre-loaded, tested en-es on-demand";
      } catch (error) {
        health.status = "unhealthy";
        health.error = {
          code: "NO_MODELS_AVAILABLE",
          message: error.message,
        };
      }
    }

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    logError(err, { endpoint: "/api/translate/health" });
    res.status(503).json({
      status: "unhealthy",
      service: "translation",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};
