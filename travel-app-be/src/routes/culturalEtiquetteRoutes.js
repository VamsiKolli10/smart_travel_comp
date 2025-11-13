const express = require("express");
const router = express.Router();
const {
  generateCulturalEtiquette,
} = require("../controllers/culturalEtiquetteController");

// Legacy: mounted at /api/cultural-etiquette in app.js.
// This now proxies to the unified Culture Intelligence brief implementation.
router.get("/", generateCulturalEtiquette);

module.exports = router;
