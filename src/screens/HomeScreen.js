import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ['All', 'Study', 'Learning', 'Inspiration', 'Projects'];

export default function HomeScreen({ navigation }) {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = state.items.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle} numberOfLines={2}>Sayan High Class Study Note Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.aboutBtn}>
          <Ionicons name="information-circle-outline" size={28} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setActiveCategory(item)}>
              <Text style={[
                styles.filterPill, 
                activeCategory === item && styles.activePill
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={<EmptyState title="Your vault is empty" subtitle="Tap the + button to add your first item." />}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', flex: 1, marginRight: 15 },
  aboutBtn: { padding: 4 },
  filterContainer: { marginBottom: 20 },
  filterPill: { 
    color: '#94A3B8', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#151C2C', 
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    fontWeight: '600'
  },
  activePill: { color: '#FFFFFF', backgroundColor: '#6366F1', borderColor: '#6366F1' },
  list: { paddingBottom: 100 },
  fab: {
    position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, 
    borderRadius: 32, backgroundColor: '#6366F1', justifyContent: 'center', 
    alignItems: 'center', elevation: 8, shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }
  }
});
