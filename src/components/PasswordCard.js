import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getPasswordValue } from '../services/passwordService';
import { THEME } from '../styles/theme';

export default function PasswordCard({ item, onEdit, onDelete }) {
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={getPlatformIcon()} size={24} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>Updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={THEME.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        {item.username ? (
          <View style={styles.fieldRow}>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Username / Email</Text>
              <Text style={styles.value} numberOfLines={1}>{item.username}</Text>
            </View>
            <TouchableOpacity onPress={copyUsername} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={20} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.fieldRow, !item.username && styles.fieldRowSingle]}>
          <View style={styles.fieldContent}>
            <Text style={styles.label}>Password</Text>
            <Text style={[styles.value, !showPassword && styles.maskedValue]} numberOfLines={1}>
              {passwordValue}
            </Text>
          </View>
          <View style={styles.passwordActions}>
            <TouchableOpacity onPress={handleToggleVisibility} style={styles.copyBtn}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={copyPassword} style={styles.copyBtn}>
              <Ionicons name="copy" size={20} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: THEME.colors.cardSecondary,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginRight: 14,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  date: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 8,
  },
  fieldsContainer: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  fieldRowSingle: {
    borderBottomWidth: 0,
  },
  fieldContent: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  maskedValue: {
    letterSpacing: 3,
    fontSize: 20,
    marginTop: -2,
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBtn: {
    padding: 8,
    marginLeft: 4,
  }
});
