import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['General', 'Study', 'Learning', 'Inspiration', 'Projects'];

export default function AddItemScreen({ navigation, route }) {
  const { addItem, editItem } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  
  const itemToEdit = route.params?.itemToEdit;
  const isEditing = !!itemToEdit;

  const [type, setType] = useState('note');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  
  // New Fields
  const [customTitle, setCustomTitle] = useState('');
  const [noteType, setNoteType] = useState('plain'); // 'plain' | 'code'
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setType(itemToEdit.type);
      setContent(itemToEdit.type === 'note' ? itemToEdit.text : itemToEdit.url);
      setCategory(itemToEdit.category || 'General');
      
      if (itemToEdit.type === 'link') {
        // If it had a custom title or overriding title, we populate it
        setCustomTitle(itemToEdit.title || '');
      } else {
        setNoteType(itemToEdit.noteType || 'plain');
      }
    }
  }, [isEditing, itemToEdit]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    
    const payload = {
      type,
      category,
      [type === 'note' ? 'text' : 'url']: content,
    };
    
    if (type === 'link') {
      payload.customTitle = customTitle;
    } else {
      payload.noteType = noteType;
    }

    if (isEditing) {
      await editItem(itemToEdit.id, payload);
    } else {
      await addItem({ ...payload, tags: [] });
    }
    
    setIsLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'New Entry'}</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isEditing && (
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setType('note')} style={[styles.toggleBtn, type === 'note' && styles.activeToggleBtn]}>
              <Ionicons name="document-text" size={18} color={type === 'note' ? '#fff' : '#64748B'} style={{marginRight: 6}} />
              <Text style={[styles.toggleText, type === 'note' && styles.activeToggleText]}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('link')} style={[styles.toggleBtn, type === 'link' && styles.activeToggleBtn]}>
              <Ionicons name="link" size={18} color={type === 'link' ? '#fff' : '#64748B'} style={{marginRight: 6}} />
              <Text style={[styles.toggleText, type === 'link' && styles.activeToggleText]}>Link</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setCategory(item)}>
                <Text style={[
                  styles.categoryPill, 
                  category === item && styles.activeCategoryPill
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {type === 'note' && (
          <>
            <Text style={styles.label}>Note Type</Text>
            <View style={[styles.toggleRow, { marginBottom: 16 }]}>
              <TouchableOpacity onPress={() => setNoteType('plain')} style={[styles.toggleBtn, noteType === 'plain' && styles.activeToggleBtn]}>
                <Ionicons name="text-outline" size={18} color={noteType === 'plain' ? '#fff' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.toggleText, noteType === 'plain' && styles.activeToggleText]}>Plain Text</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoteType('code')} style={[styles.toggleBtn, noteType === 'code' && styles.activeToggleBtn]}>
                <Ionicons name="code-slash" size={18} color={noteType === 'code' ? '#fff' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.toggleText, noteType === 'code' && styles.activeToggleText]}>Code Snippet</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {type === 'link' && (
          <>
            <Text style={styles.label}>Custom Title (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Override fetched YouTube/Web title"
              placeholderTextColor="#475569"
              value={customTitle}
              onChangeText={setCustomTitle}
            />
          </>
        )}

        <Text style={styles.label}>{type === 'note' ? (noteType === 'code' ? 'Code Content' : 'Your Note') : 'URL Link'}</Text>
        <TextInput
          style={[
            styles.input, 
            type === 'note' && styles.noteInput,
            noteType === 'code' && type === 'note' && styles.codeField
          ]}
          placeholder={type === 'note' ? (noteType === 'code' ? "// Paste your code here..." : "Write your thoughts here...") : "https://youtube.com/..."}
          placeholderTextColor="#475569"
          multiline={type === 'note'}
          value={content}
          onChangeText={setContent}
          autoCapitalize={noteType === 'code' || type === 'link' ? "none" : "sentences"}
          autoCorrect={type === 'note' && noteType === 'plain'}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{isEditing ? 'Update Entry' : 'Save to Vault'}</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 5, backgroundColor: '#151C2C', borderRadius: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#151C2C', borderRadius: 14, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  toggleBtn: { flex: 1, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  activeToggleBtn: { backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  toggleText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  activeToggleText: { color: '#FFFFFF' },
  label: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  categoryContainer: { marginBottom: 24 },
  categoryPill: { 
    color: '#94A3B8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, 
    backgroundColor: '#151C2C', marginRight: 10, borderWidth: 1, borderColor: '#1E293B',
    overflow: 'hidden', fontWeight: '500'
  },
  activeCategoryPill: { color: '#FFFFFF', backgroundColor: '#6366F1', borderColor: '#6366F1', fontWeight: '700' },
  input: { backgroundColor: '#151C2C', color: '#F8FAFC', borderRadius: 16, padding: 18, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
  noteInput: { height: 180, textAlignVertical: 'top' },
  codeField: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
  },
  saveBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 }
});
