import React, { useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';

export default function NotesScreen() {
  const { state } = useContext(VaultContext);
  const notes = state.items.filter(item => item.type === 'note');

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={<EmptyState iconName="document-text-outline" title="No notes saved" subtitle="Save some text notes and they will appear here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20, paddingTop: 20 },
  list: { paddingBottom: 100 },
});
