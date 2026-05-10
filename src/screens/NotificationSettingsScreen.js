import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, 
  ScrollView, Alert, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toggleNotifications, registerForPushNotificationsAsync } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationSettingsScreen({ navigation }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [token, setToken] = useState('Not registered');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem('@push_token');
    if (savedToken) setToken(savedToken);
  };

  const handleToggle = async (value) => {
    setIsLoading(true);
    try {
      if (value) {
        const newToken = await registerForPushNotificationsAsync();
        if (newToken) {
          setToken(newToken);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: true });
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
        }
      } else {
        await toggleNotifications(false);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = async () => {
    if (token === 'Not registered') return;
    // Simple alert for demonstration, could use Clipboard
    Alert.alert('Device Token', token);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Notification Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Ionicons name="notifications" size={22} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Enable Push Notifications</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>Receive updates, alerts, and feature news.</Text>
              </View>
            </View>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Switch 
                value={state.notificationsEnabled} 
                onValueChange={handleToggle}
                trackColor={{ false: '#333', true: theme.colors.primary }}
                thumbColor={Platform.OS === 'ios' ? '#FFF' : (state.notificationsEnabled ? '#FFF' : '#AAA')}
              />
            )}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
        
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {[
            { id: 'updates', label: 'App Updates', icon: 'cloud-download-outline', desc: 'Get notified when a new version is available.' },
            { id: 'features', label: 'New Features', icon: 'rocket-outline', desc: 'Discover new AI and Finance tools.' },
            { id: 'announcements', label: 'Important Alerts', icon: 'alert-circle-outline', desc: 'Security updates and system news.' },
            { id: 'reminders', label: 'Task Reminders', icon: 'time-outline', desc: 'Alerts for your scheduled tasks.' },
          ].map((item, idx) => (
            <View key={item.id} style={[styles.prefRow, idx !== 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name={item.icon} size={20} color={theme.colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.prefLabel, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.desc}</Text>
                </View>
              </View>
              <Switch 
                value={state.notificationsEnabled} 
                disabled={!state.notificationsEnabled}
                trackColor={{ false: '#333', true: theme.colors.primary + '80' }}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Device Diagnostics</Text>
        <TouchableOpacity 
          style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={copyToken}
        >
          <View style={styles.diagRow}>
            <View>
              <Text style={[styles.diagLabel, { color: theme.colors.textPrimary }]}>Expo Push Token</Text>
              <Text style={[styles.diagValue, { color: theme.colors.textSecondary }]} numberOfLines={1}>{token}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.guideBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
            Notifications are sent securely using Expo Push Service and Firebase Cloud Messaging.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 12 },
  
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24, marginLeft: 4 },
  section: { borderRadius: 24, padding: 20, borderWidth: 1 },
  
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  settingDesc: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
  
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  prefLabel: { fontSize: 15, fontWeight: '700', marginBottom: 1 },
  prefDesc: { fontSize: 11, fontWeight: '600', opacity: 0.6 },
  
  diagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diagLabel: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  diagValue: { fontSize: 11, fontWeight: '600', opacity: 0.5, width: '80%' },
  
  guideBox: { flexDirection: 'row', gap: 10, marginTop: 32, paddingHorizontal: 10 },
  guideText: { fontSize: 12, fontWeight: '600', lineHeight: 18, flex: 1 },
});
