import React, { useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';

export default function LinksScreen() {
  const { state } = useContext(VaultContext);
  const links = state.items.filter(item => item.type === 'link');

  return (
    <View style={styles.container}>
      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={<EmptyState iconName="link-outline" title="No links saved" subtitle="Save your favorite URLs and they will appear here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20, paddingTop: 20 },
  list: { paddingBottom: 100 },
});
