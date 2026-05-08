import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Alert } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { chatWithNotes } from '../services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { THEME } from '../styles/theme';

export default function AIChatScreen() {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: "Hi! I'm your Second Brain AI.\n\nAsk me anything about your saved notes, code snippets, or links.", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const SUGGESTIONS = [
    "Summarize my recent notes",
    "What do I have on React Native?",
    "Find my SQL queries"
  ];

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim()) return;
    Keyboard.dismiss();
    const userMessage = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    try {
      const response = await chatWithNotes(userMessage.text, state.items);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: "Sorry, my brain disconnected temporarily. Try again?", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Message copied to clipboard!");
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={THEME.colors.textDark} />
          </View>
        )}
        <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
            {isUser ? (
              <Text style={styles.userText}>{item.text}</Text>
            ) : (
              <Markdown style={markdownStyles}>{item.text}</Markdown>
            )}
            <View style={[styles.messageFooter, isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'space-between' }]}>
              {!isUser && (
                <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={14} color={THEME.colors.textSecondary} />
                  <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.timestamp, isUser && { color: 'rgba(255,255,255,0.6)' }]}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.innerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.glowIconWrapper}>
              <Ionicons name="planet" size={24} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Copilot</Text>
              <Text style={styles.headerSubtitle}>Powered by Gemini Flash</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setMessages([messages[0]])}>
            <Ionicons name="trash-outline" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.flatList}
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.aiAvatarSmall}>
              <Ionicons name="sparkles" size={12} color={THEME.colors.textDark} />
            </View>
            <Text style={styles.typingText}>Thinking through your notes...</Text>
          </View>
        )}

        {messages.length === 1 && !isTyping && (
          <View style={styles.suggestionsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContainer}>
              {SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => handleSend(suggestion)}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── SIMPLIFIED INPUT — no plus or mic ── */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 100) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything from your notes…"
              placeholderTextColor={THEME.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, inputText.trim().length > 0 && styles.sendBtnActive]}
              onPress={() => handleSend(inputText)}
              disabled={isTyping || !inputText.trim()}
            >
              <Ionicons name="arrow-up" size={20} color={inputText.trim() ? THEME.colors.textDark : 'rgba(255,255,255,0.3)'} />
            </TouchableOpacity>
          </View>
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
  code_inline: { backgroundColor: '#1A1D2E', color: THEME.colors.highlight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', overflow: 'hidden' },
  fence: { backgroundColor: '#1A1D2E', color: THEME.colors.primary, padding: 12, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginVertical: 8, overflow: 'hidden' },
  bullet_list: { marginTop: 4, marginBottom: 8 },
  list_item: { marginVertical: 4 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  innerContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: THEME.spacing.lg, paddingBottom: THEME.spacing.md, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  glowIconWrapper: { padding: 10, backgroundColor: 'rgba(215, 230, 90, 0.1)', borderRadius: 16, marginRight: 12 },
  headerTitle: { color: THEME.colors.textPrimary, fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: THEME.colors.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  clearBtn: { padding: 8 },
  flatList: { flex: 1 },
  chatListContent: { padding: THEME.spacing.lg, paddingBottom: 20 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
  userWrapper: { justifyContent: 'flex-end', paddingLeft: 40 },
  aiWrapper: { justifyContent: 'flex-start', paddingRight: 40 },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginBottom: 4 },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  messageBubble: { padding: 16, borderRadius: 24 },
  userBubble: { backgroundColor: '#6366F1', borderBottomRightRadius: 6, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  aiBubble: { backgroundColor: THEME.colors.cardSecondary, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: THEME.colors.border, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  userText: { color: THEME.colors.textPrimary, fontSize: 16, lineHeight: 24 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingRight: 12 },
  copyText: { color: THEME.colors.textSecondary, fontSize: 12, marginLeft: 4, fontWeight: '600' },
  timestamp: { color: THEME.colors.textSecondary, fontSize: 11, fontWeight: '500' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, paddingBottom: 16 },
  typingText: { color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '600' },
  suggestionsWrapper: { maxHeight: 50, marginBottom: 12 },
  suggestionsContainer: { paddingHorizontal: THEME.spacing.lg, alignItems: 'center' },
  suggestionChip: { backgroundColor: THEME.colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: THEME.borderRadius.xl, marginRight: 10, borderWidth: 1, borderColor: THEME.colors.border },
  suggestionText: { color: THEME.colors.primary, fontWeight: '700', fontSize: 14 },
  inputContainer: { paddingHorizontal: THEME.spacing.md, paddingTop: 10, backgroundColor: THEME.colors.background, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: 'rgba(86, 36, 160, 0.6)',
    borderRadius: 28, paddingVertical: 8, paddingHorizontal: 18,
    borderWidth: 1, borderColor: 'rgba(215,230,90,0.2)',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  input: { flex: 1, color: THEME.colors.textPrimary, fontSize: 16, maxHeight: 120, paddingVertical: 8, minHeight: 36 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 2 },
  sendBtnActive: { backgroundColor: THEME.colors.primary, shadowColor: THEME.colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
});
