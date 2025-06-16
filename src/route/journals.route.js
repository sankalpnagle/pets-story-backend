const express = require("express");
const {
  createJournalEntry,
  getJournalEntriesByPetId,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalById,
} = require("../controller/journals.controller");
const router = express.Router();

router.post("/create-journal", createJournalEntry);
router.get("/get-journal-details-by-id/:journalId", getJournalById);
router.get("/:petId", getJournalEntriesByPetId);
router.put("/:id", updateJournalEntry);
router.delete("/:id", deleteJournalEntry);

module.exports = router;
