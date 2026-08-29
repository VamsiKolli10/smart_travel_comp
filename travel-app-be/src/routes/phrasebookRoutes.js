const express = require("express");
const { generatePhrases } = require("../controllers/phrasebookController");
const { requireAuth } = require("../middleware/authenticate");
const { validateBody } = require("../middleware/validate");
const { phrasebookSchema } = require("../utils/schemas");
const asyncHandler = require("../utils/asyncHandler");
const { durableDailyQuota } = require("../middleware/durableQuota");

const router = express.Router();
const isProduction = !["test", "development"].includes(process.env.NODE_ENV);
const generationQuota =
  isProduction
    ? durableDailyQuota({
        name: "phrasebook-generation",
        userLimit: Number(process.env.PHRASEBOOK_DAILY_QUOTA || 20),
      })
    : (_req, _res, next) => next();

router.post(
  "/generate",
  requireAuth({ allowRoles: ["user", "admin"] }),
  validateBody(phrasebookSchema),
  generationQuota,
  asyncHandler(generatePhrases)
);

module.exports = router;
