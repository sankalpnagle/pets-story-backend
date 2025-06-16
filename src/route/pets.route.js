const express = require("express");
const router = express.Router();

const {
  registerPet,
  getPetsByUser,
  updatePet,
  deletePet,
  getPetById,
  petIdsByUser,
} = require("../controller/pets.controller");
const { askPetAI } = require("../controller/petAI.controller");

router.post("/register", registerPet); // Register a new pet
router.get("/get-petDetails-by-id/:petId", getPetById); // Register a new pet
router.get("/:ownerId", getPetsByUser); // Get all pets for a user
router.put("/:petId", updatePet); // Update a pet's details
router.delete("/:petId", deletePet); // Delete a pet
router.get("/petIdsByUser/:ownerId", petIdsByUser); // Delete a pet

router.post("/askPetAI", askPetAI); // Register a new pet

module.exports = router;
