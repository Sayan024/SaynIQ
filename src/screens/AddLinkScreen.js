import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AddLinkScreen({ navigation, route }) {
  const { state, addItem, editItem } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const itemToEdit = route.params?.itemToEdit;
  const isEditing = !!itemToEdit;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Research');
  const [alertType, setAlertType] = useState(null);
  const [reminderDays, setReminderDays] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const CATEGORIES = ['Research', 'Study', 'Coding', 'Business', 'Finance', 'YouTube', 'Articles', 'Bookmarks'];

  useEffect(() => {
    if (isEditing && itemToEdit.type === 'link') {
      setUrl(itemToEdit.url);
      setTitle(itemToEdit.title || '');
      setCategory(itemToEdit.category || 'Research');
      setAlertType(itemToEdit.alertType || null);
      setReminderDays(itemToEdit.reminderDays || null);
    }
  }, [isEditing, itemToEdit]);


  const validateUrl = (string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert("Missing URL", "Please enter a valid URL to save.");
      return;
    }

    if (!validateUrl(url.trim())) {
      Alert.alert("Invalid URL", "The link provided appears to be invalid. Please check and try again.");
      return;
    }
    
    setIsLoading(true);
    const formattedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;

    const payload = {
      type: 'link',
      url: formattedUrl,
      title: title.trim() || formattedUrl,
      category,
      tags: [],
      alertType,
      reminderDays,
      reminderDate: reminderDays ? new Date(Date.now() + reminderDays * 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: isEditing ? itemToEdit.createdAt : new Date().toISOString(),
    };


    try {
      if (isEditing) {
        await editItem(itemToEdit.id, payload);
        Alert.alert("Success", "Link updated successfully! " + (reminderDays ? "Reminder set." : ""));
      } else {
        await addItem(payload);
        Alert.alert("Success", "Link saved to vault! " + (reminderDays ? "Reminder set." : ""));
      }
      navigation.goBack();
    } catch (e) {
      console.error("Save Error:", e);
      Alert.alert("Error", "Could not save link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.cardSecondary }]}>
          <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{isEditing ? 'Edit Link' : 'Save Link'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading || !url.trim()} style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}>
          {isLoading ? <ActivityIndicator size="small" color={theme.colors.textDark} /> : <Text style={[styles.saveBtnText, { color: theme.colors.textDark }]}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>URL ADDRESS</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="link" size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="https://example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>DISPLAY TITLE</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="text" size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Give your link a name..."
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setCategory(cat)}
                style={[
                  styles.catPill, 
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  category === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
              >
                <Text style={[
                  styles.catText, 
                  { color: theme.colors.textSecondary },
                  category === cat && { color: theme.colors.textDark }
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>ALERT STATUS</Text>
          <View style={styles.alertRow}>
            {['Watch Important', 'Read Later', "Don't Forget"].map(type => (
              <TouchableOpacity 
                key={type} 
                onPress={() => setAlertType(alertType === type ? null : type)}
                style={[
                  styles.catPill, 
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  alertType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
              >
                <Text style={[
                  styles.catText, 
                  { color: theme.colors.textSecondary },
                  alertType === type && { color: theme.colors.textDark }
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>REMINDER</Text>
          <View style={styles.reminderRow}>
            {[
              { label: '1 Hr', val: 1/24 },
              { label: '3 Hr', val: 3/24 },
              { label: '1 Day', val: 1 },
              { label: '2 Day', val: 2 },
              { label: '3 Day', val: 3 }
            ].map(opt => (
              <TouchableOpacity 
                key={opt.label} 
                onPress={() => setReminderDays(reminderDays === opt.val ? null : opt.val)}
                style={[
                  styles.reminderChip, 
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  reminderDays === opt.val && { backgroundColor: theme.colors.highlight, borderColor: theme.colors.highlight }
                ]}
              >
                <Text style={[styles.reminderText, { color: theme.colors.textSecondary }, reminderDays === opt.val && { color: theme.colors.textDark }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardSecondary }]}>

          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Once saved, SaynIQ will automatically fetch site metadata and prepare it for AI analysis.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 60, marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  saveBtnText: { fontWeight: '800', fontSize: 14 },

  scroll: { padding: 20 },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 10, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 14, fontWeight: '700' },

  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 20, gap: 12, marginTop: 10, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },

  alertRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reminderRow: { flexDirection: 'row', gap: 10 },
  reminderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  reminderText: { fontSize: 12, fontWeight: '700' },
});

