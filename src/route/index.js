const express = require("express");
const router = express.Router();
const userRoute = require("./user.route");
const petsRoute = require("./pets.route");
const journalsRoute = require("./journals.route");
const pushNotificationRoute = require("./pushNotification.route");
const questions = require("./questions.route");
const smartJournalsRoute = require("./smartJournals.route");
// const petAiRoute = require("./petAi.route")

router.use("/user", userRoute);
router.use("/pets", petsRoute);
router.use("/journals", journalsRoute);
router.use("/pushNotification", pushNotificationRoute);
router.use("/questions", questions);
router.use("/smartJournals", smartJournalsRoute);
// router.use("/petAI", petAiRoute)

module.exports = router;
