let translators = {};

async function getTranslator(langPair) {
  if (!translators[langPair]) {
    // use dynamic import instead of require
    const { pipeline } = await import("@xenova/transformers");
    translators[langPair] = await pipeline("translation", `Xenova/opus-mt-${langPair}`);
  }
  return translators[langPair];
}

exports.translateText = async (req, res) => {
  try {
    const { text, langPair } = req.body;
    if (!text || !langPair) {
      return res.status(400).json({ error: "Both 'text' and 'langPair' are required." });
    }
    const translator = await getTranslator(langPair);
    const result = await translator(text);
    res.json({ translation: result[0].translation_text });
  } catch (err) {
    console.error("Translation error:", err);
    res.status(500).json({ error: "Translation failed." });
  }
};
