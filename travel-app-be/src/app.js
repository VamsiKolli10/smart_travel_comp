require("dotenv").config();

process.env.FIRESTORE_PREFER_REST =
  process.env.FIRESTORE_PREFER_REST || "true";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const translationRoutes = require("./routes/translationRoutes");
const phrasebookRoutes = require("./routes/phrasebookRoutes");
const savedPhraseRoutes = require("./routes/savedPhraseRoutes");
const staysRoutes = require("./routes/staysRoutes");
const { db } = require("./config/firebaseAdmin");
const { requireAuth } = require("./middleware/authenticate");

const allowedOrigins =
  process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) || ["http://localhost:5173"];

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 60);
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";

function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: requestBodyLimit }));

  const limiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
  });
  app.use("/api", limiter);

  app.use((req, _res, next) => {
    const hasAuth = (req.headers.authorization || "").startsWith("Bearer ");
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.originalUrl
      } auth:${hasAuth}`
    );
    next();
  });

  app.get(
    "/api/users",
    requireAuth({ allowRoles: ["admin"] }),
    async (_req, res) => {
      try {
        const snapshot = await db.collection("users").limit(50).get();
        res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    }
  );

  app.post(
    "/api/users",
    requireAuth({ allowRoles: ["admin"] }),
    async (req, res) => {
      try {
        const docRef = await db.collection("users").add(req.body || {});
        res.status(201).json({ id: docRef.id });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to add user" });
      }
    }
  );

  app.get("/api/profile", requireAuth(), async (req, res) => {
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || req.user.displayName || null,
      roles: req.userRoles || [],
    });
  });

  app.use("/api/translate", translationRoutes);
  app.use("/api/phrasebook", phrasebookRoutes);
  app.use("/api/saved-phrases", requireAuth(), savedPhraseRoutes);
  app.use("/api/stays", staysRoutes);

  app.use((req, res) =>
    res.status(404).json({ error: "Not Found", path: req.originalUrl })
  );

  app.use((err, req, res, _next) => {
    if (err && err.message === "Not allowed by CORS") {
      return res.status(403).json({ error: "CORS: Origin not allowed" });
    }

    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { createApp };
