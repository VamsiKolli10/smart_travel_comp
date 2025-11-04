require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import Firebase configurations
const { db: clientDb } = require("./config/firebase"); // eslint-disable-line no-unused-vars
const { db: adminDb } = require("./config/firebaseAdmin");

const staysRoutes = require("./routes/staysRoutes"); // ✅ add this line
const translationRoutes = require("./routes/translationRoutes");
const phrasebookRoutes = require("./routes/phrasebookRoutes");
const savedPhraseRoutes = require("./routes/savedPhraseRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-prod-domain.com",
];

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use("/api", limiter);

// ---- Test routes ----
app.get("/", (req, res) => {
  res.json({
    message: "Firebase Node.js API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/test-firebase", async (req, res) => {
  try {
    const testDoc = adminDb.collection("test").doc("connection");
    await testDoc.set({
      message: "Firebase connection successful!",
      timestamp: new Date(),
    });
    res.json({ success: true, message: "Firebase is connected!" });
  } catch (error) {
    console.error("Firebase connection error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- API routes ----
app.use("/api/translation", translationRoutes);
app.use("/api/phrasebook", phrasebookRoutes);
app.use("/api/saved-phrases", savedPhraseRoutes);
app.use("/api/stays", staysRoutes); // ✅ now /api/stays works!

// ---- Error handler ----
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS: Origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
