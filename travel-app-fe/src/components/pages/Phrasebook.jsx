// Note: UI to generate a phrasebook from backend + Saved phrases in Firestore (not localStorage).
// What it does: Takes topic + source/target languages, calls backend, displays phrases,
// lets the signed-in user save/remove phrases to/from DB.

import { useEffect, useState } from "react";
import Button from "../common/Button";
import "./Phrasebook.css";
import { generatePhrasebook } from "../../services/phrasebook";
import {
  listSavedPhrases,
  addSavedPhrase,
  removeSavedPhrase,
} from "../../services/savedPhrases";

const COMMON_LANGS = [
  "English", "Spanish", "French","German"
];


// "Deutsch", "Italiano","Español",
//   "Português", "हिन्दी", "中文", "日本語", "한국어",
//   "العربية", "Русский", "Türkçe", "ไทย", "Bahasa Indonesia"


export default function Phrasebook() {
  const [topic, setTopic] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [count, setCount] = useState(8);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Saved phrases from Firestore
  const [saved, setSaved] = useState([]); // [{id, phrase, transliteration, ...}]
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Load saved phrases from DB on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSaved(true);
        const items = await listSavedPhrases();
        if (active) setSaved(items || []);
      } catch (e) {
        // If not signed in, this will 401. Show a soft hint in UI if you want.
        console.warn("Could not load saved phrases (likely unauthenticated):", e?.response?.status || e?.message);
      } finally {
        if (active) setLoadingSaved(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const canSubmit =
    topic.trim() &&
    sourceLang.trim() &&
    targetLang.trim() &&
    sourceLang.trim().toLowerCase() !== targetLang.trim().toLowerCase();

  async function onGenerate(e) {
    e?.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const data = await generatePhrasebook({
        topic,
        sourceLang,
        targetLang,
        count: Number(count) || 8,
      });
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Failed to generate";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(item) {
    console.log("Save clicked for:", item.phrase); // debug: confirm click fires
    const lang = result?.targetLang || targetLang;

    // Is it already saved (same phrase + targetLang)?
    const existing = saved.find(
      (p) => p.phrase === item.phrase && p.targetLang === lang
    );

    if (existing) {
      try {
        await removeSavedPhrase(existing.id);
        setSaved((s) => s.filter((p) => p.id !== existing.id));
        console.log("Removed from DB:", existing.id);
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message;
        console.error("Remove failed:", msg);
        alert(msg || "Failed to remove phrase");
      }
    } else {
      try {
        const id = await addSavedPhrase({
          phrase: item.phrase,
          transliteration: item.transliteration || "",
          meaning: item.meaning,
          usageExample: item.usageExample,
          topic: result?.topic || topic,
          sourceLang: result?.sourceLang || sourceLang,
          targetLang: lang,
        });
        setSaved((s) => [
          {
            id,
            phrase: item.phrase,
            transliteration: item.transliteration || "",
            meaning: item.meaning,
            usageExample: item.usageExample,
            topic: result?.topic || topic,
            sourceLang: result?.sourceLang || sourceLang,
            targetLang: lang,
          },
          ...s,
        ]);
        console.log("Saved to DB with id:", id);
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.error || e?.message;
        console.error("Save failed:", status, msg);
        if (status === 401) {
          alert("Please sign in to save phrases.");
        } else {
          alert(msg || "Failed to save phrase");
        }
      }
    }
  }

  function isSaved(item) {
    const lang = result?.targetLang || targetLang;
    return saved.some((p) => p.phrase === item.phrase && p.targetLang === lang);
  }

  return (
    <div className="phrasebook">
      <form className="phrasebook-controls" onSubmit={onGenerate}>
        <div className="controls-row">
          <div className="control">
            <label>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., airport check-in, emergency, directions"
            />
          </div>

          <div className="control">
            <label>From </label>
            <input
              list="langs"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              placeholder="Any language or code"
            />
          </div>

          <div className="control">
            <label>To </label>
            <input
              list="langs"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              placeholder="Any language or code"
            />
          </div>

          <datalist id="langs">
            {COMMON_LANGS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>

          {/* <div className="control small">
            <label>Count</label>
            <input
              type="number"
              min={3}
              max={25}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div> */}

          <div className="control button">
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {!canSubmit && (
          <div className="hint">
            Enter topic, source and target languages. Source and target must be different.
          </div>
        )}
      </form>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {result && (
        <div className="phrases-grid">
          {result.phrases.map((p, idx) => (
            <div className="phrase-card" key={idx}>
              <div className="phrase-english">{p.phrase}</div>
              {p.transliteration && (
                <div className="phrase-translit">{p.transliteration}</div>
              )}
              <div className="phrase-translation">{p.meaning}</div>
              <div className="phrase-usage">🗣 {p.usageExample}</div>
              <div className="phrase-actions">
                <button
                  type="button"
                  className={isSaved(p) ? "save-btn saved" : "save-btn"}
                  onClick={() => toggleSave(p)}
                  aria-label="Save phrase"
                  title="Save phrase"
                >
                  {isSaved(p) ? "★ Saved" : "☆ Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="saved-section">
        <h3>⭐ Saved Phrases</h3>
        {loadingSaved ? (
          <div className="muted">Loading your saved phrases…</div>
        ) : saved.length === 0 ? (
          <div className="muted">No saved phrases yet.</div>
        ) : (
          <div className="phrases-grid">
            {saved.map((p) => (
              <div className="phrase-card" key={p.id}>
                <div className="phrase-english">{p.phrase}</div>
                {p.transliteration && (
                  <div className="phrase-translit">{p.transliteration}</div>
                )}
                <div className="phrase-translation">{p.meaning}</div>
                <div className="phrase-usage">🗣 {p.usageExample}</div>
                <div className="meta">
                  <span className="chip">{p.topic}</span>
                  <span className="chip">
                    {p.sourceLang} → {p.targetLang}
                  </span>
                </div>
                <div className="phrase-actions">
                  <button
                    type="button"
                    className="save-btn saved"
                    onClick={async () => {
                      try {
                        await removeSavedPhrase(p.id);
                        setSaved((s) => s.filter((x) => x.id !== p.id));
                        console.log("Removed from DB:", p.id);
                      } catch (e) {
                        const msg = e?.response?.data?.error || e?.message;
                        alert(msg || "Failed to remove phrase");
                      }
                    }}
                  >
                    ✖ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
