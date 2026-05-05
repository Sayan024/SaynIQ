import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getPasswordValue } from '../services/passwordService';

export default function PasswordCard({ item, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('********');

  const handleToggleVisibility = async () => {
    if (!showPassword) {
      const val = await getPasswordValue(item.id);
      if (val) setPasswordValue(val);
    } else {
      setPasswordValue('********');
    }
    setShowPassword(!showPassword);
  };

  const copyPassword = async () => {
    const val = await getPasswordValue(item.id);
    if (val) {
      await Clipboard.setStringAsync(val);
      Alert.alert('Success', 'Password copied to clipboard!');
    }
  };

  const copyUsername = async () => {
    if (item.username) {
      await Clipboard.setStringAsync(item.username);
      Alert.alert('Success', 'Username copied to clipboard!');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete Password', 'Are you sure you want to delete this password entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) }
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={20} color="#10B981" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {item.username ? (
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Username / Email</Text>
            <Text style={styles.value}>{item.username}</Text>
          </View>
          <TouchableOpacity onPress={copyUsername} style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.fieldRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Password</Text>
          <Text style={[styles.value, !showPassword && styles.masked]}>
            {passwordValue}
          </Text>
        </View>
        <View style={styles.passwordActions}>
          <TouchableOpacity onPress={handleToggleVisibility} style={styles.copyBtn}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={copyPassword} style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.date}>Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#151C2C', // Elevated Slate
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262F40',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#10B981', // Emerald Glow
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Emerald transparent
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  },
  masked: {
    letterSpacing: 4,
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBtn: {
    padding: 6,
    marginLeft: 8,
  },
  date: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  }
});
