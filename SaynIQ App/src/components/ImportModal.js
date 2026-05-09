import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function ImportModal({ visible, onClose, onImport, item, theme }) {
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
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Import Shared Content</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Add this to your Knowledge Hub</Text>
          </div>

          {/* Content Preview Card */}
          <LinearGradient
            colors={['#7C3AED', '#4B1D83']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewCard}
          >
            <View style={styles.previewHeader}>
              <View style={styles.appBadge}>
                <Ionicons name="sparkles" size={12} color="#FFF" />
                <Text style={styles.appBadgeText}>SaynIQ</Text>
              </View>
              <Text style={styles.typeBadge}>{item.type?.toUpperCase() || 'KNOWLEDGE'}</Text>
            </View>

            <View style={styles.previewBody}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {item.title || 'Untitled Content'}
              </Text>
              <Text style={styles.previewSnippet} numberOfLines={3}>
                {item.type === 'note' ? item.text : item.url}
              </Text>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Ionicons name="folder-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          <View style={styles.actionContainer}>
            <Text style={[styles.questionText, { color: theme.colors.textPrimary }]}>
              Do you want to save this to your Knowledge Hub?
            </Text>
            
            <TouchableOpacity 
              style={styles.importButton}
              onPress={onImport}
            >
              <LinearGradient
                colors={['#D7E65A', '#B8C64A']}
                style={styles.buttonGradient}
              >
                <Ionicons name="download-outline" size={20} color="#120824" />
                <Text style={styles.importButtonText}>Save Content</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Not Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} />
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Securely stored in your local vault
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewCard: {
    padding: 20,
    borderRadius: 28,
    marginBottom: 32,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  appBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  previewBody: {
    marginBottom: 8,
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  previewSnippet: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  importButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  importButtonText: {
    color: '#120824',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
