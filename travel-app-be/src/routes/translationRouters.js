const express = require("express");
const {
  translateText,
  warmup,
} = require("../controllers/translationController");

const router = express.Router();

router.post("/", translateText);
router.get("/warmup", warmup);

module.exports = router;
