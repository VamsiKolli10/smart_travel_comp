const express = require("express");
const router = express.Router();

const { generatePhrases } = require("../controllers/phrasebookController");
const { requireFields } = require("../middleware/requireFields");

router.post(
  "/generate",
  requireFields(["topic", "sourceLang", "targetLang"]),
  generatePhrases
);

module.exports = router;
