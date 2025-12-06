const express = require("express");
const router = express.Router();

const {
  getBrief,
  askQuestion,
  getContextualTips,
} = require("../controllers/cultureIntelligenceController");
const { validateBody } = require("../middleware/validate");
const { cultureQuestionSchema, cultureContextualSchema } = require("../utils/schemas");
const {
  createRoleBasedLimiter,
  createCustomLimiter,
} = require("../utils/rateLimiter");
const asyncHandler = require("../utils/asyncHandler");

// Rate limiting strategy:
// - /brief: moderate shared limit (e.g., 40/min window) with role-aware behavior.
// - /qa: stricter, per-user/IP (10/min).
// - /contextual: lightweight but controlled (60/min).
//
// These sit on top of the global role-based + method-based limiters already
// applied in app.createApp().

const briefLimiter = createRoleBasedLimiter({
  windowMs: 60_000,
  limits: {
    anonymous: 20,
    user: 40,
    admin: 80,
  },
  defaultMessage: "Too many culture brief requests",
});

const qaLimiter = createCustomLimiter({
  windowMs: 60_000,
  max: 10,
  message: "Too many culture Q&A requests, please slow down.",
});

const contextualLimiter = createCustomLimiter({
  windowMs: 60_000,
  max: 60,
  message: "Too many contextual culture tips requests, please slow down.",
});

// GET /api/culture/brief
router.get("/brief", briefLimiter, asyncHandler(getBrief));

// POST /api/culture/qa
router.post(
  "/qa",
  qaLimiter,
  validateBody(cultureQuestionSchema),
  asyncHandler(askQuestion)
);

// POST /api/culture/contextual
router.post(
  "/contextual",
  contextualLimiter,
  validateBody(cultureContextualSchema),
  asyncHandler(getContextualTips)
);

module.exports = router;
