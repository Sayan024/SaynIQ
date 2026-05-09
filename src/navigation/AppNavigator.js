import React, { useState, useEffect, useRef, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Platform, View, Text, StyleSheet, ActivityIndicator,
  Animated, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

import HomeScreen      from '../screens/HomeScreen';
import AddItemScreen   from '../screens/AddItemScreen';
import NotesScreen     from '../screens/NotesScreen';
import PasswordsScreen from '../screens/PasswordsScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';
import TasksScreen     from '../screens/TasksScreen';
import AddTaskScreen    from '../screens/AddTaskScreen';
import AboutScreen     from '../screens/AboutScreen';
import AIChatScreen    from '../screens/AIChatScreen';
import AddLinkScreen   from '../screens/AddLinkScreen';

import { VaultContext } from '../context/VaultContext';


const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



// ── Tab config ─────────────────────────────────────────────────────────────────
const TAB_MAP = {
  Dashboard: { active: 'home',          inactive: 'home-outline' },
  Notes:     { active: 'document-text', inactive: 'document-text-outline' },
  Tasks:     { active: 'list',           inactive: 'list-outline' },
  Passwords: { active: 'key',           inactive: 'key-outline' },
  SaynIQ:    { active: 'sparkles',      inactive: 'sparkles-outline' },
};

function TabButton({ route, focused, theme }) {
  const cfg = TAB_MAP[route.name];
  const scale = useRef(new Animated.Value(focused ? 1 : 0.8)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1 : 0.8, useNativeDriver: true, tension: 50 }),
      Animated.timing(opacity, { toValue: focused ? 1 : 0.6, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabItem}>
      <Animated.View 
        style={[
          styles.activePill, 
          { 
            backgroundColor: focused ? `${theme.colors.primary}15` : 'transparent',
            transform: [{ scale }]
          }
        ]} 
      />
      <Ionicons
        name={focused ? cfg.active : cfg.inactive}
        size={22}
        color={focused ? theme.colors.primary : theme.colors.textSecondary}
      />
    </View>
  );
}

function BottomTabs() {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabButton route={route} focused={focused} theme={theme} />,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          backgroundColor: theme.colors.background + 'F8',
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.border,
          elevation: 0,
          paddingBottom: insets.bottom,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Notes"     component={NotesScreen} />
      <Tab.Screen name="Tasks"     component={TasksScreen} />
      <Tab.Screen name="Passwords" component={PasswordsScreen} />
      <Tab.Screen name="SaynIQ"    component={AIChatScreen} />
    </Tab.Navigator>
  );
}

// ── Root navigator ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { state } = useContext(VaultContext);
  const theme = state.theme;

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.colors.background,
      card:        theme.colors.background,
      text:        theme.colors.textPrimary,
      primary:     theme.colors.primary,
      border:      theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, presentation: 'modal' }}
        initialRouteName="MainTabs"
      >
        <Stack.Screen name="MainTabs"    component={BottomTabs} />
        <Stack.Screen name="AddItem"     component={AddItemScreen} />
        <Stack.Screen name="AddLink"     component={AddLinkScreen} />
        <Stack.Screen name="AddPassword" component={AddPasswordScreen} />

        <Stack.Screen name="AddTask"     component={AddTaskScreen} />
        <Stack.Screen name="About"       component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
    marginTop: 10,
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 32,
    borderRadius: 16,
  },
});









