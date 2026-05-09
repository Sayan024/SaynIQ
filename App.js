import React, { useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { _atob } from './src/services/shareService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { VaultProvider, VaultContext } from './src/context/VaultContext';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

function AppContent() {
  const { state, addItem } = useContext(VaultContext);
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@onboarding_completed')
      .then(value => {
        setShowOnboarding(value !== 'true');
      })
      .catch(() => {
        setShowOnboarding(false); // Fallback to app if storage fails
      });
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

