import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { generateShareLink, shareItem } from '../services/shareService';

const { height } = Dimensions.get('window');

export default function ShareModal({ visible, onClose, item, theme }) {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCopyLink = async () => {
    const link = generateShareLink(item);
    if (link) {
      await Clipboard.setStringAsync(link);
      onClose();
    }
  };

  const handleNativeShare = async () => {
    await shareItem(item);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>

      <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={[theme.colors.card, theme.colors.background]}
          style={styles.gradient}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Share Content</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Clean, professional sharing</Text>
          </View>

          {/* Premium Preview Card */}
          <LinearGradient
            colors={['#6366F1', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewCard}
          >
            <View style={styles.previewHeader}>
              <View style={styles.appBadge}>
                <Ionicons name="sparkles" size={12} color="#FFF" />
                <Text style={styles.appBadgeText}>SaynIQ</Text>
              </View>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </View>

            <View style={styles.previewBody}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {item.title || 'Untitled Content'}
              </Text>
              <Text style={styles.previewSnippet} numberOfLines={2}>
                {item.type === 'note' ? item.text : item.url}
              </Text>
            </View>

            <View style={styles.previewFooter}>
              <View style={styles.openButton}>
                <Text style={styles.openButtonText}>Open in SaynIQ</Text>
                <Ionicons name="arrow-forward" size={14} color="#6366F1" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.optionsGrid}>
            <TouchableOpacity 
              style={[styles.optionCard, { backgroundColor: theme.colors.cardSecondary }]}
              onPress={handleNativeShare}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#A855F7' }]}>
                <Ionicons name="paper-plane" size={24} color="#FFF" />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>Send Link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, { backgroundColor: theme.colors.cardSecondary }]}
              onPress={handleCopyLink}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="link" size={24} color="#FFF" />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Encrypted peer-to-peer sharing
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 32,
    shadowColor: '#A855F7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  appBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewBody: {
    marginBottom: 24,
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewSnippet: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  previewFooter: {
    flexDirection: 'row',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  openButtonText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '800',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
