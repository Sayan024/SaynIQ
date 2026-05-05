import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addPassword, updatePassword, getPasswordValue } from '../services/passwordService';

export default function AddPasswordScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const passwordToEdit = route.params?.passwordToEdit || null;

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (passwordToEdit) {
      setTitle(passwordToEdit.title);
      setUsername(passwordToEdit.username || '');
      loadExistingPassword();
    }
  }, [passwordToEdit]);

  const loadExistingPassword = async () => {
    const val = await getPasswordValue(passwordToEdit.id);
    if (val) setPassword(val);
  };

  const handleSave = async () => {
    if (!title.trim() || !password.trim()) {
      Alert.alert('Error', 'Title and Password are required fields.');
      return;
    }

    setLoading(true);
    try {
      if (passwordToEdit) {
        await updatePassword(passwordToEdit.id, title, username, password);
      } else {
        await addPassword(title, username, password);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{passwordToEdit ? 'Edit Password' : 'Add Password'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Gmail, Facebook"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., john.doe@example.com"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password securely"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeBtn}
              >
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{passwordToEdit ? 'Update Password' : 'Save Password'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  formGroup: { marginBottom: 24 },
  label: { color: '#E2E8F0', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: '#151C2C',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    color: '#F8FAFC',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151C2C',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeBtn: { padding: 14 },
  saveBtn: {
    backgroundColor: '#10B981', // Emerald for passwords
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
