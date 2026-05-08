import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addPassword, updatePassword, getPasswordValue } from '../services/passwordService';
import { THEME } from '../styles/theme';

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={26} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{passwordToEdit ? 'Edit Vault' : 'New Password'}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Google, Netflix, Bank..."
              placeholderTextColor={THEME.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., sayan@example.com"
              placeholderTextColor={THEME.colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Secure Password <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password securely"
                placeholderTextColor={THEME.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeBtn}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, (!title.trim() || !password.trim()) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={loading || !title.trim() || !password.trim()}
          >
            {loading ? (
              <ActivityIndicator color={THEME.colors.background} />
            ) : (
              <Text style={styles.saveBtnText}>{passwordToEdit ? 'Update Vault Entry' : 'Secure This Password'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: THEME.colors.textPrimary },
  
  scrollContent: { paddingHorizontal: THEME.spacing.lg, paddingBottom: 40 },
  
  formGroup: { marginBottom: 24 },
  label: { color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  required: { color: THEME.colors.danger },
  
  input: {
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  passwordInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  eyeBtn: { padding: 20 },
  
  footer: { padding: THEME.spacing.lg, backgroundColor: THEME.colors.background, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  
  saveBtn: {
    backgroundColor: THEME.colors.warning, // Warning/Amber feels secure for passwords or we can use Primary Lime
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: THEME.colors.warning,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  saveBtnText: { color: THEME.colors.textDark, fontSize: 18, fontWeight: '800' },
});
