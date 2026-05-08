import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { chatWithNotes } from '../services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { THEME } from '../styles/theme';

export default function AIChatScreen() {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: "Hi! I'm your Second Brain AI.\n\nAsk me anything about your saved notes, code snippets, or links." }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  // Prompt suggestions
  const SUGGESTIONS = [
    "Summarize my recent notes",
    "What do I have on React Native?",
    "Find my SQL queries"
  ];

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim()) return;
    
    Keyboard.dismiss();

    const userMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await chatWithNotes(userMessage.text, state.items);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: "Sorry, my brain disconnected temporarily. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View entering={FadeInUp.duration(300)} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={THEME.colors.textDark} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {isUser ? (
            <Text style={styles.userText}>{item.text}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.text}</Markdown>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTitleRow}>
          <View style={styles.glowIconWrapper}>
            <Ionicons name="planet" size={24} color={THEME.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Copilot</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setMessages([messages[0]])}>
          <Ionicons name="trash-outline" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {isTyping && (
        <Animated.View entering={FadeIn} style={styles.typingIndicator}>
          <View style={styles.aiAvatarSmall}>
            <Ionicons name="sparkles" size={12} color={THEME.colors.textDark} />
          </View>
          <Text style={styles.typingText}>Thinking through your notes...</Text>
        </Animated.View>
      )}

      {messages.length === 1 && !isTyping && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll} contentContainerStyle={styles.suggestionsContainer}>
          {SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => handleSend(suggestion)}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle" size={26} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask about your notes..."
            placeholderTextColor={THEME.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]} 
            onPress={() => handleSend(inputText)} 
            disabled={isTyping || !inputText.trim()}
          >
            <Ionicons name="arrow-up" size={20} color={inputText.trim() ? THEME.colors.textDark : THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: THEME.colors.textPrimary, fontSize: 16, lineHeight: 24 },
  paragraph: { marginBottom: 8 },
  heading1: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.primary, marginTop: 10, marginBottom: 5 },
  heading2: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.primary, marginTop: 8, marginBottom: 4 },
  code_inline: { backgroundColor: THEME.colors.background, color: THEME.colors.highlight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', overflow: 'hidden' },
  bullet_list: { marginTop: 4, marginBottom: 8 },
  list_item: { marginVertical: 2 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: THEME.spacing.lg, paddingBottom: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  glowIconWrapper: { padding: 8, backgroundColor: THEME.colors.cardSecondary, borderRadius: 16, marginRight: 12 },
  headerTitle: { color: THEME.colors.textPrimary, fontSize: 24, fontWeight: '800' },
  clearBtn: { padding: 8 },
  
  chatList: { padding: THEME.spacing.lg, paddingBottom: 20 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 4 },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  
  messageBubble: { maxWidth: '80%', padding: 16, borderRadius: THEME.borderRadius.xl },
  userBubble: { backgroundColor: THEME.colors.cardSecondary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: THEME.colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  
  userText: { color: THEME.colors.textPrimary, fontSize: 16, lineHeight: 24 },
  
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, paddingBottom: 20 },
  typingText: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '600' },
  
  suggestionsScroll: { maxHeight: 50, marginBottom: 10 },
  suggestionsContainer: { paddingHorizontal: THEME.spacing.lg, alignItems: 'center' },
  suggestionChip: { backgroundColor: THEME.colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: THEME.borderRadius.xl, marginRight: 10, borderWidth: 1, borderColor: THEME.colors.border },
  suggestionText: { color: THEME.colors.primary, fontWeight: '700', fontSize: 14 },
  
  inputContainer: { paddingHorizontal: THEME.spacing.md, paddingTop: 10, backgroundColor: THEME.colors.background, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.xl, padding: 6, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  attachBtn: { padding: 10 },
  input: { flex: 1, color: THEME.colors.textPrimary, fontSize: 16, maxHeight: 120, paddingVertical: 12, paddingHorizontal: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnActive: { backgroundColor: THEME.colors.primary, shadowColor: THEME.colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }
});
