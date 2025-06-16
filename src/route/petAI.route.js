const express = require("express");
const router = express.Router();

const { askPetAI } = require("../controller/petAI.controller");

router.post("/askPetAI", askPetAI); // Register a new pet
module.exports = router;
