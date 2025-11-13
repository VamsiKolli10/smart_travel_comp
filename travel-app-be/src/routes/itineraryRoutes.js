const express = require("express");
const router = express.Router();
const { generateItinerary } = require("../controllers/itineraryController");

// Public GET to avoid signature requirement; params via query
router.get("/generate", generateItinerary);

module.exports = router;

