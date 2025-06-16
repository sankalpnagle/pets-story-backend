const admin = require("../../config/firebaseConfig");

class NotificationService {
  static async sendNotification(deviceToken, title, body) {
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
  }
}
