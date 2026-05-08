import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
  Modal, Dimensions, ScrollView, Animated
} from 'react-native';
import { VaultContext } from '../context/VaultContext';
import ItemCard from '../components/ItemCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TABS = ['All', 'Notes', 'Links', 'Favourites'];
const SORT_OPTIONS = ['Newest', 'Oldest'];
const FILTER_DEFAULTS = { hasSummary: false, favourites: false, sort: 'Newest' };

export default function NotesScreen() {
  const { state }   = useContext(VaultContext);
  const insets      = useSafeAreaInsets();

  const [searchQuery,   setSearchQuery]   = useState('');
  const [debouncedQ,    setDebouncedQ]    = useState('');
  const [activeTab,     setActiveTab]     = useState('All');
  const [filters,       setFilters]       = useState(FILTER_DEFAULTS);
  const [sheetVisible,  setSheetVisible]  = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(sheetAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };
  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSheetVisible(false));
  };
  const sheetTranslateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  const activeFilterCount = [filters.hasSummary, filters.favourites, filters.sort !== 'Newest'].filter(Boolean).length;

  const items = state.items;

  const filteredItems = items
    .filter(item => {
      if (activeTab === 'Notes'      && item.type !== 'note')   return false;
      if (activeTab === 'Links'      && item.type !== 'link')   return false;
      if (activeTab === 'Favourites' && !item.isBookmarked)     return false;
      if (filters.hasSummary  && !item.summary)                 return false;
      if (filters.favourites  && !item.isBookmarked)            return false;
      if (debouncedQ) {
        const q   = debouncedQ.toLowerCase();
        const txt = [item.title, item.text, item.url, item.category, ...(item.tags || [])].join(' ').toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return filters.sort === 'Newest' ? tb - ta : ta - tb;
    });

  const renderItem = useCallback(({ item }) => <ItemCard item={item} />, []);

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="layers-outline" size={70} color={THEME.colors.cardSecondary} />
      <Text style={styles.emptyTitle}>
        {debouncedQ ? 'No results found' : activeTab === 'All' ? 'Your vault is empty' : `No ${activeTab} yet`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {debouncedQ ? 'Try a different search term' : 'Start adding content from the home screen.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Knowledge Hub</Text>
          <Text style={styles.headerSubtitle}>{items.length} items · {state.items.filter(i => i.summary).length} summarised</Text>
        </View>
        <TouchableOpacity onPress={openSheet} style={styles.filterBtn}>
          <Ionicons name="options" size={20} color={THEME.colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── SEARCH ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={THEME.colors.textSecondary} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes, links, tags…"
          placeholderTextColor={THEME.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── TABS ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView} contentContainerStyle={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── LIST ── */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyComponent />}
      />

      {/* ── BOTTOM-SHEET FILTER MODAL ── */}
      <Modal transparent visible={sheetVisible} animationType="none" onRequestClose={closeSheet}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Filter & Sort</Text>

          {/* Sort */}
          <Text style={styles.sheetSectionLabel}>Sort By</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, filters.sort === opt && styles.chipActive]}
                onPress={() => setFilters(prev => ({ ...prev, sort: opt }))}
              >
                <Text style={[styles.chipText, filters.sort === opt && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Checkboxes */}
          <Text style={styles.sheetSectionLabel}>Show Only</Text>
          {[
            { key: 'hasSummary', label: 'Has AI Summary', icon: 'sparkles' },
            { key: 'favourites', label: 'Favourites only', icon: 'bookmark' },
          ].map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={styles.filterRow}
              onPress={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
            >
              <View style={styles.filterIconWrapper}>
                <Ionicons name={icon} size={18} color={THEME.colors.primary} />
              </View>
              <Text style={styles.filterLabel}>{label}</Text>
              <View style={[styles.checkbox, filters[key] && styles.checkboxActive]}>
                {filters[key] && <Ionicons name="checkmark" size={14} color={THEME.colors.textDark} />}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setFilters(FILTER_DEFAULTS); closeSheet(); }}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={closeSheet}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, paddingTop: THEME.spacing.md, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: THEME.colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { color: THEME.colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 2 },
  filterBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: THEME.colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.border, position: 'relative' },
  filterBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: THEME.colors.textDark, fontSize: 10, fontWeight: '800' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.card, marginHorizontal: THEME.spacing.lg, paddingHorizontal: 16, height: 52, borderRadius: THEME.borderRadius.md, marginBottom: 10, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  searchInput: { flex: 1, color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '500' },
  tabScrollView: { maxHeight: 52, marginBottom: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: THEME.spacing.lg, alignItems: 'center', gap: 8 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: THEME.borderRadius.xl, backgroundColor: THEME.colors.card, borderWidth: 1, borderColor: THEME.colors.border },
  tabBtnActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  tabText: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  // FIX: hardcoded dark color so it's always readable on lime/primary background
  tabTextActive: { color: '#1A0A30', fontWeight: '800' },
  list: { paddingHorizontal: THEME.spacing.lg, paddingBottom: 140 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: THEME.colors.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: 40, lineHeight: 24 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: THEME.colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 24, elevation: 24 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: THEME.colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  sheetSectionLabel: { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: THEME.colors.cardSecondary, borderWidth: 1, borderColor: THEME.colors.border },
  chipActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  chipText: { color: THEME.colors.textSecondary, fontWeight: '700', fontSize: 14 },
  chipTextActive: { color: '#1A0A30', fontWeight: '800' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  filterIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  filterLabel: { flex: 1, color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '600' },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: THEME.colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  sheetFooter: { flexDirection: 'row', gap: 12, marginTop: 24 },
  resetBtn: { flex: 1, paddingVertical: 16, borderRadius: THEME.borderRadius.md, backgroundColor: THEME.colors.cardSecondary, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  resetText: { color: THEME.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  applyBtn: { flex: 1, paddingVertical: 16, borderRadius: THEME.borderRadius.md, backgroundColor: THEME.colors.primary, alignItems: 'center' },
  applyText: { color: '#1A0A30', fontWeight: '800', fontSize: 15 },
});
