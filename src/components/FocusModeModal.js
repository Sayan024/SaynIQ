import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const FOCUS_QUOTES = [
  "Focus on being productive instead of busy.",
  "Deep work is the superpower of the 21st century.",
  "Your focus determines your reality.",
  "Eliminate distractions, focus on results.",
  "The secret of getting ahead is getting started.",
  "Quality is more important than quantity.",
  "One good focus session is worth 100 busy hours."
];

export default function FocusModeModal({ visible, onClose, onFinish }) {
  const [seconds, setSeconds] = useState(25 * 60); // 25 mins default
  const [isActive, setIsActive] = useState(false);
  const [quote, setQuote] = useState(FOCUS_QUOTES[0]);
  
  const timerRef = useRef(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setQuote(FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]);
    }
  }, [visible]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
      
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      clearInterval(timerRef.current);
      pulseScale.value = withTiming(1);
      if (seconds === 0 && isActive) {
        handleFinish();
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, seconds]);

  const handleFinish = () => {
    setIsActive(false);
    onFinish(25 * 60 - seconds); // report focus time
    onClose();
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(75, 29, 131, 0.4)', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>

        <Animated.View entering={FadeInUp} style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deep Work Session</Text>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={[styles.timerCircle, animatedStyle]}>
            <LinearGradient
              colors={['#D7E65A', '#B388FF']}
              style={styles.circleGradient}
            >
              <Text style={styles.timerText}>{formatTime(seconds)}</Text>
              <Text style={styles.timerLabel}>{isActive ? 'Focusing...' : 'Ready?'}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(400)} style={styles.quoteBox}>
             <Ionicons name="sparkles" size={24} color="#D7E65A" style={{ marginBottom: 12 }} />
             <Text style={styles.quoteText}>"{quote}"</Text>
          </Animated.View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: isActive ? '#F87171' : '#D7E65A' }]}
              onPress={() => setIsActive(!isActive)}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={28} color="#000" />
              <Text style={styles.mainBtnText}>{isActive ? 'Pause' : 'Start Focus'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resetBtn}
              onPress={() => { setIsActive(false); setSeconds(25 * 60); }}
            >
              <Text style={styles.resetText}>Reset Timer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.4)" />
          <Text style={styles.footerText}>No-Distraction Mode Active</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', top: 60, width: '100%', alignItems: 'center', paddingHorizontal: 24 },
  closeBtn: { position: 'absolute', left: 24, top: -4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', textTransform: 'uppercase', letterSpacing: 2 },

  content: { alignItems: 'center', paddingHorizontal: 40 },
  timerCircle: { 
    width: 240, height: 240, borderRadius: 120, 
    padding: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 48,
    shadowColor: '#D7E65A', shadowOpacity: 0.3, shadowRadius: 30, elevation: 15
  },
  circleGradient: { 
    width: '100%', height: '100%', borderRadius: 120, 
    justifyContent: 'center', alignItems: 'center' 
  },
  timerText: { fontSize: 52, fontWeight: '900', color: '#000', letterSpacing: -1 },
  timerLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', marginTop: 4 },

  quoteBox: { alignItems: 'center', marginBottom: 60 },
  quoteText: { fontSize: 18, fontWeight: '700', color: '#FFF', textAlign: 'center', fontStyle: 'italic', lineHeight: 28, opacity: 0.8 },

  controls: { width: '100%', alignItems: 'center', gap: 20 },
  mainBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    paddingHorizontal: 40, paddingVertical: 18, borderRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  mainBtnText: { fontSize: 18, fontWeight: '900', color: '#000' },
  resetBtn: { padding: 10 },
  resetText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700' },

  footer: { position: 'absolute', bottom: 50, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
});
