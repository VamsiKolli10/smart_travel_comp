// server.js (CommonJS) — single db declaration + default DB binding

require("dotenv").config();
process.env.FIRESTORE_PREFER_REST = process.env.FIRESTORE_PREFER_REST || "true";

const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// tiny request logger
app.use((req, _res, next) => {
  const hasAuth = (req.headers.authorization || "").startsWith("Bearer ");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} auth:${hasAuth}`);
  next();
});

/** -------- Firebase Admin init (explicit) -------- */
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";
const serviceAccount = require(path.resolve(serviceAccountPath));
const projectId = serviceAccount.project_id;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId,
  databaseURL: `https://${projectId}.firebaseio.com`,
});
console.log("Admin projectId:", admin.app().options.projectId);

// ✅ Declare db ONCE and bind to default database
const db = admin.firestore();
db.settings({ databaseId: "(default)" });
console.log("Firestore DB settings:", db._settings);

/** -------- Auth middleware -------- */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (e) {
    console.error("Token verification error:", e?.message || e);
    res.status(401).json({ error: "Unauthorized" });
  }
}

/** -------- Simple public endpoints -------- */
app.get("/", (_req, res) => res.send("Hello from Firebase + Node backend"));

app.get("/api/users", async (_req, res) => {
  try {
    const snapshot = await db.collection("users").limit(50).get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users", authenticate, async (req, res) => {
  try {
    const docRef = await db.collection("users").add(req.body || {});
    res.status(201).json({ id: docRef.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.get("/api/profile", authenticate, async (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email, name: req.user.name || null });
});

/** -------- Routes (mount AFTER init, BEFORE listen) -------- */
const translationRoutes = require("./src/routes/translationRouters");
const phrasebookRoutes  = require("./src/routes/phrasebookRoutes");
const savedPhraseRoutes = require("./src/routes/savedPhraseRoutes");

app.use("/api/translate", translationRoutes);
app.use("/api/phrasebook", phrasebookRoutes);
app.use("/api/saved-phrases", authenticate, savedPhraseRoutes);

/** -------- TEMP debug endpoints (remove later) -------- */
app.get("/_debug/firestore/collections", async (_req, res) => {
  try {
    const cols = await admin.firestore().listCollections();
    res.json({ ok: true, collections: cols.map((c) => c.id) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.post("/_debug/firestore/write", async (_req, res) => {
  try {
    const ref = admin.firestore().collection("debug_write").doc("ping");
    await ref.set({ ok: true, ts: Date.now() });
    res.json({ ok: true, path: ref.path, projectId: admin.app().options.projectId });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

/** -------- 404 -------- */
app.use((req, res) => res.status(404).json({ error: "Not Found", path: req.originalUrl }));

/** -------- Start server -------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
