const express = require("express");
const { translateText, warmup } = require("../controllers/translationController");

const router = express.Router();

router.post("/", translateText);      // POST /api/translate
router.get("/warmup", warmup);        // Optional: preload models

module.exports = router;
