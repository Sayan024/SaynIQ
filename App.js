import React, { useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { _atob } from './src/services/shareService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { VaultProvider, VaultContext } from './src/context/VaultContext';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { registerForPushNotificationsAsync, checkAppVersion } from './src/services/notificationService';


function AppContent() {
  const { state, addItem } = useContext(VaultContext);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@onboarding_completed')
      .then(value => {
        setShowOnboarding(value !== 'true');
      })
      .catch(() => {
        setShowOnboarding(false);
      });

    // Initialize Notifications & Version Check
    registerForPushNotificationsAsync();
    checkAppVersion('1.0.0');

    // Listener for when a notification is received while the app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification Received:', notification);
    });

    // Listener for when a user interacts with a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url;
      
      if (url) {
        console.log('Opening deep link:', url);
        Linking.openURL(url.toString()).catch(err => {
          console.error('Failed to open URL:', err);
        });
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // ── Deep Link Handling ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      
      if ((path === 'import' || path === 'share') && queryParams?.data) {
        try {
          // Decode Base64
          const decodedData = decodeURIComponent(escape(_atob(queryParams.data)));
          const itemData = JSON.parse(decodedData);
          
          if (itemData && (itemData.text || itemData.url)) {
            Alert.alert(
              "Import Shared Content",
              `Would you like to import "${itemData.title || 'Untitled'}" into your Knowledge Hub?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Import", 
                  onPress: async () => {
                    await addItem(itemData);
                    Alert.alert("Success", "Content imported successfully! ✨");
                  } 
                }
              ]
            );
          }
        } catch (error) {
          console.error("Deep Link Parse Error:", error);
          Alert.alert("Import Error", "The shared link is invalid or corrupted.");
        }
      }
    };

    // Handle initial URL if app was closed
    Linking.getInitialURL().then(handleUrl);

    // Handle incoming URLs while app is open
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    
    return () => subscription.remove();
  }, [addItem]);
  
  if (state.loading || showOnboarding === null) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }
  
  return <AppNavigator />;
}


export default function App() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <AppContent />
        <StatusBar style="light" />
      </VaultProvider>
    </SafeAreaProvider>
  );
}

