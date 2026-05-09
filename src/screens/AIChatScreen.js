import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, Keyboard, 
  Alert, ScrollView, Animated as RNAnimated, Dimensions
} from 'react-native';

import { VaultContext } from '../context/VaultContext';
import { chatWithNotes } from '../services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SUGGESTED_PROMPTS = [
  { icon: '📄', text: "Summarize my notes" },
  { icon: '💡', text: "Explain this topic" },
  { icon: '🎓', text: "Create study plan" },
  { icon: '🎯', text: "Generate interview questions" }
];

export default function AIChatScreen() {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: "Hi! I'm **SaynIQ**.\n\nI can help you explore your notes, tasks, and data. What's on your mind?", timestamp: new Date() }
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
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: "I'm having trouble connecting. Try again later.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View 
        entering={isUser ? FadeInDown.delay(100) : FadeIn.duration(400)}
        style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: `${theme.colors.primary}20`, borderColor: theme.colors.primary }]}>
            <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          { 
            backgroundColor: isUser ? theme.colors.primary : `${theme.colors.card}F0`,
            borderColor: isUser ? theme.colors.primary : theme.colors.border,
            borderBottomRightRadius: isUser ? 4 : 24,
            borderBottomLeftRadius: isUser ? 24 : 4,
          }
        ]}>
          <Markdown style={{ 
            body: { color: isUser ? theme.colors.textDark : theme.colors.textPrimary, fontSize: 15, lineHeight: 22 },
            paragraph: { marginBottom: 0 },
            heading1: { color: isUser ? theme.colors.textDark : theme.colors.primary, fontSize: 18, fontWeight: '800' },
            code_inline: { backgroundColor: isUser ? 'rgba(0,0,0,0.1)' : theme.colors.cardSecondary, color: isUser ? theme.colors.textDark : theme.colors.highlight, paddingHorizontal: 4, borderRadius: 4 }
          }}>
            {item.text}
          </Markdown>
          
          <View style={styles.messageMeta}>
            <Text style={[styles.timestamp, { color: isUser ? 'rgba(0,0,0,0.4)' : theme.colors.textSecondary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {!isUser && (
              <TouchableOpacity onPress={() => copyToClipboard(item.text)} style={styles.miniAction}>
                <Ionicons name="copy-outline" size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.gradientBlob, { backgroundColor: theme.colors.primary }]} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <BlurView intensity={30} tint="dark" style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerInfo}>
            <View style={[styles.headerIcon, { backgroundColor: `${theme.colors.primary}25` }]}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>SaynIQ</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Active Intelligence</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.clearBtn, { backgroundColor: `${theme.colors.card}80` }]} 
            onPress={() => setMessages([messages[0]])}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </BlurView>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.chatList, { paddingBottom: 100 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping && (
            <Animated.View entering={FadeIn} style={styles.typingBox}>
              <View style={[styles.aiAvatar, { backgroundColor: `${theme.colors.primary}10` }]}>
                <Ionicons name="pulse" size={14} color={theme.colors.primary} />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.dotContainer}>
                  <Text style={{ color: theme.colors.primary }}>●</Text>
                  <Text style={{ color: theme.colors.primary, opacity: 0.6 }}>●</Text>
                  <Text style={{ color: theme.colors.primary, opacity: 0.3 }}>●</Text>
                </View>
              </View>
            </Animated.View>
          )}
          ListHeaderComponent={messages.length < 2 && (
            <View style={styles.welcomeContainer}>
              <Ionicons name="planet" size={60} color={theme.colors.primary} style={{ opacity: 0.2, marginBottom: 20 }} />
              <Text style={[styles.welcomeTitle, { color: theme.colors.textPrimary }]}>How can I help you today?</Text>
              <Text style={[styles.welcomeDesc, { color: theme.colors.textSecondary }]}>
                I can summarize your notes, help you study, or find specific information in your vault.
              </Text>
            </View>
          )}
        />

        {/* Input Area */}
        <BlurView intensity={40} tint="dark" style={[styles.inputWrapper, { paddingBottom: keyboardVisible ? 20 : insets.bottom + 80 }]}>
          {!keyboardVisible && messages.length < 3 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.promptChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => handleSend(p.text)}
                >
                  <Text style={styles.promptIcon}>{p.icon}</Text>
                  <Text style={[styles.promptText, { color: theme.colors.textPrimary }]}>{p.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={[styles.inputBox, { backgroundColor: `${theme.colors.card}F0`, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Message SaynIQ..."
              placeholderTextColor={theme.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                { backgroundColor: inputText.trim() ? theme.colors.primary : 'transparent' }
              ]} 
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons 
                name="arrow-up" 
                size={22} 
                color={inputText.trim() ? theme.colors.textDark : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  gradientBlob: { 
    position: 'absolute', width: width * 1.5, height: width * 1.5, 
    borderRadius: width, opacity: 0.05, top: -width * 0.5, left: -width * 0.5 
  },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, zIndex: 10
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  subtitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  clearBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  chatList: { padding: 16 },
  messageWrapper: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },

  aiAvatar: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  messageBubble: { maxWidth: '82%', padding: 16, borderRadius: 24, borderWidth: 1 },
  messageMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, opacity: 0.6 },
  miniAction: { padding: 4 },
  timestamp: { fontSize: 10, fontWeight: '600' },

  typingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  typingBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1 },
  dotContainer: { flexDirection: 'row', gap: 4 },

  welcomeContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  welcomeDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, opacity: 0.8 },

  inputWrapper: { paddingHorizontal: 16, paddingTop: 10 },
  promptsScroll: { marginBottom: 15 },
  promptChip: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, 
    paddingVertical: 10, borderRadius: 16, borderWidth: 1, gap: 8 
  },
  promptIcon: { fontSize: 14 },
  promptText: { fontSize: 13, fontWeight: '700' },

  inputBox: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 30, 
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

