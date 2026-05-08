import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, ActivityIndicator, Alert, LayoutAnimation,
  UIManager, Platform, TextInput, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { getPasswordsList } from '../services/passwordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME, THEMES, THEME_NAMES, saveThemeName, loadThemeName } from '../styles/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const USER_PROFILE_KEY = '@user_profile';

const FAQ_DATA = [
  { q: 'How do AI summaries work?', a: "We use Gemini AI to analyze your notes, links, and code. It extracts key learning points and tags automatically — your data never leaves your device beyond the API call." },
  { q: 'How do notes sync?', a: "The app is fully offline-first. Your vault lives in secure local storage. Cloud sync (Supabase) is planned for the next major release." },
  { q: 'How secure are my passwords?', a: "All passwords are encrypted with Expo SecureStore. They are completely isolated from the AI system and never appear in plaintext databases." },
  { q: 'What does AI context do?', a: "When you use Copilot, we locally keyword-search your vault, pick the 5 most relevant notes, and send them to Gemini so it answers based on *your* data." },
  { q: 'Can I use the app offline?', a: "Yes! Notes and passwords work 100% offline. You only need internet for the Ask AI and Generate Summary features." },
];

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { state } = useContext(VaultContext);

  const [isExporting, setIsExporting]           = useState(false);
  const [expandedSection, setExpandedSection]   = useState(null);

  // Profile
  const [profileName, setProfileName]           = useState('Sayan');
  const [editingName, setEditingName]           = useState(false);
  const [tempName, setTempName]                 = useState('');

  // Theme
  const [activeThemeName, setActiveThemeName]   = useState('Drops Purple');

  useEffect(() => {
    // Load persisted profile
    AsyncStorage.getItem(USER_PROFILE_KEY).then(v => {
      if (v) setProfileName(v);
    });
    // Load persisted theme name
    loadThemeName().then(setActiveThemeName);
  }, []);

  const saveProfileName = async () => {
    const name = tempName.trim() || profileName;
    setProfileName(name);
    await AsyncStorage.setItem(USER_PROFILE_KEY, name);
    setEditingName(false);
  };

  const handleThemeSelect = async (name) => {
    setActiveThemeName(name);
    await saveThemeName(name);
    Alert.alert('Theme saved', `"${name}" will apply fully on next launch.`);
  };

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const passwords = await getPasswordsList();
      const payload = JSON.stringify(
        { app: "Sayan's Second Brain", version: '2.0', exportDate: new Date().toISOString(), vaultItems: state.items, passwords },
        null, 2
      );
      await Share.share({ message: payload, title: 'Second_Brain_Export.json' });
    } catch {
      Alert.alert('Export Failed', 'Could not export vault data.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const SettingRow = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress} activeOpacity={0.75}>
      <View style={styles.settingIconWrapper}>
        <Ionicons name={icon} size={20} color={THEME.colors.primary} />
      </View>
      <View style={styles.settingTextContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} /> : null}
    </TouchableOpacity>
  );

  const Accordion = ({ title, icon, sectionKey, children }) => {
    const open = expandedSection === sectionKey;
    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection(sectionKey)}>
          <View style={styles.accordionLeft}>
            <View style={styles.settingIconWrapper}>
              <Ionicons name={icon} size={20} color={THEME.colors.highlight} />
            </View>
            <Text style={styles.accordionTitle}>{title}</Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
        {open && <View style={styles.accordionContent}>{children}</View>}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── PROFILE ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={THEME.colors.textDark} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Your name"
                  placeholderTextColor={THEME.colors.textSecondary}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveProfileName}
                />
                <TouchableOpacity onPress={saveProfileName} style={styles.saveNameBtn}>
                  <Ionicons name="checkmark" size={20} color={THEME.colors.textDark} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setTempName(profileName); setEditingName(true); }}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileNameHint}>Tap to edit name</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.profileBio}>AI-Powered Second Brain User</Text>
          </View>
        </View>

        {/* ── THEME PICKER ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrapper}>
              <Ionicons name="color-palette" size={20} color={THEME.colors.primary} />
            </View>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>{activeThemeName}</Text>
            </View>
          </View>
          {/* Swatches */}
          <View style={styles.swatchRow}>
            {THEME_NAMES.map((name) => {
              const palette = THEMES[name];
              const active = name === activeThemeName;
              return (
                <TouchableOpacity key={name} onPress={() => handleThemeSelect(name)} style={[styles.swatchBtn, active && styles.swatchBtnActive]}>
                  <View style={[styles.swatch, { backgroundColor: palette.swatch }]} />
                  <Text style={[styles.swatchLabel, active && { color: THEME.colors.textPrimary }]} numberOfLines={2}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── SYSTEM ───────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>System</Text>
        <View style={styles.settingsGroup}>
          <SettingRow icon="sparkles"   title="AI Settings"     subtitle="Gemini Flash 2.0 active" />
          <SettingRow icon="lock-closed" title="Privacy & Security" subtitle="SecureStore encryption" />
          <TouchableOpacity style={styles.settingRow} onPress={handleExport} disabled={isExporting}>
            <View style={styles.settingIconWrapper}>
              {isExporting
                ? <ActivityIndicator size="small" color={THEME.colors.primary} />
                : <Ionicons name="download" size={20} color={THEME.colors.primary} />}
            </View>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Export Vault Data</Text>
              <Text style={styles.settingSubtitle}>Backup notes & passwords</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── ACCORDIONS ───────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Support & Info</Text>

        <Accordion title="About Sayan's Second Brain" icon="planet" sectionKey="about">
          <Ionicons name="planet" size={52} color={THEME.colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.aboutTitle}>Version 2.0 · Drops Edition</Text>
          <Text style={styles.aboutText}>
            An AI-powered knowledge operating system designed to act as your external brain.
            Save links, code snippets, and notes — then chat with your own vault using Gemini.
          </Text>
          <Text style={styles.aboutCredits}>✦  Designed & Built by Sayan Banerjee</Text>
        </Accordion>

        <Accordion title="Frequently Asked Questions" icon="help-circle" sectionKey="faq">
          {FAQ_DATA.map((faq, i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </View>
          ))}
        </Accordion>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: THEME.colors.background },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, marginBottom: 16, marginTop: 10 },
  backBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: THEME.colors.textPrimary },
  scroll:      { paddingHorizontal: THEME.spacing.lg },

  sectionLabel: { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20, marginLeft: 4 },
  settingsGroup: { backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, borderWidth: 1, borderColor: THEME.colors.border, marginBottom: 8 },

  settingRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingTextContent: { flex: 1 },
  settingTitle:       { color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '600' },
  settingSubtitle:    { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 2 },

  /* Profile */
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, padding: THEME.spacing.md, borderWidth: 1, borderColor: THEME.colors.border, marginBottom: 8 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },
  profileName:   { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 2 },
  profileNameHint: { color: THEME.colors.textSecondary, fontSize: 12 },
  profileBio:    { color: THEME.colors.textSecondary, fontSize: 13, marginTop: 6 },
  nameEditRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput:     { flex: 1, backgroundColor: THEME.colors.background, color: THEME.colors.textPrimary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: THEME.colors.primary },
  saveNameBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },

  /* Theme swatches */
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  swatchBtn: { alignItems: 'center', width: 80, padding: 8, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  swatchBtnActive: { borderColor: THEME.colors.primary },
  swatch:    { width: 40, height: 40, borderRadius: 20, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  swatchLabel: { color: THEME.colors.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },

  /* Accordion */
  accordionContainer: { backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, borderWidth: 1, borderColor: THEME.colors.border, marginBottom: 14, overflow: 'hidden' },
  accordionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  accordionLeft:      { flexDirection: 'row', alignItems: 'center' },
  accordionTitle:     { color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  accordionContent:   { padding: 20, paddingTop: 4, borderTopWidth: 1, borderTopColor: THEME.colors.border },

  aboutTitle:    { color: THEME.colors.textPrimary, fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  aboutText:     { color: THEME.colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  aboutCredits:  { color: THEME.colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' },

  faqItem: { marginBottom: 18 },
  faqQ:    { color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  faqA:    { color: THEME.colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
