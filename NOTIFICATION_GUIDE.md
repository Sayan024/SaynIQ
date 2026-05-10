# SaynIQ Push Notification Implementation Guide

This guide explains how push notifications are implemented and how to manage them.

## 1. Technical Stack
- **Expo Notifications**: Handles device permissions, token generation, and receiving messages.
- **Firebase Cloud Messaging (FCM)**: The transport layer for Android notifications.
- **Backend (Mocked)**: In a production environment, you would send tokens to your server.

## 2. File Structure
- `src/services/notificationService.js`: Core logic for:
  - Requesting permissions.
  - Getting the Expo Push Token.
  - Initializing notification handlers.
  - Checking app versions.
- `src/screens/NotificationSettingsScreen.js`: User interface for:
  - Enabling/disabling notifications.
  - Viewing device diagnostics (Push Token).
- `App.js`: Initializes the service on app start.

## 3. Configuration
Push notifications require configuration in `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.yourname.sayniq"
    }
  }
}
```

## 4. How to Send Notifications
### Manually (Testing)
1. Go to the **Expo Push Tool**: [https://expo.dev/notifications](https://expo.dev/notifications)
2. Copy your **Expo Push Token** from the app (Notification Settings > Diagnostics).
3. Paste the token into the tool.
4. Enter a title and message.
5. Click **Send Notification**.

### From Backend (Node.js Example)
Use the `expo-server-sdk`:
```javascript
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

let messages = [{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'New Update Available 🚀',
  body: 'Update to v1.1.0 for new AI features!',
  data: { withSome: 'data' },
}];

let chunks = expo.chunkPushNotifications(messages);
(async () => {
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
})();
```

## 5. In-App Updates
The `checkAppVersion` function in `notificationService.js` compares the current app version with a remote value. If they don't match, an `Alert` is shown to the user.

## 6. Active User Tracking
When a user registers for notifications, the `trackActiveUser` function is called. This function:
1. Stores the last active date in `AsyncStorage`.
2. Sends the device token and OS info to your analytics backend (mocked for now).
