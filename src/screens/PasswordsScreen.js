import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPasswordsList, deletePassword } from '../services/passwordService';
import PasswordCard from '../components/PasswordCard';
import EmptyState from '../components/EmptyState';

export default function PasswordsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPasswords = async () => {
    const list = await getPasswordsList();
    setPasswords(list);
  };

  useFocusEffect(
    useCallback(() => {
      loadPasswords();
    }, [])
  );

  const handleDelete = async (id) => {
    await deletePassword(id);
    loadPasswords();
  };

  const handleEdit = (item) => {
    navigation.navigate('AddPassword', { passwordToEdit: item });
  };

  const filteredPasswords = passwords.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Password Manager</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search passwords..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPasswords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PasswordCard 
            item={item} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
        ListEmptyComponent={
          <EmptyState 
            title={searchQuery ? "No matching passwords" : "No passwords yet"} 
            subtitle="Tap the + button to store your first password securely." 
          />
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddPassword')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', paddingHorizontal: 20 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: 10 
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F8FAFC' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151C2C',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    height: '100%',
  },
  list: { paddingBottom: 100 },
  fab: {
    position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, 
    borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', 
    alignItems: 'center', elevation: 8, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }
  }
});
