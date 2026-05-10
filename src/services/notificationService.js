import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage) {
  console.warn(errorMessage);
  // Optional: Alert the user in development
  if (__DEV__) Alert.alert('Push Notification Error', errorMessage);
}

/**
 * Registers for push notifications and returns the token.
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return null;
  }
  
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    handleRegistrationError('Project ID not found in expo config. Ensure EAS project is configured.');
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    
    console.log('Push Token:', pushTokenString);
    
    // Save token locally
    await AsyncStorage.setItem('@push_token', pushTokenString);
    
    // Track active user (Mock analytics)
    await trackActiveUser(pushTokenString);
    
    return pushTokenString;
  } catch (e) {
    handleRegistrationError(`${e}`);
    return null;
  }
}

/**
 * Tracks the active user in Firestore for the Admin Panel.
 * This saves the device info and push token so the admin can send notifications.
 */
async function trackActiveUser(token) {
  try {
    // Generate a unique ID for this device
    const userId = Device.osInternalBuildId || 'anonymous_' + Math.random().toString(36).substring(7);
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      pushToken: token,
      deviceName: Device.deviceName,
      os: Platform.OS === 'ios' ? 'iOS ' + Device.osVersion : 'Android ' + Device.osVersion,
      appVersion: Constants.expoConfig?.version || '1.0.0',
      lastActive: serverTimestamp(),
      status: 'Online'
    }, { merge: true });

    console.log('User tracked in Firestore successfully');
    
    // Also save locally to avoid over-tracking
    await AsyncStorage.setItem('@last_active_tracking', new Date().toDateString());
  } catch (error) {
    console.error('Error tracking user in Firestore:', error);
  }
}

/**
 * Checks for app updates in Firestore and displays a modal if a new version is available.
 */
export async function checkAppVersion(currentVersion = '1.0.0') {
  try {
    const versionRef = doc(db, 'settings', 'version');
    const versionSnap = await getDoc(versionRef);
    
    if (versionSnap.exists()) {
      const data = versionSnap.data();
      const latestVersion = data.latest || '1.0.0';
      const isCritical = data.forceUpdate || false;

      if (currentVersion < latestVersion) {
        Alert.alert(
          isCritical ? 'Update Required' : 'New Update Available',
          isCritical 
            ? 'A critical update is required to continue using the app.' 
            : 'A new version of SaynIQ is available. Would you like to update?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Update Now', onPress: () => Linking.openURL('https://sayn-iq.vercel.app/') }
          ]
        );
      }
    }
  } catch (error) {
    console.error('Error checking app version:', error);
  }
}

/**
 * Notification Settings Management
 */
export async function toggleNotifications(enabled) {
  if (enabled) {
    return await registerForPushNotificationsAsync();
  } else {
    // In a real scenario, you'd unregister or tell the backend to stop sending
    console.log('Notifications disabled by user');
    return null;
  }
}
