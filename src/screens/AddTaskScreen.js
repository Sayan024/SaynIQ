import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VaultContext } from '../context/VaultContext';
import { saveTasks } from '../services/taskService';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Work', 'Study', 'Personal', 'Fitness', 'Others'];

export default function AddTaskScreen({ navigation }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('Daily'); // Daily, Weekly

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      totalDuration: 0,
      isRecurring,
      recurringType: isRecurring ? recurringType : null
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    await saveTasks([newTask, ...state.tasks]);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.cardSecondary }]}>
            <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>New Task</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Task Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="Add more details..."
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, category === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: category === cat ? theme.colors.textDark : theme.colors.textSecondary }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Recurring Task</Text>
            <View style={styles.recurringRow}>
              <TouchableOpacity 
                style={[styles.switchBtn, { backgroundColor: isRecurring ? theme.colors.primary : theme.colors.card }]} 
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <Ionicons name={isRecurring ? "repeat" : "stop"} size={20} color={isRecurring ? theme.colors.textDark : theme.colors.textSecondary} />
                <Text style={[styles.switchText, { color: isRecurring ? theme.colors.textDark : theme.colors.textSecondary }]}>{isRecurring ? 'Recurring On' : 'One-time Task'}</Text>
              </TouchableOpacity>
              
              {isRecurring && (
                <View style={styles.chipRow}>
                  {['Daily', 'Weekly'].map(type => (
                    <TouchableOpacity 
                      key={type} 
                      style={[styles.chip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, recurringType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                      onPress={() => setRecurringType(type)}
                    >
                      <Text style={[styles.chipText, { color: recurringType === type ? theme.colors.textDark : theme.colors.textSecondary }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }, !title.trim() && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Text style={[styles.saveBtnText, { color: theme.colors.textDark }]}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  
  input: {
    borderWidth: 1,
    borderRadius: 18,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '800' },

  recurringRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, flex: 1 },
  switchText: { fontSize: 14, fontWeight: '800' },
  
  footer: { padding: 24, borderTopWidth: 1 },
  saveBtn: {
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 18, fontWeight: '800' },
});
