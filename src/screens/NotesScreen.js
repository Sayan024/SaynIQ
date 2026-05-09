import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const { state }   = useContext(VaultContext);

  const theme = state.theme;
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
      <Ionicons name="layers-outline" size={70} color={theme.colors.cardSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        {debouncedQ ? 'No results found' : activeTab === 'All' ? 'Your vault is empty' : `No ${activeTab} yet`}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {debouncedQ ? 'Try a different search term' : 'Start adding content from the home screen.'}
      </Text>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: theme.colors.primary }]} 
        onPress={() => navigation.navigate('AddItem')}
      >
        <Ionicons name="document-text" size={18} color={theme.colors.textDark} />
        <Text style={[styles.actionCardText, { color: theme.colors.textDark }]}>Add Note</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} 
        onPress={() => navigation.navigate('AddLink')}
      >
        <Ionicons name="link" size={18} color={theme.colors.primary} />
        <Text style={[styles.actionCardText, { color: theme.colors.textPrimary }]}>Add Link</Text>
      </TouchableOpacity>
    </View>
  );

  return (

    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Knowledge Hub</Text>
          <View style={styles.headerMetaRow}>
            <Ionicons name="layers" size={12} color={theme.colors.primary} />
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{items.length} items</Text>
            <View style={[styles.headerDot, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{(state.items || []).filter(i => i.summary).length} summarized</Text>
          </View>

        </View>
        <TouchableOpacity onPress={() => setSearchQuery('')} style={[styles.searchToggle, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search-outline" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── SEARCH ── */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search your second brain…"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {renderQuickActions()}

      {/* ── CATEGORY TABS ── */}

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn, 
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                activeTab === tab && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === tab && { color: theme.colors.textDark }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── CONTENT LIST ── */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyComponent />}
      />

      {/* ── FLOATING FILTER BUTTON ── */}
      <TouchableOpacity 
        style={[
          styles.floatingFilter, 
          { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
          activeFilterCount > 0 && { backgroundColor: theme.colors.primary }
        ]} 
        onPress={openSheet}
        activeOpacity={0.9}
      >
        <Ionicons name="filter" size={24} color={activeFilterCount > 0 ? theme.colors.textDark : theme.colors.primary} />
        {activeFilterCount > 0 && (
          <View style={[styles.filterCountBadge, { borderColor: theme.colors.primary }]}>
            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── BOTTOM-SHEET FILTER MODAL ── */}
      <Modal transparent visible={sheetVisible} animationType="none" onRequestClose={closeSheet}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />
        <Animated.View style={[styles.sheet, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>Refine Vault</Text>

          {/* Sort */}
          <Text style={[styles.sheetSectionLabel, { color: theme.colors.textSecondary }]}>Order By</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip, 
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  filters.sort === opt && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => setFilters(prev => ({ ...prev, sort: opt }))}
              >
                <Text style={[styles.chipText, { color: theme.colors.textSecondary }, filters.sort === opt && { color: theme.colors.textDark }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Attributes */}
          <Text style={[styles.sheetSectionLabel, { color: theme.colors.textSecondary }]}>Attributes</Text>
          {[
            { key: 'hasSummary', label: 'AI Summarized', icon: 'sparkles' },
            { key: 'favourites', label: 'Bookmarked Only', icon: 'bookmark' },
          ].map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
              activeOpacity={0.7}
            >
              <View style={[styles.filterIconWrapper, { backgroundColor: theme.colors.card }]}>
                <Ionicons name={icon} size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.filterLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
              <View style={[styles.checkbox, { borderColor: theme.colors.border }, filters[key] && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                {filters[key] && <Ionicons name="checkmark" size={14} color={theme.colors.textDark} />}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.sheetFooter}>
            <TouchableOpacity style={[styles.resetBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => { setFilters(FILTER_DEFAULTS); closeSheet(); }}>
              <Text style={[styles.resetText, { color: theme.colors.textSecondary }]}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]} onPress={closeSheet}>
              <Text style={[styles.applyText, { color: theme.colors.textDark }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  headerSubtitle: { fontSize: 13, fontWeight: '700' },
  headerDot: { width: 3, height: 3, borderRadius: 1.5, opacity: 0.5 },
  searchToggle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    marginHorizontal: 24, paddingHorizontal: 18, height: 54, borderRadius: 18, 
    marginBottom: 15, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  clearSearch: { padding: 4 },

  tabContainer: { marginBottom: 10 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 10 },
  tabBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 14, fontWeight: '800' },

  list: { paddingHorizontal: 24, paddingBottom: 150, paddingTop: 10 },
  
  floatingFilter: { 
    position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 15, elevation: 12, zIndex: 10
  },
  filterCountBadge: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF4B6E', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  filterCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 22, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 50, lineHeight: 24, fontWeight: '500' },
  
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 50, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30, elevation: 25 },
  sheetHandle: { width: 45, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 25 },
  sheetTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25, letterSpacing: -0.5 },
  sheetSectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, opacity: 0.8 },
  chipRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  chip: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 15, borderWidth: 1 },
  chipText: { fontWeight: '800', fontSize: 14 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  filterIconWrapper: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  filterLabel: { flex: 1, fontSize: 17, fontWeight: '700' },
  checkbox: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  sheetFooter: { flexDirection: 'row', gap: 15, marginTop: 35 },
  resetBtn: { flex: 1, paddingVertical: 18, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
  resetText: { fontWeight: '800', fontSize: 16 },
  applyBtn: { flex: 1, paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  applyText: { fontWeight: '900', fontSize: 16 },

  quickActions: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 10, borderWidth: 1 },
  actionCardText: { fontSize: 14, fontWeight: '800' },
});



