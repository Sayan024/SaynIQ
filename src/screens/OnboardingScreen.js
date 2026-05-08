import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../styles/theme';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Ready to build your second brain?',
    description: 'Save notes, links, and passwords securely in one beautiful place.',
    icon: 'cube',
    color: THEME.colors.primary,
  },
  {
    id: '2',
    title: 'AI that actually helps.',
    description: 'Instantly summarize articles and extract key concepts from your notes.',
    icon: 'sparkles',
    color: THEME.colors.success,
  },
  {
    id: '3',
    title: 'Your personal vault.',
    description: 'Let\'s set up your profile and get everything organized.',
    icon: 'lock-closed',
    color: THEME.colors.highlight,
  }
];

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await AsyncStorage.setItem('@has_onboarded', 'true');
      navigation.replace('MainTabs');
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      {/* Soft Background Blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      
      <View style={styles.content}>
        <Animated.View 
          key={step.id}
          entering={SlideInRight.duration(500)}
          exiting={SlideOutLeft.duration(500)}
          style={styles.slide}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={step.icon} size={100} color={step.color} />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <Animated.View 
              layout={Layout.springify()}
              key={index} 
              style={[
                styles.dot, 
                currentStep === index && styles.dotActive
              ]} 
            />
          ))}
        </View>
        <Button 
          title={currentStep === ONBOARDING_STEPS.length - 1 ? "GET STARTED" : "CONTINUE"} 
          onPress={handleNext} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'space-between',
  },
  blob: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 9999,
    opacity: 0.15,
  },
  blob1: {
    backgroundColor: THEME.colors.primary,
    top: -width * 0.5,
    right: -width * 0.5,
  },
  blob2: {
    backgroundColor: THEME.colors.highlight,
    bottom: -width * 0.2,
    left: -width * 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  slide: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.xxl,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    lineHeight: 40,
  },
  description: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: THEME.spacing.md,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: THEME.colors.primary,
  },
});
