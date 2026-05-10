import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Dimensions, Animated, Alert, Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function PinScreen({ onUnlock, mode = 'unlock' }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(mode === 'set' ? 'create' : 'enter'); // create, confirm, enter
  const [error, setError] = useState(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mode === 'unlock' && state.biometricsEnabled) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return;

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to Unlock SaynIQ',
      fallbackLabel: 'Use PIN',
    });

    if (result.success) {
      dispatch({ type: 'SET_APP_LOCK', payload: false });
      if (onUnlock) onUnlock();
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handlePress = (val) => {
    setError(null);
    if (val === 'back') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    const newPin = pin + val;
    if (newPin.length <= 4) {
      setPin(newPin);
      
      if (newPin.length === 4) {
        processFullPin(newPin);
      }
    }
  };

  const processFullPin = (enteredPin) => {
    if (step === 'create') {
      setConfirmPin(enteredPin);
      setPin('');
      setStep('confirm');
    } else if (step === 'confirm') {
      if (enteredPin === confirmPin) {
        dispatch({ type: 'SET_GLOBAL_PIN', payload: enteredPin });
        dispatch({ type: 'SET_APP_LOCK', payload: false });
        Alert.alert('Success', 'PIN set successfully!');
        if (onUnlock) onUnlock();
      } else {
        setError('PINs do not match');
        shake();
        setPin('');
        setStep('create');
      }
    } else {
      // Enter mode
      if (enteredPin === state.globalPin) {
        dispatch({ type: 'SET_APP_LOCK', payload: false });
        if (onUnlock) onUnlock();
      } else {
        setError('Invalid PIN');
        shake();
        setPin('');
      }
    }
  };

  const renderDot = (index) => {
    const isActive = pin.length > index;
    return (
      <View 
        key={index}
        style={[
          styles.dot, 
          { borderColor: theme.colors.primary },
          isActive && { backgroundColor: theme.colors.primary }
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {step === 'create' ? 'Create PIN' : step === 'confirm' ? 'Confirm PIN' : 'Enter Security PIN'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {step === 'create' ? 'Protect your vault with a 4-digit code.' : step === 'confirm' ? 'Enter the PIN again to confirm.' : 'Your financial and personal data is locked.'}
        </Text>
      </View>

      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(renderDot)}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'biometric', 0, 'back'].map((val, i) => {
          if (val === 'biometric') {
            return (
              <TouchableOpacity 
                key={i} 
                style={styles.key} 
                onPress={handleBiometricAuth}
                disabled={!state.biometricsEnabled || mode === 'set'}
              >
                {(state.biometricsEnabled && mode === 'unlock') && <Ionicons name="finger-print" size={28} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          }
          if (val === 'back') {
            return (
              <TouchableOpacity key={i} style={styles.key} onPress={() => handlePress('back')}>
                <Ionicons name="backspace-outline" size={28} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={i} style={styles.key} onPress={() => handlePress(val.toString())}>
              <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{val}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === 'unlock' && (
        <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Reset PIN', 'Please contact support or reinstall the app to reset your PIN. Note: Reinstalling will clear all local data.')}>
          <Text style={[styles.forgotText, { color: theme.colors.textSecondary }]}>Forgot PIN?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 60, paddingHorizontal: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', opacity: 0.7, lineHeight: 22 },
  
  dotsContainer: { flexDirection: 'row', gap: 24, marginBottom: 40 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  
  errorText: { color: '#F87171', fontWeight: '700', marginBottom: 20 },
  
  keypad: { width: '80%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { width: '33%', height: 90, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28, fontWeight: '700' },
  
  forgotBtn: { marginTop: 40, padding: 10 },
  forgotText: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
});
