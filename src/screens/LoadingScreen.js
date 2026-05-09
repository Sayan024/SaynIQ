import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VaultContext } from '../context/VaultContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const { dispatch } = useContext(VaultContext);
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderAnim = useRef(new Animated.Value(0)).current;
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 800, delay: 500, useNativeDriver: true }),
      // Simulated progress bar animation
      Animated.timing(loaderAnim, { toValue: 1, duration: 3000, useNativeDriver: false }),
    ]).start();

    // Show emergency bypass after 7 seconds
    const timer = setTimeout(() => {
      setShowBypass(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const handleBypass = () => {
    console.warn("User triggered emergency bypass");
    dispatch({ type: 'SET_READY' });
  };

  const loaderWidth = loaderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '95%'], // Stops just before end to simulate waiting for final async
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A0533', '#2D0A4E', '#1A0533']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <Animated.View style={[
          styles.logoWrapper,
          { transform: [{ scale: logoScale }], opacity: logoOpacity }
        ]}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.appName}>SaynIQ</Text>
          <Text style={styles.tagline}>Elevate Your Intelligence</Text>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.loaderBar}>
          <Animated.View style={[styles.loaderFill, { width: loaderWidth }]} />
        </View>
        
        {showBypass && (
          <TouchableOpacity style={styles.bypassBtn} onPress={handleBypass}>
            <Text style={styles.bypassText}>Taking longer than usual?</Text>
            <View style={styles.bypassRow}>
              <Text style={styles.bypassLink}>Continue to Vault</Text>
              <Ionicons name="arrow-forward" size={14} color="#A855F7" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logoWrapper: { width: 180, height: 180, marginBottom: 24, shadowColor: '#A855F7', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  logo: { width: '100%', height: '100%', borderRadius: 40 },
  appName: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1, textAlign: 'center' },
  tagline: { fontSize: 14, color: '#A855F7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, marginTop: 8, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 60, width: width * 0.7, alignItems: 'center' },
  loaderBar: { height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  loaderFill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 2 },
  bypassBtn: { marginTop: 24, alignItems: 'center' },
  bypassText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  bypassRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  bypassLink: { color: '#A855F7', fontSize: 14, fontWeight: '800' },
});
