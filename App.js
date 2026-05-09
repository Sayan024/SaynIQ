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

import ImportModal from './src/components/ImportModal';

function AppContent() {
  const { state, addItem, theme } = useContext(VaultContext);
  const [showOnboarding, setShowOnboarding] = useState(null);
  
  // Share/Import State
  const [importVisible, setImportVisible] = useState(false);
  const [sharedItem, setSharedItem] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@onboarding_completed').then(value => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  // ── Deep Link Handling ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      
      if ((path === 'import' || path === 'share' || url.includes('/share')) && queryParams?.data) {
        try {
          // Decode Base64 safely
          const decodedData = decodeURIComponent(escape(_atob(queryParams.data)));
          const itemData = JSON.parse(decodedData);
          
          if (itemData && (itemData.text || itemData.url)) {
            setSharedItem(itemData);
            setImportVisible(true);
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
  }, [_atob]); // Keep _atob as dependency or empty if it's stable

  const handleConfirmImport = async () => {
    if (sharedItem) {
      // Duplicate detection
      const isDuplicate = state.items.some(i => 
        (i.url && i.url === sharedItem.url) || 
        (i.text && i.text === sharedItem.text && i.title === sharedItem.title)
      );

      if (isDuplicate) {
        Alert.alert("Already Saved", "This content is already in your Knowledge Hub.");
      } else {
        await addItem(sharedItem);
        // Toast or simple success alert
        Alert.alert("Success", "✨ Content saved to your Knowledge Hub!");
      }
    }
    setImportVisible(false);
    setSharedItem(null);
  };
  
  if (state.loading || showOnboarding === null) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }
  
  return (
    <>
      <AppNavigator />
      <ImportModal 
        visible={importVisible}
        item={sharedItem}
        theme={theme}
        onClose={() => setImportVisible(false)}
        onImport={handleConfirmImport}
      />
    </>
  );
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

