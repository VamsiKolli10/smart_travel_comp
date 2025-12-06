const express = require("express");
const { generateItinerary } = require("../controllers/itineraryController");
const { validateQuery } = require("../middleware/validate");
const { itineraryQuerySchema } = require("../utils/schemas");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/generate",
  validateQuery(itineraryQuerySchema),
  asyncHandler(generateItinerary)
);

module.exports = router;
