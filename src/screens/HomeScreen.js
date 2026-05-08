import React, { useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPasswordsList } from '../services/passwordService';
import ItemCard from '../components/ItemCard';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [passwordCount, setPasswordCount] = useState(0);

  // FAB Menu State
  const [isFabOpen, setIsFabOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsFabOpen(!isFabOpen);
  };

  const loadPasswords = async () => {
    const list = await getPasswordsList();
    setPasswordCount(list.length);
  };

  useFocusEffect(
    useCallback(() => {
      loadPasswords();
    }, [])
  );

  const notesCount = state.items.filter(i => i.type === 'note').length;
  const linksCount = state.items.filter(i => i.type === 'link').length;
  const recentItems = state.items.slice(0, 3);

  const fabRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const actionItemStyle = (index) => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -70 * index]
    });
    const scale = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    return {
      opacity: animation,
      transform: [{ translateY }, { scale }]
    };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Blobs for depth */}
      <View style={[styles.blob, styles.blobTop]} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Area */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Evening,</Text>
            <Text style={styles.headerTitle}>Sayan</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.iconBtn}>
            <Ionicons name="person" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroSubtitle}>Ready to organize</Text>
            <Text style={styles.heroTitle}>Your Second Brain?</Text>
          </View>
          <Ionicons name="planet" size={64} color={THEME.colors.highlight} style={styles.heroIcon} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: THEME.colors.primary }]} onPress={() => navigation.navigate('AI Chat')}>
            <Ionicons name="sparkles" size={20} color={THEME.colors.textDark} />
            <Text style={[styles.actionChipText, { color: THEME.colors.textDark }]}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate('Notes')}>
            <Ionicons name="document-text" size={20} color={THEME.colors.highlight} />
            <Text style={styles.actionChipText}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate('Passwords')}>
            <Ionicons name="key" size={20} color={THEME.colors.highlight} />
            <Text style={styles.actionChipText}>Pass</Text>
          </TouchableOpacity>
        </View>

        {/* Overview Widgets */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
              <Ionicons name="document-text" size={24} color={THEME.colors.primary} />
            </View>
            <View style={styles.gridTextContent}>
              <Text style={styles.gridNumber}>{notesCount}</Text>
              <Text style={styles.gridLabel}>Notes</Text>
            </View>
          </View>
          
          <View style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
              <Ionicons name="link" size={24} color={THEME.colors.highlight} />
            </View>
            <View style={styles.gridTextContent}>
              <Text style={styles.gridNumber}>{linksCount}</Text>
              <Text style={styles.gridLabel}>Links</Text>
            </View>
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
              <Ionicons name="key" size={24} color={THEME.colors.warning} />
            </View>
            <View style={styles.gridTextContent}>
              <Text style={styles.gridNumber}>{passwordCount}</Text>
              <Text style={styles.gridLabel}>Passwords</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
              <Ionicons name="flame" size={24} color={THEME.colors.danger} />
            </View>
            <View style={styles.gridTextContent}>
              <Text style={styles.gridNumber}>3</Text>
              <Text style={styles.gridLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Recent Items */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notes')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {recentItems.length > 0 ? (
          recentItems.map(item => <ItemCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={64} color={THEME.colors.border} />
            <Text style={styles.emptyText}>Nothing here yet. Add a note or link!</Text>
          </View>
        )}

        <View style={{height: 140}} />
      </ScrollView>

      {/* Expandable FAB Menu */}
      <View style={styles.fabContainer}>
        {/* Menu Item 2: Add Password */}
        <Animated.View style={[styles.fabMenuBtn, actionItemStyle(2)]}>
          <Text style={styles.fabSubLabel}>Password</Text>
          <TouchableOpacity onPress={() => { toggleFab(); navigation.navigate('AddPassword'); }} style={styles.fabSubBtn}>
            <Ionicons name="key" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Menu Item 1: Add Item */}
        <Animated.View style={[styles.fabMenuBtn, actionItemStyle(1)]}>
          <Text style={styles.fabSubLabel}>Note / Link</Text>
          <TouchableOpacity onPress={() => { toggleFab(); navigation.navigate('AddItem'); }} style={styles.fabSubBtn}>
            <Ionicons name="document-text" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity style={styles.fabMainBtn} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
            <Ionicons name="add" size={36} color={THEME.colors.textDark} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  blob: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: 9999,
    opacity: 0.1,
    backgroundColor: THEME.colors.primary,
  },
  blobTop: {
    top: -width * 0.6,
    right: -width * 0.3,
  },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, marginBottom: THEME.spacing.lg, marginTop: THEME.spacing.md },
  greeting: { color: THEME.colors.textSecondary, fontSize: 16, fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: THEME.colors.textPrimary, letterSpacing: -0.5 },
  iconBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingHorizontal: THEME.spacing.lg },
  
  heroCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTextContainer: { flex: 1, paddingRight: 16 },
  heroSubtitle: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroTitle: { color: THEME.colors.textPrimary, fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heroIcon: { opacity: 0.8 },

  quickActionsRow: { flexDirection: 'row', marginBottom: THEME.spacing.xl, justifyContent: 'space-between' },
  actionChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.colors.card, paddingVertical: 14, borderRadius: THEME.borderRadius.xl, marginHorizontal: 4 },
  actionChipText: { color: THEME.colors.textPrimary, fontWeight: '700', fontSize: 15, marginLeft: 8 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: THEME.spacing.lg, marginTop: THEME.spacing.md },
  sectionTitle: { color: THEME.colors.textPrimary, fontSize: 22, fontWeight: '800' },
  seeAllText: { color: THEME.colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrapper: { padding: 12, borderRadius: THEME.borderRadius.md, marginRight: 12 },
  gridTextContent: { flex: 1 },
  gridNumber: { color: THEME.colors.textPrimary, fontSize: 22, fontWeight: '800' },
  gridLabel: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 2 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg },
  emptyText: { color: THEME.colors.textSecondary, marginTop: 16, fontSize: 16, fontWeight: '500' },
  
  fabContainer: {
    position: 'absolute',
    bottom: 100, // Above bottom tab
    right: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  fabMainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabMenuBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 4,
    bottom: 4,
  },
  fabSubBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSubLabel: {
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 16,
    fontSize: 15,
    fontWeight: '700',
    overflow: 'hidden'
  }
});
