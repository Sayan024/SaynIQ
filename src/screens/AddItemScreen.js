import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/theme';


const CATEGORIES = [
  'Study', 'Coding', 'SQL', 'Python', 'Power BI', 'Microsoft Fabric', 'AI', 
  'Productivity', 'Business', 'Finance', 'Motivation', 'Editing', 'YouTube', 
  'Instagram', 'Career', 'Interview Prep', 'Personal', 'Research', 'Important', 'Bookmarks'
];

export default function AddItemScreen({ navigation, route }) {
  const { state, addItem, editItem } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const itemToEdit = route.params?.itemToEdit;
  const isEditing = !!itemToEdit;


  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Study');
  const [categorySearch, setCategorySearch] = useState('');
  
  // New Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState('plain'); // 'plain' | 'code'
  
  const [alertType, setAlertType] = useState(null); // 'Watch Important' | 'Read Later' | 'Don't Forget'
  const [reminderDays, setReminderDays] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');


  useEffect(() => {
    if (isEditing) {

      setContent(itemToEdit.type === 'note' ? itemToEdit.text : itemToEdit.url);
      setCategory(itemToEdit.category || 'Study');
      
      setNoteType(itemToEdit.noteType || 'plain');
      setNoteTitle(itemToEdit.title || '');
      setAlertType(itemToEdit.alertType || null);
      setReminderDays(itemToEdit.reminderDays || null);

    }
  }, [isEditing, itemToEdit]);


  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setLoadingText('Saving...');
    
    const payload = {
      type: 'note',
      category,
      text: content,
      tags: [],
      noteType: noteType,
      title: noteTitle.trim() || (content.substring(0, 30) + (content.length > 30 ? '...' : '')),
      alertType,
      reminderDays,
      reminderDate: reminderDays ? new Date(Date.now() + reminderDays * 24 * 60 * 60 * 1000).toISOString() : null,
    };

    try {
      if (isEditing) {
        await editItem(itemToEdit.id, payload);
        Alert.alert("Success", "Note updated! " + (reminderDays ? "Reminder active." : ""));
      } else {
        await addItem(payload);
        Alert.alert("Success", "Note saved! " + (reminderDays ? "Reminder scheduled." : ""));
      }
      navigation.goBack();
    } catch (error) {
      console.error("Note Save Error:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };






  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.cardSecondary }]}>
          <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{isEditing ? 'Edit Note' : 'Add Notes'}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>


        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Select Category</Text>
        <View style={[styles.categorySearchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={{marginRight: 8}} />
          <TextInput 
            style={[styles.categorySearchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search categories..."
            placeholderTextColor={theme.colors.textSecondary}
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
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.textSecondary },
                  category === item && { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.highlight, color: theme.colors.textPrimary, fontWeight: '800' }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{color: theme.colors.textSecondary, marginLeft: 4}}>No categories found.</Text>}
          />
        </View>

        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Note Type</Text>

            <View style={[styles.toggleRow, { marginBottom: 24, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TouchableOpacity onPress={() => setNoteType('plain')} style={[styles.toggleBtn, noteType === 'plain' && { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="text-outline" size={18} color={noteType === 'plain' ? theme.colors.textDark : theme.colors.textSecondary} style={{marginRight: 8}} />
                <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, noteType === 'plain' && { color: theme.colors.textDark }]}>Plain Text</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoteType('code')} style={[styles.toggleBtn, noteType === 'code' && { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="code-slash" size={18} color={noteType === 'code' ? theme.colors.textDark : theme.colors.textSecondary} style={{marginRight: 8}} />
                <Text style={[styles.toggleText, { color: theme.colors.textSecondary }, noteType === 'code' && { color: theme.colors.textDark }]}>Code Snippet</Text>
              </TouchableOpacity>
            </View>


        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          placeholder="Give your note a title..."

          placeholderTextColor={theme.colors.textSecondary}
          value={noteTitle}
          onChangeText={setNoteTitle}
        />


        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Alert Status</Text>
        <View style={styles.alertRow}>
          {['Read Later', "Don't Forget", 'Watch Important'].map(type => (
            <TouchableOpacity 
              key={type} 
              onPress={() => setAlertType(alertType === type ? null : type)}
              style={[
                styles.alertChip, 
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                alertType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
            >
              <Text style={[styles.alertText, { color: theme.colors.textSecondary }, alertType === type && { color: theme.colors.textDark }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Set Reminder</Text>
        <View style={styles.reminderRow}>
          {[
            { label: '1 Hr', val: 1/24 },
            { label: '3 Hr', val: 3/24 },
            { label: '1 Day', val: 1 },
            { label: '2 Day', val: 2 },
            { label: '3 Day', val: 3 }
          ].map(opt => (
            <TouchableOpacity 
              key={opt.label} 
              onPress={() => setReminderDays(reminderDays === opt.val ? null : opt.val)}
              style={[
                styles.reminderChip, 
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                reminderDays === opt.val && { backgroundColor: theme.colors.highlight, borderColor: theme.colors.highlight }
              ]}
            >
              <Text style={[styles.reminderText, { color: theme.colors.textSecondary }, reminderDays === opt.val && { color: theme.colors.textDark }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>


        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{noteType === 'code' ? 'Code Content' : 'Your Note'}</Text>


        <TextInput
          style={[
            styles.input, 
            { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border },
            styles.noteInput,
            noteType === 'code' && { backgroundColor: theme.colors.background, color: theme.colors.primary }
          ]}
          placeholder={noteType === 'code' ? "// Paste your code here..." : "Start typing your thoughts..."}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          autoCapitalize={noteType === 'code' ? "none" : "sentences"}
          autoCorrect={noteType === 'plain'}


        />

        <View style={{ height: 60 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSave} disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator color={theme.colors.textDark} style={{marginRight: 10}} />
              <Text style={[styles.saveBtnText, { color: theme.colors.textDark }]}>{loadingText}</Text>
            </View>
          ) : (
            <Text style={[styles.saveBtnText, { color: theme.colors.textDark }]}>{isEditing ? 'Update Item' : 'Save Item'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20, marginTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 24 },
  
  toggleRow: { flexDirection: 'row', borderRadius: 30, padding: 6, marginBottom: 24, borderWidth: 1 },
  toggleBtn: { flex: 1, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 24 },
  toggleText: { fontWeight: '700', fontSize: 15 },
  
  label: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  
  categorySearchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, marginBottom: 12, height: 48, borderWidth: 1 },
  categorySearchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  
  categoryContainer: { marginBottom: 30 },
  categoryPill: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 24, 
    marginRight: 10, 
    borderWidth: 1, 
    overflow: 'hidden', 
    fontWeight: '600',
    fontSize: 14
  },
  
  input: { 
    borderRadius: 18, 
    padding: 20, 
    fontSize: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  noteInput: { height: 200, textAlignVertical: 'top' },
  
  footer: { padding: 24, borderTopWidth: 1 },
  saveBtn: { paddingVertical: 18, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  saveBtnText: { fontWeight: '800', fontSize: 18 },

  alertRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  alertChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  alertText: { fontSize: 13, fontWeight: '700' },

  reminderRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  reminderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  reminderText: { fontSize: 12, fontWeight: '700' },
});


