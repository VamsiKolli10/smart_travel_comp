const express = require("express");
const {
  translateText,
  warmup,
} = require("../controllers/translationController");
const { requireAuth } = require("../middleware/authenticate");

const router = express.Router();

router.post("/", requireAuth({ allowRoles: ["user", "admin"] }), translateText);
router.get("/warmup", requireAuth({ allowRoles: ["admin"] }), warmup);

module.exports = router;
