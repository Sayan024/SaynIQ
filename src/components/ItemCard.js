import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { generateSummary } from '../services/geminiService';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { THEME } from '../styles/theme';

export default function ItemCard({ item }) {
  const { deleteItem, toggleBookmark, editItem } = useContext(VaultContext);
  const navigation = useNavigation();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // States for expandable sections
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const handlePress = () => {
    if (item.type === 'link' && item.url) {
      Linking.openURL(item.url);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Content copied to clipboard!");
  };

  const handleGenerateSummary = async () => {
    if (item.summary) {
      setIsSummaryExpanded(!isSummaryExpanded);
      return;
    }
    
    setIsGeneratingSummary(true);
    setIsSummaryExpanded(true);
    try {
      const content = item.type === 'note' ? item.text : item.url;
      const aiSummary = await generateSummary(content);
      await editItem(item.id, { summary: aiSummary });
    } catch (error) {
      Alert.alert("Error", "Could not generate summary.");
      setIsSummaryExpanded(false);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getIconName = () => {
    if (item.type === 'note') return item.noteType === 'code' ? 'code-slash' : 'document-text';
    if (item.domain?.includes('youtube.com') || item.domain?.includes('youtu.be')) return 'logo-youtube';
    if (item.domain?.includes('instagram.com')) return 'logo-instagram';
    return 'link';
  };

  const getIconColor = () => {
    if (item.type === 'note') return item.noteType === 'code' ? THEME.colors.primary : THEME.colors.success;
    if (item.domain?.includes('youtube')) return THEME.colors.danger;
    if (item.domain?.includes('instagram')) return '#EC4899'; // Pink for IG
    return THEME.colors.highlight;
  };

  const hasLongNote = item.type === 'note' && item.text && item.text.length > 150;

  return (
    <Animated.View layout={Layout.duration(300)} style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={item.type === 'note' && item.noteType === 'code'}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
              <Ionicons name={getIconName()} size={18} color={getIconColor()} />
            </View>
            <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          </View>
          <View style={styles.actions}>
            {item.type === 'note' && item.noteType === 'code' && (
              <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.actionBtn}>
                <Ionicons name="copy-outline" size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.actionBtn}>
              <Ionicons name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={item.isBookmarked ? THEME.colors.warning : THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AddItem', { itemToEdit: item })} style={styles.actionBtn}>
              <Ionicons name="pencil" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={20} color={THEME.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {item.type === 'link' && item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : null}

        {item.title ? <Text style={styles.mainTitle}>{item.title}</Text> : null}

        {item.type === 'note' && item.noteType === 'code' ? (
          <View style={styles.codeContainer}>
            <Text style={styles.codeText} numberOfLines={isNoteExpanded ? undefined : 6}>
              {item.text}
            </Text>
            {hasLongNote && (
              <TouchableOpacity onPress={() => setIsNoteExpanded(!isNoteExpanded)} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>{isNoteExpanded ? 'Show Less' : 'Show Full Code'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.notePreview} numberOfLines={isNoteExpanded ? undefined : 3}>
              {item.type === 'note' ? item.text : (item.title ? '' : item.url)}
            </Text>
            {hasLongNote && (
              <TouchableOpacity onPress={() => setIsNoteExpanded(!isNoteExpanded)} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>{isNoteExpanded ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* AI Summary Section Button */}
        <TouchableOpacity style={[styles.aiGenerateBtn, item.summary && isSummaryExpanded && styles.aiGenerateBtnActive]} onPress={handleGenerateSummary}>
          <Ionicons name="sparkles" size={18} color={item.summary && isSummaryExpanded ? THEME.colors.textDark : THEME.colors.primary} style={{marginRight: 8}} />
          <Text style={[styles.aiGenerateText, item.summary && isSummaryExpanded && styles.aiGenerateTextActive]}>
            {item.summary ? (isSummaryExpanded ? 'Hide AI Summary' : 'View AI Summary') : 'Generate AI Summary'}
          </Text>
          {isGeneratingSummary && <ActivityIndicator size="small" color={THEME.colors.primary} style={{marginLeft: 8}} />}
        </TouchableOpacity>

        {/* Expandable AI Summary */}
        {isSummaryExpanded && item.summary && !isGeneratingSummary && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.summaryContainer}>
            <View style={styles.summaryActions}>
              <Text style={styles.summaryHeaderTitle}>Key Takeaways</Text>
              <TouchableOpacity onPress={() => copyToClipboard(item.summary)}>
                <Ionicons name="copy-outline" size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Markdown style={markdownStyles}>{item.summary}</Markdown>
          </Animated.View>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          {item.type === 'link' && item.domain ? (
            <Text style={styles.domain}>{item.domain}</Text>
          ) : <View />}
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: THEME.colors.textSecondary, fontSize: 15, lineHeight: 24 },
  heading1: { color: THEME.colors.primary, fontSize: 18, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  heading2: { color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  heading3: { color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 10 },
  bullet_list: { marginTop: 6 },
  list_item: { marginBottom: 8 },
  code_inline: { backgroundColor: THEME.colors.background, color: THEME.colors.highlight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', overflow: 'hidden' }
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { padding: 8, borderRadius: 12, marginRight: 10 },
  categoryText: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { marginLeft: 16, opacity: 0.8 },
  
  thumbnail: { width: '100%', height: 180, borderRadius: THEME.borderRadius.md, marginBottom: THEME.spacing.md, backgroundColor: THEME.colors.background },
  mainTitle: { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 10, lineHeight: 28 },
  notePreview: { color: THEME.colors.textSecondary, fontSize: 16, lineHeight: 24 },
  
  readMoreBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4 },
  readMoreText: { color: THEME.colors.highlight, fontSize: 14, fontWeight: '700' },
  
  codeContainer: { backgroundColor: THEME.colors.background, padding: THEME.spacing.md, borderRadius: THEME.borderRadius.md, marginTop: 8 },
  codeText: { color: THEME.colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, lineHeight: 22 },
  
  aiGenerateBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: THEME.colors.cardSecondary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: THEME.borderRadius.sm, alignSelf: 'flex-start' },
  aiGenerateBtnActive: { backgroundColor: THEME.colors.primary },
  aiGenerateText: { color: THEME.colors.primary, fontSize: 14, fontWeight: '700' },
  aiGenerateTextActive: { color: THEME.colors.textDark },
  
  summaryContainer: { marginTop: 16, padding: THEME.spacing.md, backgroundColor: THEME.colors.cardSecondary, borderRadius: THEME.borderRadius.md },
  summaryActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  summaryHeaderTitle: { color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '800' },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  tagPill: { backgroundColor: THEME.colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.borderRadius.xl, marginRight: 8, marginBottom: 8 },
  tagText: { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  domain: { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  date: { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '500' }
});
