import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addPassword, updatePassword, getPasswordValue } from '../services/passwordService';
import { VaultContext } from '../context/VaultContext';

export default function AddPasswordScreen({ navigation, route }) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
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
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.cardSecondary }]}>
            <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{passwordToEdit ? 'Edit Vault' : 'New Password'}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Service Name <Text style={{ color: theme.colors.danger }}>*</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="e.g., Google, Netflix, Bank..."
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Username / Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="e.g., sayan@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Secure Password <Text style={{ color: theme.colors.danger }}>*</Text></Text>
            <View style={[styles.passwordContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.colors.textPrimary }]}
                placeholder="Enter password securely"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeBtn}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.colors.warning }, (!title.trim() || !password.trim()) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={loading || !title.trim() || !password.trim()}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={[styles.saveBtnText, { color: theme.colors.textDark }]}>{passwordToEdit ? 'Update Vault Entry' : 'Secure This Password'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  
  input: {
    borderWidth: 1,
    borderRadius: 18,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  eyeBtn: { padding: 20 },
  
  footer: { padding: 24, borderTopWidth: 1 },
  
  saveBtn: {
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  saveBtnText: { fontSize: 18, fontWeight: '800' },
});

