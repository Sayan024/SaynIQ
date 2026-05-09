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
  const { state, setTheme } = useContext(VaultContext);
  const theme = state.theme;

  const [isExporting, setIsExporting]           = useState(false);
  const [expandedSection, setExpandedSection]   = useState(null);

  // Profile
  const [profileName, setProfileName]           = useState('User');
  const [editingName, setEditingName]           = useState(false);
  const [tempName, setTempName]                 = useState('');
  const [interests, setInterests]               = useState(['AI']);

  useEffect(() => {
    // Load persisted profile & interests
    Promise.all([
      AsyncStorage.getItem(USER_PROFILE_KEY),
      AsyncStorage.getItem('@user_interests')
    ]).then(([name, savedInterests]) => {
      if (name) setProfileName(name);
      if (savedInterests) setInterests(JSON.parse(savedInterests));
    });
  }, []);

  const toggleInterest = async (topic) => {
    let newInterests;
    if (interests.includes(topic)) {
      newInterests = interests.filter(i => i !== topic);
    } else {
      newInterests = [...interests, topic];
    }
    setInterests(newInterests);
    await AsyncStorage.setItem('@user_interests', JSON.stringify(newInterests));
  };


  const saveProfileName = async () => {
    const name = tempName.trim() || profileName;
    setProfileName(name);
    await AsyncStorage.setItem(USER_PROFILE_KEY, name);
    setEditingName(false);
  };

  const handleThemeSelect = async (name) => {
    await setTheme(name);
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
    <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.card }]} onPress={onPress} disabled={!onPress} activeOpacity={0.75}>
      <View style={[styles.settingIconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.settingTextContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} /> : null}
    </TouchableOpacity>
  );

  const Accordion = ({ title, icon, sectionKey, children }) => {
    const open = expandedSection === sectionKey;
    return (
      <View style={[styles.accordionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection(sectionKey)}>
          <View style={styles.accordionLeft}>
            <View style={[styles.settingIconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
              <Ionicons name={icon} size={20} color={theme.colors.highlight} />
            </View>
            <Text style={[styles.accordionTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {open && <View style={[styles.accordionContent, { borderTopColor: theme.colors.border }]}>{children}</View>}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.cardSecondary }]}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── PROFILE ──────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Profile</Text>
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={32} color={theme.colors.textDark} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={[styles.nameInput, { backgroundColor: theme.colors.background, color: theme.colors.textPrimary, borderColor: theme.colors.primary }]}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Your name"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveProfileName}
                />
                <TouchableOpacity onPress={saveProfileName} style={[styles.saveNameBtn, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.textDark} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setTempName(profileName); setEditingName(true); }}>
                <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>{profileName}</Text>
                <Text style={[styles.profileNameHint, { color: theme.colors.textSecondary }]}>Tap to edit name</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.profileBio, { color: theme.colors.textSecondary }]}>AI-Powered Second Brain User</Text>
          </View>
        </View>

        {/* ── THEME PICKER ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
              <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.settingTextContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Theme</Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{state.themeName}</Text>
            </View>
          </View>
          {/* Swatches */}
          <View style={styles.swatchRow}>
            {THEME_NAMES.map((name) => {
              const palette = THEMES[name];
              const active = name === state.themeName;
              return (
                <TouchableOpacity key={name} onPress={() => handleThemeSelect(name)} style={[styles.swatchBtn, active && { borderColor: theme.colors.primary }]}>
                  <View style={[styles.swatch, { backgroundColor: palette.swatch }]} />
                  <Text style={[styles.swatchLabel, { color: active ? theme.colors.textPrimary : theme.colors.textSecondary }]} numberOfLines={2}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── PREFERENCES ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Preferences</Text>
        <Accordion title="Your Interests" icon="heart" sectionKey="interests">
          <Text style={[styles.accordionSubtitle, { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 10, paddingHorizontal: 4 }]}>
            Select topics to personalize your Trending Tech feed.
          </Text>
          <View style={styles.categoryRow}>
            {['AI', 'Machine Learning', 'React Native', 'Python', 'Data Analytics', 'Microsoft Fabric', 'Cybersecurity', 'Cloud Computing'].map((topic) => {
              const active = interests.includes(topic);
              return (
                <TouchableOpacity 
                  key={topic} 
                  onPress={() => toggleInterest(topic)}
                  style={[styles.catBtn, { backgroundColor: active ? theme.colors.primary : theme.colors.cardSecondary, flexDirection: 'row', alignItems: 'center' }]}
                >
                  <Text style={[styles.catText, { color: active ? theme.colors.textDark : theme.colors.textPrimary }]}>{topic}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={theme.colors.textDark} style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Accordion>

        {/* ── SYSTEM ───────────────────────────────────────────────────── */}

        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>System</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <SettingRow icon="sparkles"   title="AI Settings"     subtitle="Gemini Flash 2.0 active" />
          <SettingRow icon="lock-closed" title="Privacy & Security" subtitle="SecureStore encryption" />
          <TouchableOpacity style={styles.settingRow} onPress={handleExport} disabled={isExporting}>
            <View style={[styles.settingIconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
              {isExporting
                ? <ActivityIndicator size="small" color={theme.colors.primary} />
                : <Ionicons name="download" size={20} color={theme.colors.primary} />}
            </View>
            <View style={styles.settingTextContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Export Vault Data</Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Backup notes & passwords</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── ACCORDIONS ───────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Support & Info</Text>

        <Accordion title="About SaynIQ" icon="planet" sectionKey="about">
          <View style={styles.aboutBrandBox}>
            <Ionicons name="sparkles" size={52} color={theme.colors.primary} />
            <Text style={[styles.aboutAppName, { color: theme.colors.textPrimary }]}>SaynIQ</Text>
            <Text style={[styles.aboutTagline, { color: theme.colors.primary }]}>Your AI Second Brain</Text>
          </View>
          <Text style={[styles.aboutTitle, { color: theme.colors.textPrimary }]}>Version 2.1 · Enterprise Edition</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
            SaynIQ is an advanced AI knowledge operating system designed to elevate your personal intelligence.
            Capture thoughts, secure passwords, and track productivity while chatting with your own data vault powered by Gemini.
          </Text>
          
          <View style={styles.featureList}>
            {[
              { t: 'AI Summaries', d: 'Auto-summarize notes & links' },
              { t: 'Productivity Logs', d: 'Track work time dynamically' },
              { t: 'Secure Vault', d: 'AES-encrypted password manager' },
              { t: 'Study Assistant', d: 'Personalized learning plans' }
            ].map((f, i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: theme.colors.cardSecondary }]}>
                <Text style={[styles.featureT, { color: theme.colors.primary }]}>{f.t}</Text>
                <Text style={[styles.featureD, { color: theme.colors.textSecondary }]}>{f.d}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.aboutCredits, { color: theme.colors.primary, marginTop: 20 }]}>✦  Designed & Built by Sayan Banerjee</Text>
        </Accordion>


        <Accordion title="Frequently Asked Questions" icon="help-circle" sectionKey="faq">
          {FAQ_DATA.map((faq, i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={[styles.faqQ, { color: theme.colors.textPrimary }]}>{faq.q}</Text>
              <Text style={[styles.faqA, { color: theme.colors.textSecondary }]}>{faq.a}</Text>
            </View>
          ))}
        </Accordion>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, marginTop: 10 },
  backBtn:     { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  scroll:      { paddingHorizontal: 24 },

  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20, marginLeft: 4 },
  settingsGroup: { borderRadius: 28, borderWidth: 1, marginBottom: 8 },

  settingRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingIconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingTextContent: { flex: 1 },
  settingTitle:       { fontSize: 16, fontWeight: '600' },
  settingSubtitle:    { fontSize: 13, fontWeight: '500', marginTop: 2 },

  /* Profile */
  profileCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, padding: 16, borderWidth: 1, marginBottom: 8 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  profileName:   { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  profileNameHint: { fontSize: 12 },
  profileBio:    { fontSize: 13, marginTop: 6 },
  nameEditRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput:     { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontWeight: '700', borderWidth: 1 },
  saveNameBtn:   { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  /* Theme swatches */
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  swatchBtn: { alignItems: 'center', width: 80, padding: 8, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  swatch:    { width: 40, height: 40, borderRadius: 20, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  swatchLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  /* Accordion */
  accordionContainer: { borderRadius: 28, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  accordionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  accordionLeft:      { flexDirection: 'row', alignItems: 'center' },
  accordionTitle:     { fontSize: 15, fontWeight: '700' },
  accordionContent:   { padding: 20, paddingTop: 4, borderTopWidth: 1 },

  aboutTitle:    { fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  aboutText:     { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  aboutCredits:  { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  faqItem: { marginBottom: 18 },
  faqQ:    { fontSize: 15, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  faqA:    { fontSize: 14, lineHeight: 22 },

  aboutBrandBox: { alignItems: 'center', marginBottom: 20 },
  aboutAppName: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 8 },
  aboutTagline: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  featureList: { gap: 10, marginTop: 10 },
  featureCard: { padding: 12, borderRadius: 16 },
  featureT: { fontSize: 14, fontWeight: '800' },
  featureD: { fontSize: 12, marginTop: 2 },
  
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  catText: { fontSize: 13, fontWeight: '700' },
});



