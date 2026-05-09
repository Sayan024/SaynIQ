import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, ActivityIndicator, Alert, LayoutAnimation,
  UIManager, Platform, TextInput, Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
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
  { 
    q: 'What is SaynIQ?', 
    a: "SaynIQ is an AI-powered 'Second Brain' and productivity OS. It combines note-taking, link saving, password management, and task tracking with advanced AI capabilities to help you organize and retrieve your knowledge effortlessly." 
  },
  { 
    q: 'How does AI Chat work?', 
    a: "The AI Chat (SaynIQ Copilot) uses RAG (Retrieval-Augmented Generation) to search through your local vault. It identifies relevant notes and links to provide answers that are specifically tailored to your saved data." 
  },
  { 
    q: 'How do shared links work?', 
    a: "SaynIQ generates unique, reusable share IDs for your content. When someone opens a link like 'sayn-iq.vercel.app/share/note-ax82', they can preview the content and import it directly into their own SaynIQ vault." 
  },
  { 
    q: 'Can I sync across devices?', 
    a: "Currently, SaynIQ is offline-first for maximum privacy and speed. You can export your data as a JSON file and import it on another device. Cloud synchronization is a planned feature for future updates." 
  },
  { 
    q: 'How are reminders handled?', 
    a: "Reminders use native system notifications. You can set a reminder for any note or task, and SaynIQ will alert you even when the app is closed. You can also specify alert types like 'Read Later' or 'Watch Important'." 
  },
  { 
    q: 'Is my data secure?', 
    a: "Yes. Your passwords are encrypted using hardware-backed SecureStore (AES-256). Your notes and tasks are stored locally on your device. We only send relevant snippets to the Gemini API during AI interactions." 
  },
  { 
    q: 'Can I save YouTube links and notes?', 
    a: "Absolutely! When you save a YouTube link, SaynIQ fetches the metadata and can even generate an AI-powered summary of the video's content to help you learn faster." 
  },
  { 
    q: 'How does the Knowledge Hub work?', 
    a: "The Knowledge Hub unifies your notes and links into a single, searchable interface. You can filter by category, date, or search for specific keywords across all your stored information." 
  },
  { 
    q: 'Can I use SaynIQ offline?', 
    a: "Yes, the core functionality (notes, tasks, passwords) works 100% offline. Internet access is only required for AI-powered features like chat, summarization, and link metadata fetching." 
  },
  { 
    q: 'How do I import shared content?', 
    a: "When you open a SaynIQ share link, you'll see a preview of the content. Simply tap 'Save to SaynIQ' to import it into your personal vault instantly." 
  },
  { 
    q: 'How do streaks and productivity tracking work?', 
    a: "SaynIQ tracks your daily activity to maintain a 'Streak'. The Productivity Log allows you to track time spent on specific tasks, helping you visualize your focus and efficiency over time." 
  },
  { 
    q: 'How do I backup my data?', 
    a: "You can go to Settings > System > Export Vault Data to generate a complete backup of your notes and passwords. Keep this file safe to restore your data later." 
  },
  { 
    q: 'Is SaynIQ free to use?', 
    a: "SaynIQ is currently free to use. We aim to provide a powerful personal intelligence tool accessible to everyone, with potential premium features for enterprise needs in the future." 
  },
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
  const [faqSearch, setFaqSearch]               = useState('');

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
          <BlurView intensity={20} tint="light" style={[styles.aboutBrandBox, { backgroundColor: `${theme.colors.cardSecondary}80`, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }]}>
            <View style={styles.brandIconWrapper}>
              <Ionicons name="sparkles" size={52} color={theme.colors.primary} />
            </View>
            <Text style={[styles.aboutAppName, { color: theme.colors.textPrimary }]}>SaynIQ</Text>
            <Text style={[styles.aboutTagline, { color: theme.colors.primary }]}>Your AI-Powered Second Brain</Text>
            
            <View style={styles.versionBadge}>
              <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>Version 2.5.0</Text>
            </View>
          </BlurView>

          <Text style={[styles.aboutTitle, { color: theme.colors.textPrimary, marginTop: 24 }]}>Professional Productivity OS</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
            SaynIQ is a modern knowledge management system designed to elevate your intelligence. 
            It acts as your digital second brain, helping you capture, organize, and synthesize 
            information with the power of Active Intelligence.
          </Text>
          
          <View style={styles.featureList}>
            {[
              { icon: 'brain', t: 'AI Second Brain', d: 'Context-aware knowledge retrieval' },
              { icon: 'rocket', t: 'Productivity Hub', d: 'Reminders, tasks, and time tracking' },
              { icon: 'shield-checkmark', t: 'Secure Vault', d: 'Hardware-encrypted data protection' },
              { icon: 'share-social', t: 'Smart Sharing', d: 'Reusable public share templates' }
            ].map((f, i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }]}>
                <View style={[styles.featureIconBox, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Ionicons name={f.icon} size={18} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureT, { color: theme.colors.textPrimary }]}>{f.t}</Text>
                  <Text style={[styles.featureD, { color: theme.colors.textSecondary }]}>{f.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.builderBox, { borderTopColor: theme.colors.border }]}>
             <Text style={[styles.builderText, { color: theme.colors.textSecondary }]}>Built with ❤️ by</Text>
             <Text style={[styles.builderName, { color: theme.colors.primary }]}>Sayan Banerjee</Text>
          </View>
        </Accordion>


        <Accordion title="Help & Support (FAQ)" icon="help-circle" sectionKey="faq">
          <BlurView intensity={15} tint="light" style={[styles.faqSearchContainer, { backgroundColor: `${theme.colors.card}80`, borderColor: theme.colors.border, overflow: 'hidden' }]}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.faqSearchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search help topics..."
              placeholderTextColor={theme.colors.textSecondary}
              value={faqSearch}
              onChangeText={setFaqSearch}
            />
          </BlurView>

          {FAQ_DATA.filter(faq => 
            faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
            faq.a.toLowerCase().includes(faqSearch.toLowerCase())
          ).map((faq, i) => (
            <View key={i} style={[styles.faqItemContainer, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.faqQ, { color: theme.colors.textPrimary }]}>{faq.q}</Text>
              <Text style={[styles.faqA, { color: theme.colors.textSecondary }]}>{faq.a}</Text>
            </View>
          ))}
          
          {FAQ_DATA.filter(faq => 
            faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
            faq.a.toLowerCase().includes(faqSearch.toLowerCase())
          ).length === 0 && (
            <View style={styles.emptyFaq}>
              <Text style={{ color: theme.colors.textSecondary }}>No results found for &quot;{faqSearch}&quot;</Text>
            </View>
          )}
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
  aboutAppName: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 12 },
  aboutTagline: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  featureList: { gap: 12, marginTop: 20 },
  featureCard: { padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  featureT: { fontSize: 15, fontWeight: '800' },
  featureD: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  
  builderBox: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, alignItems: 'center' },
  builderText: { fontSize: 13, fontWeight: '600' },
  builderName: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  
  versionBadge: { marginTop: 16, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  versionText: { fontSize: 11, fontWeight: '700' },

  faqSearchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  faqSearchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  faqItemContainer: { paddingBottom: 20, marginBottom: 20, borderBottomWidth: 1 },
  emptyFaq: { paddingVertical: 40, alignItems: 'center' },
  
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  catText: { fontSize: 13, fontWeight: '700' },
});



