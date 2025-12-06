// What it uses: Express. Requires app-level requireAuth middleware where mounted.
// What it does: Exposes list/add/delete endpoints for saved phrases.

const express = require("express");
const router = express.Router();

const { listSaved, addSaved, removeSaved } = require("../controllers/savedPhraseController");
const { validateBody, validateParams } = require("../middleware/validate");
const { savedPhraseSchema } = require("../utils/schemas");
const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/saved-phrases
router.get("/", asyncHandler(listSaved));

// POST /api/saved-phrases
router.post("/", validateBody(savedPhraseSchema), asyncHandler(addSaved));

// DELETE /api/saved-phrases/:id
router.delete(
  "/:id",
  validateParams(
    z.object({
      id: z.string().min(1, "id is required"),
    })
  ),
  asyncHandler(removeSaved)
);

module.exports = router;
