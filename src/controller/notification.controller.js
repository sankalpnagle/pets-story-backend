const { db, admin, bucket } = require("../../config/firebaseConfig");
const NotificationService = require("../service/NotificationService");
// const webPush = require("web-push");

// Use the VAPID keys generated in Firebase Console
// webPush.setVapidDetails(
//   "mailto:your-email@example.com",
//   "BLvi8fPMVdSE6MM3E0NuI5T5r3tnVWA3lcMl6BL_zyJdLGgrHHBH8LVFVXuQZW1hGjw-lsbA4yM6GOI0g_WJNFw", // Replace with the public key
//   "CVZ_UyBL9O-mx0BTunPl9VqqZA_VZ9RqjB9wQ2cBvmU" // Replace with the private key
// );
// const message = {
//   notification: {
//     title: "Hello, User!",
//     body: "This is a test notification. neeraj",
//   },
//   token: "USER_FCM_TOKEN", // Replace with the saved FCM token
// };

// admin
//   .messaging()
//   .send(message)
//   .then((response) => {
//     console.log("Notification sent successfully:", response);
//   })
//   .catch((error) => {
//     console.error("Error sending notification:", error);
//   });
const sendNotificationHealthReminder = async (req, res) => {
  const { name, type, breed, age, weight, ownerId } = req.body;
  const subscription = "sd";
  const payload = "sdf";
  try {
    // await webPush.sendNotification(subscription, JSON.stringify(payload));
    console.log("Notification sent successfully!");
  } catch (error) {
    console.error("Error sending notification", error);
  }
};
const saveFCMToken = async (req, res) => {
  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ error: "Token and userId are required." });
  }

  try {
    const tokenRef = db.collection("fcmTokens").doc(userId);
    await tokenRef.set({ token }, { merge: true });
    res.status(200).json({ message: "FCM token saved successfully." });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ error: "Failed to save FCM token." });
  }
};
const sendNotification = async () =>
  // deviceToken: any,
  // title: any,
  // body: any
  {
    // try {
    //   const message = {
    //     notification: {
    //       title,
    //       body,
    //     },
    //     token: deviceToken,
    //   };
    //   const response = await admin.messaging().send(message);
    //   console.log("Notification sent successfully:", response);
    // } catch (error) {
    //   console.error("Error sending notification:", error);
    // }
  };
const sendNotifications = async (req, res) => {
  const { deviceToken, title, body } = req.body;
  if (!deviceToken || !title || !body) {
    return res.status(400).send({ message: "Invalid request data" });
  }
  try {
    await sendNotification(deviceToken, title, body);
    res.status(200).send({ message: "Notification sent successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Failed to send notification" });
  }
};

const sendNotificatione = async (deviceToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: deviceToken,
  };
  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (err) {
    throw err;
  }
};
const sendFirebaseNotification = async (req, res) => {
  const { deviceToken, title, body } = req.body;
  if (!deviceToken || !title || !body) {
    return res.status(400).send({ message: "Invalid request data" });
  }
  try {
    await sendNotificatione(deviceToken, title, body);
    res
      .status(200)
      .json({ message: "notification send successfully", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error sending notificatoin ${err}`, success: false });
  }
};

module.exports = {
  sendNotificationHealthReminder,
  saveFCMToken,
  sendNotification,
  sendNotifications,
  sendFirebaseNotification,
};
