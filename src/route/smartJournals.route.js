const express = require("express");
const { addSmartJournals, getSmartJournalById, updateSmartJournalById, getAllSmartJournals, checkJournalStatus } = require("../controller/smartJournals.controller");
const router = express.Router();

router.post("/addSmartJournals", addSmartJournals);
router.post("/getSmartJournalById/:journalId", getSmartJournalById);
router.put("/updateSmartJournalById/:journalId", updateSmartJournalById);
router.post("/getAllSmartJournals", getAllSmartJournals);
router.post("/checkJournalStatus", checkJournalStatus);

module.exports = router;
