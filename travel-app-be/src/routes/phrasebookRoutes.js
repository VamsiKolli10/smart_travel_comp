const express = require("express");
const { generatePhrases } = require("../controllers/phrasebookController");
const { requireAuth } = require("../middleware/authenticate");
const { validateBody } = require("../middleware/validate");
const { phrasebookSchema } = require("../utils/schemas");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/generate",
  requireAuth({ allowRoles: ["user", "admin"] }),
  validateBody(phrasebookSchema),
  asyncHandler(generatePhrases)
);

module.exports = router;
