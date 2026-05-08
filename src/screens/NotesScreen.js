import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Ideas', 'Code', 'Study', 'Personal'];

export default function NotesScreen() {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const notes = state.items.filter(item => item.type === 'note');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || note.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || note.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background decoration */}
      <View style={[styles.blob, styles.blobTopRight]} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="funnel" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={THEME.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your notes..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === item && styles.categoryChipActive
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[
                styles.categoryChipText,
                activeCategory === item && styles.categoryChipTextActive
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: THEME.spacing.lg }}
        />
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 100)}>
            <ItemCard item={item} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={80} color={THEME.colors.cardSecondary} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "Your second brain starts here. Add a note!"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  blob: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 9999,
    opacity: 0.08,
    backgroundColor: THEME.colors.primary,
  },
  blobTopRight: {
    top: -width * 0.8,
    right: -width * 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    marginHorizontal: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.md,
    height: 56,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: THEME.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.xl,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: THEME.colors.textDark,
  },
  list: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 120, // Space for bottom tabs
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  }
});
