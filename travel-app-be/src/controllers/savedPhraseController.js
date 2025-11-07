const admin = require("firebase-admin");
const {
  sanitizeString,
  validateLangCode,
  ensureOwner,
} = require("../utils/validation");
const fdb = () => admin.firestore();

const detail = (e) =>
  [e?.message, e?.code != null ? `code=${e.code}` : "", e?.details ? `details=${e.details}` : ""]
    .filter(Boolean).join(" | ");

exports.listSaved = async (req, res) => {
  try {
    const ownership = ensureOwner(req, req.user?.uid);
    if (ownership.error) {
      return res.status(ownership.error === "Unauthorized" ? 401 : 403).json({
        error: ownership.error,
      });
    }

    const snap = await fdb()
      .collection("users").doc(ownership.value)
      .collection("saved_phrases")
      .orderBy("createdAt", "desc")
      .get();
    res.json({ items: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (e) {
    const msg = detail(e);
    if ((e && e.code === 5) || /NOT_FOUND/i.test(msg)) return res.json({ items: [] });
    console.error("listSaved error:", msg);
    res.status(500).json({ error: "Failed to list saved phrases", detail: msg });
  }
};

function buildPhrasePayload(body = {}) {
  const requiredFields = [
    ["phrase", 160],
    ["meaning", 280],
    ["usageExample", 360],
  ];

  const sanitized = {};
  for (const [field, max] of requiredFields) {
    const result = sanitizeString(body[field], {
      maxLength: max,
      label: field,
      allowEmpty: false,
    });
    if (result.error) return { error: result.error };
    sanitized[field] = result.value;
  }

  const transliteration = sanitizeString(body.transliteration, {
    maxLength: 160,
    label: "transliteration",
    allowEmpty: true,
  }).value;

  const topic = sanitizeString(body.topic, {
    maxLength: 120,
    label: "topic",
    allowEmpty: true,
  }).value;

  const sourceLang =
    body.sourceLang && body.sourceLang.trim()
      ? validateLangCode(body.sourceLang, { label: "sourceLang" })
      : { value: "" };
  if (sourceLang.error) return { error: sourceLang.error };

  const targetLang = validateLangCode(body.targetLang, {
    label: "targetLang",
  });
  if (targetLang.error) return { error: targetLang.error };

  return {
    value: {
      phrase: sanitized.phrase,
      transliteration,
      meaning: sanitized.meaning,
      usageExample: sanitized.usageExample,
      topic,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
    },
  };
}

exports.addSaved = async (req, res) => {
  try {
    const ownership = ensureOwner(req, req.user?.uid);
    if (ownership.error) {
      return res.status(ownership.error === "Unauthorized" ? 401 : 403).json({
        error: ownership.error,
      });
    }

    const payload = buildPhrasePayload(req.body || {});
    if (payload.error) {
      return res.status(400).json({ error: payload.error });
    }

    const docRef = await fdb()
      .collection("users").doc(ownership.value)
      .collection("saved_phrases")
      .add({
        ...payload.value,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.status(201).json({ id: docRef.id });
  } catch (e) {
    console.error("addSaved error:", detail(e));
    res.status(500).json({ error: "Failed to save phrase", detail: detail(e) });
  }
};

exports.removeSaved = async (req, res) => {
  try {
    const ownership = ensureOwner(req, req.user?.uid);
    if (ownership.error) {
      return res.status(ownership.error === "Unauthorized" ? 401 : 403).json({
        error: ownership.error,
      });
    }

    const ref = fdb()
      .collection("users").doc(ownership.value)
      .collection("saved_phrases").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    await ref.delete();
    res.json({ ok: true });
  } catch (e) {
    console.error("removeSaved error:", detail(e));
    res.status(500).json({ error: "Failed to delete saved phrase", detail: detail(e) });
  }
};
