import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleReminder = async (id, title, body, date) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const trigger = new Date(date);
    if (isNaN(trigger.getTime()) || trigger <= new Date()) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `SaynIQ Reminder: ${title || 'Saved Item'}`,
        body: body || 'You asked to be reminded about this content.',
        data: { itemId: id },
        sound: true,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
};

export const cancelReminder = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn("Could not cancel notification:", e);
  }
};
