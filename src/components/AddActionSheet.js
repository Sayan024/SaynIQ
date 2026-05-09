import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Modal, Dimensions, Animated, Pressable 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddActionSheet({ visible, onClose, onAction, theme }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0]
  });

  const ACTIONS = [
    { id: 'note', label: 'Create Note', icon: 'document-text', color: theme.colors.primary, screen: 'AddItem' },
    { id: 'link', label: 'Save Link', icon: 'link', color: '#60A5FA', screen: 'AddLink' },
    { id: 'finance', label: 'Add Expense', icon: 'card', color: '#4ADE80', screen: 'Finance' },
  ];

  if (!visible && anim._value === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          style={[
            styles.sheetContainer, 
            { transform: [{ translateY }] }
          ]}
        >
          <BlurView intensity={80} tint="dark" style={[styles.sheet, { borderColor: theme.colors.border }]}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Quick Actions</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>What would you like to capture?</Text>

            <View style={styles.actionGrid}>
              {ACTIONS.map(action => (
                <TouchableOpacity 
                  key={action.id} 
                  style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => { onClose(); onAction(action.screen); }}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon} size={26} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheetContainer: { width: '100%' },
  sheet: { 
    borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 60,
    borderWidth: 1, borderBottomWidth: 0,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 32, opacity: 0.7 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionBtn: { 
    flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  iconBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 13, fontWeight: '800' },
});
