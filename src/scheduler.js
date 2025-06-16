const schedule = require("node-schedule");
const { db, admin } = require("../config/firebaseConfig");
// const { db, admin, bucket } = require("../");

const sendNotificatione = async (deviceToken, title, body) => {
  try {
    // Firebase Cloud Messaging (FCM) logic
    await admin.messaging().send({
      token: deviceToken,
      notification: {
        title,
        body,
      },
    });
    console.log(`Notification sent to ${deviceToken}`);
  } catch (err) {
    console.error(`Error sending notification to ${deviceToken}:`, err);
  }
};

// Function to send notifications to all users
const sendFirebaseNotification = async (title, body) => {
  try {
    // Fetch all FCM tokens from the database
    const tokensSnapshot = await db.collection("fcmTokens").get();
    if (tokensSnapshot.empty) {
      console.log("No FCM tokens found.");
      return;
    }

    // Loop through tokens and send notifications
    const promises = [];
    tokensSnapshot.forEach((doc) => {
      const { token } = doc.data();
      if (token) {
        promises.push(sendNotificatione(token, title, body));
      }
    });

    // Wait for all notifications to be sent
    await Promise.all(promises);
    console.log("Notifications sent to all users.");
  } catch (err) {
    console.error("Error sending notifications to users:", err);
  }
};

// Schedule the notification at 6:00 PM daily
const scheduleNotification = () => {
  schedule.scheduleJob("00 18 * * *", async () => {
    console.log("Scheduler triggered at 6:00 PM");

    // Title and body of the notification
    const title = "Story of pets health reminder.";
    const body = "This is your health reminder notification.";

    // Send notification to all users
    await sendFirebaseNotification(title, body);
  });
};

module.exports = scheduleNotification;
