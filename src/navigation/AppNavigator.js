import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import AddItemScreen from '../screens/AddItemScreen';
import NotesScreen from '../screens/NotesScreen';
import LinksScreen from '../screens/LinksScreen';
import AboutScreen from '../screens/AboutScreen';
import PasswordsScreen from '../screens/PasswordsScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0F19', // Deep Slate
    card: '#0B0F19',       // Deep Slate for Header/Tab Bar
    text: '#F8FAFC',
    primary: '#6366F1',    // Indigo
    border: '#1E293B',     // Slate Border
  },
};

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Notes') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Links') iconName = focused ? 'link' : 'link-outline';
          else if (route.name === 'Passwords') iconName = focused ? 'key' : 'key-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        headerStyle: { backgroundColor: '#0B0F19', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
        headerTintColor: '#F8FAFC',
        tabBarStyle: { 
          backgroundColor: '#0B0F19', 
          borderTopWidth: 1, 
          borderTopColor: '#1E293B',
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Smart Vault' }} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Links" component={LinksScreen} />
      <Tab.Screen name="Passwords" component={PasswordsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={customDarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="AddPassword" component={AddPasswordScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
