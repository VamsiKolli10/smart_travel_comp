const admin = require("firebase-admin");
const fdb = () => admin.firestore();

const detail = (e) =>
  [e?.message, e?.code != null ? `code=${e.code}` : "", e?.details ? `details=${e.details}` : ""]
    .filter(Boolean).join(" | ");

exports.listSaved = async (req, res) => {
  try {
    const snap = await fdb()
      .collection("users").doc(req.user.uid)
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

exports.addSaved = async (req, res) => {
  try {
    const { phrase, transliteration = "", meaning, usageExample, topic = "", sourceLang = "", targetLang } = req.body || {};
    if (!phrase || !meaning || !usageExample || !targetLang) {
      return res.status(400).json({ error: "Required: phrase, meaning, usageExample, targetLang" });
    }
    const docRef = await fdb()
      .collection("users").doc(req.user.uid)
      .collection("saved_phrases")
      .add({
        phrase: String(phrase).trim(),
        transliteration: String(transliteration).trim(),
        meaning: String(meaning).trim(),
        usageExample: String(usageExample).trim(),
        topic: String(topic).trim(),
        sourceLang: String(sourceLang).trim(),
        targetLang: String(targetLang).trim(),
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
    const ref = fdb()
      .collection("users").doc(req.user.uid)
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
