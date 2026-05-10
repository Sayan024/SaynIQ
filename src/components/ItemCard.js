import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { generateSummary, generateLinkSummary } from '../services/geminiService';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { THEME } from '../styles/theme';
import ShareModal from './ShareModal';

export default function ItemCard({ item }) {
  const { state, deleteItem, toggleBookmark, editItem } = useContext(VaultContext);
  const theme = state.theme;
  const navigation = useNavigation();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  
  // States for expandable sections
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const handlePress = async () => {
    if (item.type === 'link' && item.url) {
      try {
        const url = item.url.trim();
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
          await Linking.openURL(fixedUrl);
        }
      } catch (error) {
        Alert.alert("Link Error", "Could not open this URL. It might be invalid.");
      }
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
      let aiSummary;
      if (item.type === 'note') {
        aiSummary = await generateSummary(item.text);
      } else {
        aiSummary = await generateLinkSummary(item.url, item.title);
      }
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
    if (item.type === 'note') return item.noteType === 'code' ? theme.colors.primary : theme.colors.success;
    if (item.domain?.includes('youtube')) return theme.colors.danger;
    if (item.domain?.includes('instagram')) return '#EC4899'; // Pink for IG
    return theme.colors.highlight;
  };

  const hasLongNote = item.type === 'note' && item.text && item.text.length > 150;

  return (
    <Animated.View layout={Layout.duration(300)} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={item.type === 'note' && item.noteType === 'code'}>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
              <Ionicons name={getIconName()} size={18} color={getIconColor()} />
            </View>
            <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>{item.category || 'General'}</Text>
          </View>
          <View style={styles.actions}>
            {item.type === 'note' && item.noteType === 'code' && (
              <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.actionBtn}>
                <Ionicons name="copy-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.actionBtn}>
              <Ionicons name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={item.isBookmarked ? theme.colors.warning : theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(item.type === 'link' ? 'AddLink' : 'AddItem', { itemToEdit: item })} style={styles.actionBtn}>
              <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShareVisible(true)} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ShareModal 
          visible={shareVisible} 
          onClose={() => setShareVisible(false)} 
          item={item}
          theme={theme}
        />

        <View style={styles.badgeRow}>
          {item.alertType && (
            <View style={[styles.alertBadge, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
              <Ionicons name="alert-circle" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{item.alertType}</Text>
            </View>
          )}
          {item.reminderDate && (
            <View style={[styles.reminderBadge, { backgroundColor: theme.colors.highlight + '20', borderColor: theme.colors.highlight }]}>
              <Ionicons name="notifications" size={12} color={theme.colors.highlight} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: theme.colors.highlight }]}>
                {new Date(item.reminderDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </View>


        {item.type === 'link' && item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={[styles.thumbnail, { backgroundColor: theme.colors.background }]} />
        ) : null}

        {item.title ? <Text style={[styles.mainTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text> : null}

        {item.type === 'note' && item.noteType === 'code' ? (
          <View style={[styles.codeContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.codeText, { color: theme.colors.primary }]} numberOfLines={isNoteExpanded ? undefined : 6}>
              {item.text}
            </Text>
            {hasLongNote && (
              <TouchableOpacity onPress={() => setIsNoteExpanded(!isNoteExpanded)} style={styles.readMoreBtn}>
                <Text style={[styles.readMoreText, { color: theme.colors.highlight }]}>{isNoteExpanded ? 'Show Less' : 'Show Full Code'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : item.type === 'note' && item.noteType === 'list' ? (
          <View style={styles.listContainer}>
            {item.listItems?.slice(0, isNoteExpanded ? undefined : 5).map((listItem, idx) => (
              <View key={listItem.id || idx} style={styles.listItem}>
                <TouchableOpacity 
                  disabled={item.listType !== 'check'}
                  onPress={() => {
                    const newList = item.listItems.map(i => i.id === listItem.id ? { ...i, completed: !i.completed } : i);
                    editItem(item.id, { listItems: newList });
                  }}
                >
                  <Ionicons 
                    name={item.listType === 'check' ? (listItem.completed ? 'checkbox' : 'square-outline') : (item.listType === 'number' ? 'ellipse' : 'remove')} 
                    size={18} 
                    color={listItem.completed ? theme.colors.primary : theme.colors.textSecondary} 
                    style={{ marginRight: 10, marginTop: 2 }}
                  />
                </TouchableOpacity>
                <Text style={[
                  styles.listItemText, 
                  { color: listItem.completed ? theme.colors.textSecondary : theme.colors.textPrimary },
                  listItem.completed && item.listType === 'check' && { textDecorationLine: 'line-through' }
                ]}>
                  {item.listType === 'number' ? `${idx + 1}. ` : ''}{listItem.text}
                </Text>
              </View>
            ))}
            {(item.listItems?.length > 5) && (
              <TouchableOpacity onPress={() => setIsNoteExpanded(!isNoteExpanded)} style={styles.readMoreBtn}>
                <Text style={[styles.readMoreText, { color: theme.colors.highlight }]}>{isNoteExpanded ? 'Show Less' : `Show ${item.listItems.length - 5} More Items`}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            <Text style={[styles.notePreview, { color: theme.colors.textSecondary }]} numberOfLines={isNoteExpanded ? undefined : 3}>
              {item.type === 'note' ? item.text : (item.title ? '' : item.url)}
            </Text>
            {hasLongNote && (
              <TouchableOpacity onPress={() => setIsNoteExpanded(!isNoteExpanded)} style={styles.readMoreBtn}>
                <Text style={[styles.readMoreText, { color: theme.colors.highlight }]}>{isNoteExpanded ? 'Read Less' : 'Read More'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* AI Summary Section Button */}
        <TouchableOpacity 
          style={[
            styles.aiGenerateBtn, 
            { backgroundColor: theme.colors.cardSecondary },
            item.summary && isSummaryExpanded && { backgroundColor: theme.colors.primary }
          ]} 
          onPress={handleGenerateSummary}
        >
          <Ionicons name="sparkles" size={18} color={item.summary && isSummaryExpanded ? theme.colors.textDark : theme.colors.primary} style={{marginRight: 8}} />
          <Text style={[styles.aiGenerateText, { color: theme.colors.primary }, item.summary && isSummaryExpanded && { color: theme.colors.textDark }]}>
            {item.summary ? (isSummaryExpanded ? 'Hide AI Summary' : 'View AI Summary') : 'Generate AI Summary'}
          </Text>
          {isGeneratingSummary && <ActivityIndicator size="small" color={theme.colors.primary} style={{marginLeft: 8}} />}
        </TouchableOpacity>

        {/* Expandable AI Summary */}
        {isSummaryExpanded && item.summary && !isGeneratingSummary && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.summaryContainer, { backgroundColor: theme.colors.cardSecondary }]}>
            <View style={[styles.summaryActions, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.summaryHeaderTitle, { color: theme.colors.textPrimary }]}>Key Takeaways</Text>
              <TouchableOpacity onPress={() => copyToClipboard(item.summary)}>
                <Ionicons name="copy-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Markdown style={{ 
              body: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 24 },
              heading1: { color: theme.colors.primary, fontSize: 18, fontWeight: '800', marginTop: 14, marginBottom: 8 },
              code_inline: { backgroundColor: theme.colors.background, color: theme.colors.highlight, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' }
            }}>{item.summary}</Markdown>
          </Animated.View>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={[styles.tagPill, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          {item.type === 'link' && item.domain ? (
            <Text style={[styles.domain, { color: theme.colors.textSecondary }]}>{item.domain}</Text>
          ) : <View />}
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 24, marginBottom: 16, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { padding: 8, borderRadius: 12, marginRight: 10 },
  categoryText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { marginLeft: 16, opacity: 0.8 },
  
  thumbnail: { width: '100%', height: 180, borderRadius: 18, marginBottom: 16 },
  mainTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10, lineHeight: 28 },
  notePreview: { fontSize: 16, lineHeight: 24 },
  
  readMoreBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4 },
  readMoreText: { fontSize: 14, fontWeight: '700' },
  
  codeContainer: { padding: 16, borderRadius: 18, marginTop: 8 },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, lineHeight: 22 },
  
  aiGenerateBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start' },
  aiGenerateText: { fontSize: 14, fontWeight: '700' },
  
  summaryContainer: { marginTop: 16, padding: 16, borderRadius: 18 },
  summaryActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1 },
  summaryHeaderTitle: { fontSize: 16, fontWeight: '800' },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  tagPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 13, fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  domain: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 13, fontWeight: '500' },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  alertBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 0.5 },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 0.5 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  listContainer: { marginTop: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  listItemText: { fontSize: 16, lineHeight: 22, flex: 1 },
});


