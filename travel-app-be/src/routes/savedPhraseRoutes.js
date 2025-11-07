// What it uses: Express. Requires app-level requireAuth middleware where mounted.
// What it does: Exposes list/add/delete endpoints for saved phrases.

const express = require("express");
const router = express.Router();

const { listSaved, addSaved, removeSaved } = require("../controllers/savedPhraseController");

// GET /api/saved-phrases
router.get("/", listSaved);

// POST /api/saved-phrases
router.post("/", addSaved);

// DELETE /api/saved-phrases/:id
router.delete("/:id", removeSaved);

module.exports = router;
