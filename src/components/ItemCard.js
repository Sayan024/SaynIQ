import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

export default function ItemCard({ item }) {
  const { deleteItem, toggleBookmark } = useContext(VaultContext);
  const navigation = useNavigation();

  const handlePress = () => {
    if (item.type === 'link' && item.url) {
      Linking.openURL(item.url);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(item.text);
    // Could use a toast here, using Alert for simplicity
    Alert.alert("Copied", "Code copied to clipboard!");
  };

  const getIconName = () => {
    if (item.type === 'note') {
      return item.noteType === 'code' ? 'code-slash' : 'document-text';
    }
    if (item.domain?.includes('youtube.com') || item.domain?.includes('youtu.be')) return 'logo-youtube';
    if (item.domain?.includes('instagram.com')) return 'logo-instagram';
    return 'link';
  };

  const getIconColor = () => {
    if (item.type === 'note') {
      return item.noteType === 'code' ? '#38BDF8' : '#10B981'; // Sky Blue for code, Emerald for notes
    }
    if (item.domain?.includes('youtube')) return '#EF4444'; // Red
    if (item.domain?.includes('instagram')) return '#EC4899'; // Pink
    return '#6366F1'; // Indigo
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8} disabled={item.type === 'note' && item.noteType === 'code'}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getIconName()} size={20} color={getIconColor()} style={styles.typeIcon} />
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {item.type === 'note' && item.noteType === 'code' && (
            <TouchableOpacity onPress={copyToClipboard} style={styles.actionBtn}>
              <Ionicons name="copy-outline" size={20} color="#38BDF8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.actionBtn}>
            <Ionicons name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddItem', { itemToEdit: item })} style={styles.actionBtn}>
            <Ionicons name="pencil" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {item.type === 'link' && item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      ) : null}

      {item.type === 'note' && item.noteType === 'code' ? (
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{item.text}</Text>
        </View>
      ) : (
        <Text style={styles.title} numberOfLines={item.type === 'note' ? 5 : 2}>
          {item.type === 'note' ? item.text : item.title}
        </Text>
      )}

      {item.type === 'link' && item.domain ? (
        <Text style={styles.domain}>{item.domain}</Text>
      ) : null}
      
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#151C2C', // Elevated Slate
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262F40',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#6366F1', // Indigo Glow
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Indigo transparent
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: 14,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#0B0F19',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  codeContainer: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 4,
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  domain: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
  },
  date: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  }
});
