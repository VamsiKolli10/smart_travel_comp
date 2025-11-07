const express = require("express");
const router = express.Router();

const { generatePhrases } = require("../controllers/phrasebookController");
const { requireFields } = require("../middleware/requireFields");
const { requireAuth } = require("../middleware/authenticate");

router.post(
  "/generate",
  requireAuth({ allowRoles: ["user", "admin"] }),
  requireFields(["topic", "sourceLang", "targetLang"]),
  generatePhrases
);

module.exports = router;
