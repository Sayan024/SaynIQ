import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateAutoTitle, generateSmartTags } from '../services/geminiService';
import { THEME } from '../styles/theme';

const CATEGORIES = [
  'Study', 'Coding', 'SQL', 'Python', 'Power BI', 'Microsoft Fabric', 'AI', 
  'Productivity', 'Business', 'Finance', 'Motivation', 'Editing', 'YouTube', 
  'Instagram', 'Career', 'Interview Prep', 'Personal', 'Research', 'Important', 'Bookmarks'
];

export default function AddItemScreen({ navigation, route }) {
  const { addItem, editItem } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  
  const itemToEdit = route.params?.itemToEdit;
  const isEditing = !!itemToEdit;

  const [type, setType] = useState('note');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Study');
  const [categorySearch, setCategorySearch] = useState('');
  
  // New Fields
  const [customTitle, setCustomTitle] = useState('');
  const [noteType, setNoteType] = useState('plain'); // 'plain' | 'code'
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    if (isEditing) {
      setType(itemToEdit.type);
      setContent(itemToEdit.type === 'note' ? itemToEdit.text : itemToEdit.url);
      setCategory(itemToEdit.category || 'Study');
      
      if (itemToEdit.type === 'link') {
        setCustomTitle(itemToEdit.title || '');
      } else {
        setNoteType(itemToEdit.noteType || 'plain');
      }
    }
  }, [isEditing, itemToEdit]);

  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setLoadingText('Saving...');
    
    const payload = {
      type,
      category,
      [type === 'note' ? 'text' : 'url']: content,
    };
    
    if (type === 'link') {
      payload.customTitle = customTitle;
    } else {
      payload.noteType = noteType;
      // Auto generate title for notes
      setLoadingText('AI generating title...');
      try {
        const generatedTitle = await generateAutoTitle(content);
        payload.title = generatedTitle;
      } catch(e) {
        payload.title = content.substring(0, 30) + '...';
      }
    }

    setLoadingText('AI analyzing tags...');
    try {
      const generatedTags = await generateSmartTags(content);
      payload.tags = generatedTags || [];
    } catch(e) {
      payload.tags = [];
    }

    setLoadingText('Finalizing...');
    if (isEditing) {
      await editItem(itemToEdit.id, payload);
    } else {
      await addItem(payload);
    }
    
    setIsLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={26} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add to Vault'}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!isEditing && (
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setType('note')} style={[styles.toggleBtn, type === 'note' && styles.activeToggleBtn]}>
              <Ionicons name="document-text" size={18} color={type === 'note' ? THEME.colors.textDark : THEME.colors.textSecondary} style={{marginRight: 8}} />
              <Text style={[styles.toggleText, type === 'note' && styles.activeToggleText]}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('link')} style={[styles.toggleBtn, type === 'link' && styles.activeToggleBtn]}>
              <Ionicons name="link" size={18} color={type === 'link' ? THEME.colors.textDark : THEME.colors.textSecondary} style={{marginRight: 8}} />
              <Text style={[styles.toggleText, type === 'link' && styles.activeToggleText]}>Link</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.categorySearchContainer}>
          <Ionicons name="search" size={18} color={THEME.colors.textSecondary} style={{marginRight: 8}} />
          <TextInput 
            style={styles.categorySearchInput}
            placeholder="Search categories..."
            placeholderTextColor={THEME.colors.textSecondary}
            value={categorySearch}
            onChangeText={setCategorySearch}
          />
        </View>
        
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredCategories}
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
            ListEmptyComponent={<Text style={{color: THEME.colors.textSecondary, marginLeft: 4}}>No categories found.</Text>}
          />
        </View>

        {type === 'note' && (
          <>
            <Text style={styles.label}>Note Type</Text>
            <View style={[styles.toggleRow, { marginBottom: 24 }]}>
              <TouchableOpacity onPress={() => setNoteType('plain')} style={[styles.toggleBtn, noteType === 'plain' && styles.activeToggleBtn]}>
                <Ionicons name="text-outline" size={18} color={noteType === 'plain' ? THEME.colors.textDark : THEME.colors.textSecondary} style={{marginRight: 8}} />
                <Text style={[styles.toggleText, noteType === 'plain' && styles.activeToggleText]}>Plain Text</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoteType('code')} style={[styles.toggleBtn, noteType === 'code' && styles.activeToggleBtn]}>
                <Ionicons name="code-slash" size={18} color={noteType === 'code' ? THEME.colors.textDark : THEME.colors.textSecondary} style={{marginRight: 8}} />
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
              placeholder="Override auto-fetched title..."
              placeholderTextColor={THEME.colors.textSecondary}
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
          placeholder={type === 'note' ? (noteType === 'code' ? "// Paste your code here..." : "Start typing your thoughts...") : "https://youtube.com/..."}
          placeholderTextColor={THEME.colors.textSecondary}
          multiline={type === 'note'}
          value={content}
          onChangeText={setContent}
          autoCapitalize={noteType === 'code' || type === 'link' ? "none" : "sentences"}
          autoCorrect={type === 'note' && noteType === 'plain'}
        />

        <View style={{ height: 60 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator color={THEME.colors.textDark} style={{marginRight: 10}} />
              <Text style={styles.saveBtnText}>{loadingText}</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>{isEditing ? 'Update Item' : 'Save Item'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, marginBottom: 20, marginTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: THEME.colors.textPrimary },
  scrollContent: { paddingHorizontal: THEME.spacing.lg },
  
  toggleRow: { flexDirection: 'row', backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.xl, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: THEME.colors.border },
  toggleBtn: { flex: 1, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: THEME.borderRadius.lg },
  activeToggleBtn: { backgroundColor: THEME.colors.primary, shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  toggleText: { color: THEME.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  activeToggleText: { color: THEME.colors.textDark },
  
  label: { color: THEME.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  
  categorySearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.md, paddingHorizontal: 16, marginBottom: 12, height: 48, borderWidth: 1, borderColor: THEME.colors.border },
  categorySearchInput: { flex: 1, color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '500' },
  
  categoryContainer: { marginBottom: 30 },
  categoryPill: { 
    color: THEME.colors.textSecondary, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: THEME.borderRadius.xl, 
    backgroundColor: THEME.colors.card, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    overflow: 'hidden', 
    fontWeight: '600',
    fontSize: 14
  },
  activeCategoryPill: { color: THEME.colors.textPrimary, backgroundColor: THEME.colors.cardSecondary, borderColor: THEME.colors.highlight, fontWeight: '800' },
  
  input: { 
    backgroundColor: THEME.colors.card, 
    color: THEME.colors.textPrimary, 
    borderRadius: THEME.borderRadius.lg, 
    padding: 20, 
    fontSize: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  noteInput: { height: 200, textAlignVertical: 'top' },
  codeField: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.colors.primary,
  },
  
  footer: { padding: THEME.spacing.lg, backgroundColor: THEME.colors.background, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  saveBtn: { backgroundColor: THEME.colors.primary, paddingVertical: 18, borderRadius: THEME.borderRadius.xl, alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: THEME.colors.textDark, fontWeight: '800', fontSize: 18 }
});
