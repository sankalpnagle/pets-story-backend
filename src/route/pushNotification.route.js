const express = require("express");
const router = express.Router();

const {
  sendNotificationHealthReminder,
  saveFCMToken,
  sendNotifications,
  sendFirebaseNotification
} = require("../controller/notification.controller");

router.post("/send-health-reminder", sendNotificationHealthReminder); // Register a new pet
router.post("/save-fcm-token", saveFCMToken); // Register a new pet
router.post("/send-notification", sendNotifications); // Register a new pet 


router.post("/send-firebase-notification", sendFirebaseNotification); // Register a new pet 


module.exports = router;
