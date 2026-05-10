import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Platform, Keyboard, Alert, ScrollView, 
  Dimensions, Animated 
} from 'react-native';

import { VaultContext } from '../context/VaultContext';
import { chatWithNotes } from '../services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const SUGGESTED_PROMPTS = [
  { icon: '📄', text: "Summarize" },
  { icon: '💡', text: "Explain" },
  { icon: '🎯', text: "Quiz" }
];

export default function AIChatScreen() {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: "Hi! I'm **SaynIQ**.\n\nI can help you explore your notes and data. What's on your mind?", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  // Manual Keyboard Tracking
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleSend = async (customText) => {
    const text = (typeof customText === 'string' ? customText : inputText).trim();
    if (!text) return;
    const userMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    try {
      const response = await chatWithNotes(text, state.items);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: "I'm having trouble connecting.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        <View style={[styles.messageBubble, { backgroundColor: isUser ? theme.colors.primary : theme.colors.card, borderBottomRightRadius: isUser ? 4 : 20, borderBottomLeftRadius: isUser ? 20 : 4, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
          <Markdown style={{ body: { color: isUser ? theme.colors.textDark : theme.colors.textPrimary, fontSize: 15, lineHeight: 22 }, paragraph: { marginBottom: 0 } }}>
            {item.text}
          </Markdown>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BlurView intensity={20} tint="dark" style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInfo}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>SaynIQ AI</Text>
        </View>
      </BlurView>

      {/* Manual Animated Container */}
      <Animated.View style={{ flex: 1, paddingBottom: keyboardHeight }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.chatList, { paddingBottom: 100 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 85 }]}>
          {messages.length < 3 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <TouchableOpacity key={i} style={[styles.promptChip, { backgroundColor: theme.colors.card }]} onPress={() => handleSend(p.text)}>
                  <Text style={[styles.promptText, { color: theme.colors.textSecondary }]}>{p.icon}  {p.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Message SaynIQ..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: inputText.trim() ? theme.colors.primary : 'rgba(255,255,255,0.05)' }]} onPress={() => handleSend()} disabled={!inputText.trim() || isTyping}>
                <Ionicons name="arrow-up" size={20} color={inputText.trim() ? theme.colors.textDark : 'rgba(255,255,255,0.2)'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800' },
  chatList: { padding: 20 },
  messageWrapper: { marginBottom: 16, flexDirection: 'row' },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20 },
  bottomContainer: { backgroundColor: 'transparent' },
  promptsScroll: { marginBottom: 12 },
  promptChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  promptText: { fontSize: 12, fontWeight: '700' },
  inputContainer: { paddingHorizontal: 20 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 6, paddingVertical: 6, borderWidth: 1 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});
