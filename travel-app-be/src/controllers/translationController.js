const SUPPORTED_PAIRS = new Set([
    "en-es", "es-en",
    "en-fr", "fr-en",
    "en-de", "de-en",
    "es-fr", "fr-es",
    "es-de", "de-es",
    "fe-de", "de-fe"
  ]);
  
  const translatorCache = new Map();
  
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
  
  exports.translateText = async (req, res) => {
    try {
      const { text, langPair } = req.body || {};
      if (!text || !langPair) {
        return res.status(400).json({ error: "Both 'text' and 'langPair' are required" });
      }
  
      const translator = await getTranslator(langPair);
      const result = await (await translator)(text);
      res.json({ translation: result[0]?.translation_text || "" });
    } catch (err) {
      console.error("Translation error details:", err);
      res.status(500).json({ error: "Translation failed." });
    }
  };
  
  exports.warmup = async (req, res) => {
    try {
      const pairs = (req.query.pairs || "")
        .split(",")
        .map(s => s.trim())
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
      console.error("Warmup error:", err);
      res.status(500).json({ error: "Warmup failed." });
    }
  };
  