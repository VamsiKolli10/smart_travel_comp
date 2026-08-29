const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authenticate");
const { createCustomLimiter } = require("../utils/rateLimiter");
const { search, details } = require("../controllers/poiController");
const { validateQuery, validateParams } = require("../middleware/validate");
const { poiSearchSchema } = require("../utils/schemas");
const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");

const poiSearchLimiter = createCustomLimiter({
  windowMs: Number(process.env.POI_SEARCH_WINDOW_MS || 60_000),
  max: Number(process.env.POI_SEARCH_MAX_PER_IP || 30),
  message: "Too many POI search requests from this IP.",
});

const poiDetailLimiter = createCustomLimiter({
  windowMs: Number(process.env.POI_DETAIL_WINDOW_MS || 60_000),
  max: Number(process.env.POI_DETAIL_MAX_PER_IP || 60),
  message: "Too many POI detail requests from this IP.",
});

router.get(
  "/search",
  requireAuth({ allowRoles: ["user", "admin"] }),
  validateQuery(poiSearchSchema),
  poiSearchLimiter,
  asyncHandler(search)
);
router.get(
  "/:id",
  requireAuth({ allowRoles: ["user", "admin"] }),
  validateParams(
    z.object({
      id: z.string().min(1, "id is required"),
    })
  ),
  poiDetailLimiter,
  asyncHandler(details)
);

module.exports = router;
