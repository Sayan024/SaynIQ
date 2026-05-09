import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  ActivityIndicator, Linking, Image, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cloudService } from '../services/cloudService';
import { VaultContext } from '../context/VaultContext';
import { BlurView } from 'expo-blur';
import Markdown from 'react-native-markdown-display';

export default function SharePreviewScreen({ route, navigation }) {
  const { shareId } = route.params;
  const { state, addItem } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [shareId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await cloudService.getSharedContent(shareId);
      if (data) {
        setContent(data);
      } else {
        // Fallback/Mock for demo if not in local storage
        setContent({
          title: "Premium Tech Insights",
          type: "note",
          category: "Technology",
          text: "# Future of AI Agents\n\nAI agents are autonomous systems that can perform complex tasks with minimal human intervention. \n\n### Key Pillars:\n- Autonomy\n- Reasoning\n- Tool use",
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not load shared content.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      await addItem({
        title: content.title,
        type: content.type,
        category: content.category,
        text: content.text,
        url: content.url,
      });
      Alert.alert("Success", "Imported to your vault!", [
        { text: "View Vault", onPress: () => navigation.navigate('MainTabs', { screen: 'Notes' }) }
      ]);
    } catch (error) {
      Alert.alert("Error", "Import failed.");
    }
  };

  const handleOpenLink = async () => {
    if (content.url) {
      Linking.openURL(content.url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!content) return null;

  const isLink = content.type === 'link';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Shared {content.type}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={10} tint="light" style={[styles.previewCard, { borderColor: theme.colors.border, backgroundColor: `${theme.colors.card}50` }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.categoryText, { color: theme.colors.primary }]}>{content.category || 'Shared'}</Text>
            </View>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {new Date(content.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{content.title || 'Untitled'}</Text>
          
          <View style={styles.contentBox}>
            {isLink ? (
              <View style={styles.linkInfo}>
                <Ionicons name="link" size={40} color={theme.colors.primary} style={{ marginBottom: 16 }} />
                <Text style={[styles.urlText, { color: theme.colors.textSecondary }]}>{content.url}</Text>
              </View>
            ) : (
              <Markdown style={{ 
                body: { color: theme.colors.textSecondary, fontSize: 16, lineHeight: 24 },
                heading1: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: '800' }
              }}>
                {content.text}
              </Markdown>
            )}
          </View>
        </BlurView>

        <View style={styles.footerInfo}>
          <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Shared from SaynIQ: Your AI Second Brain
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.importBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleImport}
        >
          <Ionicons name="download-outline" size={20} color={theme.colors.textDark} />
          <Text style={[styles.importBtnText, { color: theme.colors.textDark }]}>Save to SaynIQ</Text>
        </TouchableOpacity>
        
        {isLink && (
          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            onPress={handleOpenLink}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.colors.textPrimary }]}>Open Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  
  scrollContent: { padding: 20, paddingBottom: 120 },
  previewCard: { 
    borderRadius: 28, padding: 24, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  dateText: { fontSize: 12, fontWeight: '600' },
  
  title: { fontSize: 26, fontWeight: '900', marginBottom: 20, lineHeight: 34 },
  contentBox: { minHeight: 100 },
  linkInfo: { alignItems: 'center', paddingVertical: 30 },
  urlText: { fontSize: 14, textAlign: 'center', opacity: 0.8 },
  
  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40 },
  footerText: { fontSize: 13, fontWeight: '600' },

  bottomActions: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    paddingHorizontal: 20, paddingTop: 20, gap: 12,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  importBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 18, borderRadius: 20, gap: 10 
  },
  importBtnText: { fontSize: 16, fontWeight: '800' },
  secondaryBtn: { 
    alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 18, borderRadius: 20, borderWidth: 1 
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700' },
});
