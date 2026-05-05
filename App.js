import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { VaultProvider } from './src/context/VaultContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </VaultProvider>
    </SafeAreaProvider>
  );
}
