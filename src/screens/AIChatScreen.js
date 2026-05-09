import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, Keyboard, 
  Alert, ScrollView 
} from 'react-native';

import { VaultContext } from '../context/VaultContext';
import { chatWithNotes } from '../services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';

const SUGGESTED_PROMPTS = [
  "Summarize my notes",
  "Explain this topic",
  "Create study plan",
  "What should I learn next?",
  "Generate interview questions"
];

export default function AIChatScreen() {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: "Hi! I'm SaynIQ.\n\nI can help you explore your notes, tasks, and data. What's on your mind?", timestamp: new Date() }

  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const TAB_BAR_HEIGHT = 100;

  const handleSend = async (customText) => {
    const text = (typeof customText === 'string' ? customText : inputText).trim();
    if (!text) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();
    
    try {
      const response = await chatWithNotes(text, state.items);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: "I'm having trouble connecting. Try again later.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border }]}>
            <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, { backgroundColor: isUser ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border }]}>
          <Markdown style={{ 
            body: { color: isUser ? theme.colors.textDark : theme.colors.textPrimary, fontSize: 15, lineHeight: 22 },
            paragraph: { marginBottom: 0 }
          }}>
            {item.text}
          </Markdown>
          <View style={[styles.messageFooter, { borderTopColor: isUser ? 'rgba(0,0,0,0.1)' : theme.colors.border }]}>
            {!isUser && (
              <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.copyText, { color: theme.colors.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.timestamp, { color: isUser ? 'rgba(0,0,0,0.5)' : theme.colors.textSecondary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerInfo}>
            <View style={[styles.headerIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>SaynIQ</Text>

              <Text style={[styles.subtitle, { color: theme.colors.primary }]}>Active Intelligence</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.clearBtn, { backgroundColor: theme.colors.cardSecondary }]} 
            onPress={() => setMessages([messages[0]])}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.chatList, { paddingBottom: 20 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping && (
            <View style={styles.typingBox}>
              <View style={[styles.aiAvatar, { backgroundColor: theme.colors.cardSecondary }]}>
                <Ionicons name="pulse" size={14} color={theme.colors.primary} />
              </View>
              <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>AI is thinking...</Text>
            </View>
          )}
        />

        {/* Suggested Prompts */}
        {!keyboardVisible && messages.length < 3 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.promptsContainer}
          >
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.promptChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => handleSend(prompt)}
              >
                <Text style={[styles.promptText, { color: theme.colors.textPrimary }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={[styles.inputContainer, { paddingBottom: keyboardVisible ? 20 : insets.bottom + TAB_BAR_HEIGHT }]}>
          <View style={[styles.inputBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Ask anything..."
              placeholderTextColor={theme.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.cardSecondary }]} 
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons name="arrow-up" size={20} color={inputText.trim() ? theme.colors.textDark : theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  clearBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },

  chatList: { padding: 20 },
  messageWrapper: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },

  aiAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, borderWidth: 1 },
  messageFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyText: { fontSize: 10, fontWeight: '700' },
  timestamp: { fontSize: 9, fontWeight: '600' },

  typingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  typingText: { fontSize: 13, fontStyle: 'italic', fontWeight: '600' },

  promptsContainer: { paddingHorizontal: 20, paddingBottom: 15, gap: 8 },
  promptChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  promptText: { fontSize: 11, fontWeight: '600' },



  inputContainer: { paddingHorizontal: 20, paddingTop: 10 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 25, 
    paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1 
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});

