// server.js (CommonJS)
require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

// ✅ Import translation routes
const translationRoutes = require("./src/routes/translationRouters");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Initialize Firebase Admin using service account JSON file.
 * The path reads from env GOOGLE_APPLICATION_CREDENTIALS or defaults to ./serviceAccountKey.json
 */
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";
const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // optional: databaseURL: 'https://<PROJECT_ID>.firebaseio.com'
});

const db = admin.firestore();

/** Auth middleware — verifies Firebase ID token (from client) */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/** Simple public endpoint */
app.get("/", (req, res) => {
  res.send("Hello from Firebase + Node backend");
});

/** Firestore: list users collection (public) */
app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").limit(50).get();
    const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/** Firestore: create user (requires auth) */
app.post("/api/users", authenticate, async (req, res) => {
  try {
    const payload = req.body; // expected { name, email, ... }
    const docRef = await db.collection("users").add(payload);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

/** Example secured endpoint: get profile of logged-in user */
app.get("/api/profile", authenticate, async (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name || null,
  });
});

// ✅ Translation API route
app.use("/api/translate", translationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
