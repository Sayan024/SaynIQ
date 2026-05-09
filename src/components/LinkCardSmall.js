import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;

export default function LinkCardSmall({ item, theme }) {
  const handleOpenLink = async () => {
    if (!item.url) return;
    try {
      const fixedUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`;
      await Linking.openURL(fixedUrl);
    } catch (error) {
      console.error('Failed to open link', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diff = Math.floor((now - created) / 60000); // mins
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getIconName = () => {
    if (item.domain?.includes('youtube.com') || item.domain?.includes('youtu.be')) return 'logo-youtube';
    if (item.domain?.includes('github.com')) return 'logo-github';
    if (item.domain?.includes('medium.com')) return 'book';
    return 'link';
  };

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, { width: CARD_WIDTH }]} 
      activeOpacity={0.9}
      onPress={handleOpenLink}
    >
      <BlurView intensity={20} tint="light" style={[styles.blurWrapper, { borderColor: theme.colors.border, backgroundColor: `${theme.colors.card}80` }]}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Ionicons name={getIconName()} size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.metaInfo}>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category || 'General'}</Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {item.title || item.url}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.domain, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.domain || item.url?.split('/')[2]}
          </Text>
          <TouchableOpacity 
            style={[styles.quickOpen, { backgroundColor: theme.colors.primary }]}
            onPress={handleOpenLink}
          >
            <Ionicons name="arrow-forward" size={14} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    height: 140,
  },
  blurWrapper: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaInfo: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domain: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
  },
  quickOpen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
