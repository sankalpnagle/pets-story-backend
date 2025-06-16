const express = require("express");
const {
  getDailyQuestions,
  addDailyJournalQuestion,
  addComprehensiveQuestion,
  getComprehensiveQuestions,
  updateDailyJournalQuestion,
  updateComprehensiveJournalQuestion,
} = require("../controller/questions.controller");
const router = express.Router();

// router.post("/register", registerPet); // Register a new pet
// router.get("/get-petDetails-by-id/:petId", getPetById); // Register a new pet
router.get("/getDailyQuestions", getDailyQuestions);
router.get("/getComprehensiveQuestions", getComprehensiveQuestions);
router.post("/addDailyQuestions", addDailyJournalQuestion);
router.put("/updateDailyQuestion", updateDailyJournalQuestion);
router.post("/addComprehensiveQuestion", addComprehensiveQuestion);
router.put(
  "/updateComprehensiveJournalQuestion",
  updateComprehensiveJournalQuestion
);
// router.put("/:petId", updatePet); // Update a pet's details
// router.delete("/:petId", deletePet); // Delete a pet

module.exports = router;
