require("dotenv").config();

process.env.FIRESTORE_PREFER_REST = process.env.FIRESTORE_PREFER_REST || "true";

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
const {
  expressErrorHandler,
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("./utils/errorHandler");
const {
  createCustomLimiter,
  createRoleBasedLimiter,
  createMethodBasedLimiter,
} = require("./utils/rateLimiter");
const {
  addSecurityHeaders,
  securityLogging,
  enhancedAuthorization,
  validateRequestSignature,
} = require("./utils/security");

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) || ["http://localhost"];

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 60);
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";

// Role-based rate limits (requests per window)
const roleLimits = {
  admin: 120, // Admins can make more requests
  user: 60, // Regular users
  anonymous: 20, // Unauthenticated users have strict limits
};

// Endpoint-specific rate limits
const endpointLimits = {
  "/api/users": {
    windowMs: 60000, // 1 minute
    max: 20, // 20 requests per minute for user management
  },
  "/api/translate": {
    windowMs: 60000, // 1 minute
    max: 30, // 30 requests per minute for translation
  },
  "/api/phrasebook/generate": {
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute for phrasebook generation
  },
  "/api/stays/search": {
    windowMs: 60000, // 1 minute
    max: 40, // 40 requests per minute for stay search
  },
  "/api/stays/photo": {
    windowMs: 60000, // 1 minute
    max: 300, // 300 requests per minute for photo proxy
  },
};

// Method-based rate limits (requests per window for different HTTP methods)
const methodLimits = {
  GET: 100,
  POST: 50,
  PUT: 30,
  PATCH: 20,
  DELETE: 10,
};

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

  // Use Helmet with custom configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.openrouter.ai"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      xssFilter: true,
      noSniff: true,
      frameGuard: "deny",
      ieNoOpen: true,
      noOpen: true,
    })
  );

  app.use(express.json({ limit: requestBodyLimit }));

  // Apply role-based rate limiting to the entire API
  app.use(
    "/api",
    createRoleBasedLimiter({
      windowMs: rateLimitWindowMs,
      limits: roleLimits,
      defaultMessage: "Too many requests for your role",
    })
  );

  // Apply endpoint-specific rate limiting
  Object.entries(endpointLimits).forEach(([path, limits]) => {
    app.use(path, createCustomLimiter(limits));
  });

  // Apply method-based rate limiting to the entire API
  app.use(
    "/api",
    createMethodBasedLimiter({
      windowMs: rateLimitWindowMs,
      limits: methodLimits,
      defaultMessage: "Too many requests for this HTTP method",
    })
  );

  // Add enhanced security middleware
  app.use(addSecurityHeaders());
  app.use(enhancedAuthorization({ strictMode: true }));
  app.use(securityLogging({ trackSuspiciousActivity: true }));

  // Validate request signatures for sensitive endpoints
  app.use(
    validateRequestSignature({
      secret: process.env.REQUEST_SIGNING_SECRET || "default-signing-secret",
      methods: ["POST", "PUT", "PATCH", "DELETE"],
    })
  );

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
        logError(e, { endpoint: "/api/users" });
        res
          .status(500)
          .json(
            createErrorResponse(
              500,
              ERROR_CODES.DB_ERROR,
              "Failed to fetch users"
            )
          );
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
        logError(e, { endpoint: "/api/users", body: req.body });
        res
          .status(500)
          .json(
            createErrorResponse(500, ERROR_CODES.DB_ERROR, "Failed to add user")
          );
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
    res.status(404).json(
      createErrorResponse(404, ERROR_CODES.NOT_FOUND, "Not Found", {
        path: req.originalUrl,
      })
    )
  );

  app.use(expressErrorHandler);

  return app;
}

module.exports = { createApp };
