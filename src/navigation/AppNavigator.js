import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

import HomeScreen from '../screens/HomeScreen';
import AddItemScreen from '../screens/AddItemScreen';
import NotesScreen from '../screens/NotesScreen';
import PasswordsScreen from '../screens/PasswordsScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';
import AboutScreen from '../screens/AboutScreen';
import AIChatScreen from '../screens/AIChatScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { THEME } from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: THEME.colors.background,
    card: THEME.colors.background,
    text: THEME.colors.textPrimary,
    primary: THEME.colors.primary,
    border: THEME.colors.border,
  },
};

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Notes') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Passwords') iconName = focused ? 'key' : 'key-outline';
          else if (route.name === 'AI Chat') iconName = focused ? 'sparkles' : 'sparkles-outline';

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        tabBarShowLabel: false,
        headerStyle: { 
          backgroundColor: THEME.colors.background, 
          borderBottomWidth: 1, 
          borderBottomColor: THEME.colors.border,
          shadowOpacity: 0,
          elevation: 0
        },
        headerTintColor: THEME.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(43, 18, 80, 0.95)' }]} />
          )
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Passwords" component={PasswordsScreen} />
      <Tab.Screen name="AI Chat" component={AIChatScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasOnboarded = await AsyncStorage.getItem('@has_onboarded');
        setIsFirstLaunch(hasOnboarded === null);
      } catch (error) {
        setIsFirstLaunch(false); // Fallback
      }
    }
    checkOnboarding();
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={customDarkTheme}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false, presentation: 'modal' }}
        initialRouteName={isFirstLaunch ? 'Onboarding' : 'MainTabs'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="AddPassword" component={AddPasswordScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingHorizontal: 10,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(215, 230, 90, 0.15)', // Lime with low opacity
  }
});
