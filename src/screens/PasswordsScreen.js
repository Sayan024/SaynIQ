import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPasswordsList, deletePassword } from '../services/passwordService';
import PasswordCard from '../components/PasswordCard';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function PasswordsScreen({ navigation }) {
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background decoration */}
      <View style={[styles.blob, styles.blobTopLeft]} />

      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <Ionicons name="lock-closed" size={24} color={THEME.colors.warning} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Secure Vault</Text>
          <Text style={styles.headerSubtitle}>Manage your passwords safely</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={THEME.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your vault..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={20} color={THEME.colors.textSecondary} />
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
            <View style={styles.emptyIconContainer}>
              <Ionicons name="key-outline" size={60} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matching passwords" : "Your vault is empty"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "Tap the button below to store your first password securely."}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => navigation.navigate('AddPassword')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={THEME.colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  blob: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    opacity: 0.05,
    backgroundColor: THEME.colors.warning,
  },
  blobTopLeft: {
    top: -width * 0.4,
    left: -width * 0.3,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    marginBottom: THEME.spacing.sm
  },
  headerIconWrapper: {
    padding: 12,
    backgroundColor: THEME.colors.cardSecondary,
    borderRadius: THEME.borderRadius.lg,
    marginRight: 16,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    marginHorizontal: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.md,
    height: 56,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  list: { 
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 160 
  },
  fab: {
    position: 'absolute', 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: THEME.colors.primary, 
    shadowOpacity: 0.5, 
    shadowRadius: 14, 
    shadowOffset: { width: 0, height: 6 },
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
    backgroundColor: THEME.colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  }
});
