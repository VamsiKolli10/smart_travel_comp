const express = require("express");
const { generateItinerary } = require("../controllers/itineraryController");
const { validateQuery, validateBody } = require("../middleware/validate");
const { itineraryQuerySchema } = require("../utils/schemas");
const asyncHandler = require("../utils/asyncHandler");
const { durableDailyQuota } = require("../middleware/durableQuota");

const router = express.Router();

const isProduction = !["test", "development"].includes(process.env.NODE_ENV);
const generationQuota =
  isProduction
    ? durableDailyQuota({
        name: "itinerary-generation",
        userLimit: Number(process.env.ITINERARY_DAILY_QUOTA || 25),
      })
    : (_req, _res, next) => next();

router.get(
  "/generate",
  validateQuery(itineraryQuerySchema),
  generationQuota,
  asyncHandler(generateItinerary)
);

// POST is the preferred method for generation. GET remains for backwards compatibility.
router.post(
  "/generate",
  validateBody(itineraryQuerySchema),
  generationQuota,
  asyncHandler(generateItinerary)
);

module.exports = router;
