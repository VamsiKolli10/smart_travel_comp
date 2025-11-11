const express = require("express");
const router = express.Router();
const { search, details } = require("../controllers/poiController");

// Public endpoints
router.get("/search", search);
router.get("/:id", details);

module.exports = router;

