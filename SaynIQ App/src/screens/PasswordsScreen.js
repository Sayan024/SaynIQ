import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPasswordsList, deletePassword } from '../services/passwordService';
import PasswordCard from '../components/PasswordCard';
import { VaultContext } from '../context/VaultContext';

const { width } = Dimensions.get('window');

export default function PasswordsScreen({ navigation }) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPasswords = async () => {
    const list = await getPasswordsList();
    // Sort by newest first
    const sorted = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPasswords(sorted);
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

  const fabBottom = insets.bottom + 90;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Background decoration */}
      <View style={[styles.blob, { backgroundColor: theme.colors.warning }]} />

      <View style={styles.header}>
        <View style={[styles.headerIconWrapper, { backgroundColor: theme.colors.cardSecondary }]}>
          <Ionicons name="lock-closed" size={24} color={theme.colors.warning} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Secure Vault</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Manage your passwords safely</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search your vault..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPasswords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PasswordCard 
            item={item} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.cardSecondary }]}>
              <Ionicons name="key-outline" size={60} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              {searchQuery ? "No matching passwords" : "Your vault is empty"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {searchQuery ? "Try a different search term" : "Tap the button below to store your first password securely."}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPassword')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={theme.colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    opacity: 0.05,
    top: -width * 0.4,
    left: -width * 0.3,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8
  },
  headerIconWrapper: {
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  list: { 
    paddingHorizontal: 24,
    paddingBottom: 160 
  },
  fab: {
    position: 'absolute', 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 10
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  }
});

