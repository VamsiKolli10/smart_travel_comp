const express = require("express");
const { translateText, warmup } = require("../controllers/translationController");
const { requireAuth } = require("../middleware/authenticate");
const { validateBody } = require("../middleware/validate");
const { translationSchema } = require("../utils/schemas");

const router = express.Router();

router.post(
  "/",
  requireAuth({ allowRoles: ["user", "admin"] }),
  validateBody(translationSchema),
  translateText
);
router.get("/warmup", requireAuth({ allowRoles: ["admin"] }), warmup);

module.exports = router;
