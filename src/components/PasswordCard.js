import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getPasswordValue } from '../services/passwordService';
import { VaultContext } from '../context/VaultContext';

export default function PasswordCard({ item, onEdit, onDelete }) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('••••••••••••');

  const handleToggleVisibility = async () => {
    if (!showPassword) {
      const val = await getPasswordValue(item.id);
      if (val) setPasswordValue(val);
    } else {
      setPasswordValue('••••••••••••');
    }
    setShowPassword(!showPassword);
  };

  const copyPassword = async () => {
    const val = await getPasswordValue(item.id);
    if (val) {
      await Clipboard.setStringAsync(val);
      Alert.alert('Success', 'Secure password copied to clipboard!');
    }
  };

  const copyUsername = async () => {
    if (item.username) {
      await Clipboard.setStringAsync(item.username);
      Alert.alert('Success', 'Username copied to clipboard!');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete Password', 'Are you sure you want to permanently delete this vault entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) }
    ]);
  };

  const getPlatformIcon = () => {
    const t = item.title.toLowerCase();
    if (t.includes('google') || t.includes('gmail')) return 'logo-google';
    if (t.includes('apple')) return 'logo-apple';
    if (t.includes('amazon')) return 'logo-amazon';
    if (t.includes('facebook') || t.includes('meta')) return 'logo-facebook';
    if (t.includes('twitter') || t.includes('x')) return 'logo-twitter';
    if (t.includes('instagram')) return 'logo-instagram';
    if (t.includes('github')) return 'logo-github';
    if (t.includes('microsoft') || t.includes('outlook')) return 'logo-windows';
    if (t.includes('bank') || t.includes('finance')) return 'card-outline';
    return 'key';
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.cardSecondary }]}>
            <Ionicons name={getPlatformIcon()} size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>Updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.fieldsContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        {item.username ? (
          <View style={[styles.fieldRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.fieldContent}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Username / Email</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.username}</Text>
            </View>
            <TouchableOpacity onPress={copyUsername} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.fieldRow, !item.username && styles.fieldRowSingle, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.fieldContent}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary }, !showPassword && styles.maskedValue]} numberOfLines={1}>
              {passwordValue}
            </Text>
          </View>
          <View style={styles.passwordActions}>
            <TouchableOpacity onPress={handleToggleVisibility} style={styles.copyBtn}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={copyPassword} style={styles.copyBtn}>
              <Ionicons name="copy" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { padding: 12, borderRadius: 16, marginRight: 14 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  date: { fontSize: 12, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, marginLeft: 8 },
  fieldsContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  fieldRowSingle: { borderBottomWidth: 0 },
  fieldContent: { flex: 1, marginRight: 10 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },
  maskedValue: { letterSpacing: 3, fontSize: 20, marginTop: -2 },
  passwordActions: { flexDirection: 'row', alignItems: 'center' },
  copyBtn: { padding: 8, marginLeft: 4 }
});

