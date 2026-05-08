import os, json
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'screens', 'HomeScreen.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write(r"""import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Image, Linking, Share } from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPasswordsList } from '../services/passwordService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemCard from '../components/ItemCard';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');
const USER_PROFILE_KEY = '@user_profile';
const DAILY_QUOTE_KEY = '@daily_quote';
const TRENDING_CACHE_KEY = '@trending_cache';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 21) return 'Good Evening';
  return 'Good Night';
}

const QUOTES = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Knowledge is power, but organisation is the multiplier.", author: "Unknown" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "AI is the new electricity.", author: "Andrew Ng" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "The function of good software is to make the complex appear simple.", author: "Grady Booch" },
  { text: "Productivity is never an accident. It is always the result of intelligent effort.", author: "John L. Mason" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Growth is never by mere chance; it is the result of forces working together.", author: "James Cash Penney" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Data is the new oil.", author: "Clive Humby" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
];

const ALL_RECS = [
  { id:'r1', title:'How AI Agents Are Reshaping Software Development', source:'dev.to', topic:'AI Agents', readTime:'6 min', preview:'Autonomous agent frameworks like LangGraph, CrewAI, and agentic patterns.', aiReason:'Trending in AI Agents.', url:'https://dev.to', isTrending:true },
  { id:'r2', title:'Microsoft Fabric: Data Engineer\u2019s Guide', source:'techcommunity.microsoft.com', topic:'Microsoft Fabric', readTime:'9 min', preview:'OneLake, Lakehouse, and unified analytics for the modern data stack.', aiReason:'Matches Data Engineering interests.', url:'https://techcommunity.microsoft.com', isTrending:true },
  { id:'r3', title:'LLMs Explained: From Transformers to GPT-4o', source:'towardsdatascience.com', topic:'LLMs', readTime:'11 min', preview:'Attention heads, embeddings, and RLHF fine-tuning explained visually.', aiReason:'Highly trending in AI.', url:'https://towardsdatascience.com', isTrending:true },
  { id:'r4', title:'Python Data Engineering 2025: Tools & Practices', source:'medium.com', topic:'Python', readTime:'8 min', preview:'Polars vs Pandas, DuckDB, and Python-native data tools.', aiReason:'Based on Python notes.', url:'https://medium.com', isTrending:true },
  { id:'r5', title:'React Native Performance Optimization Guide', source:'reactnative.dev', topic:'React Native', readTime:'7 min', preview:'Hermes, Fabric renderer, lazy loading and new architecture.', aiReason:'React Native dev pick.', url:'https://reactnative.dev', isTrending:true },
  { id:'r6', title:'ML Pipelines with MLflow & Kubeflow', source:'mlops.community', topic:'Machine Learning', readTime:'10 min', preview:'End-to-end ML lifecycle and production-grade pipelines.', aiReason:'Trending in MLOps.', url:'https://mlops.community', isTrending:true },
  { id:'r7', title:'Cybersecurity: Zero Trust Architecture in Practice', source:'csoonline.com', topic:'Cybersecurity', readTime:'8 min', preview:'How enterprises implement Zero Trust for developers.', aiReason:'Top cybersecurity topic.', url:'https://csoonline.com', isTrending:true },
  { id:'r8', title:'DevOps 2025: GitOps & Platform Engineering', source:'devops.com', topic:'DevOps', readTime:'7 min', preview:'Platform engineering, developer portals, and CI/CD evolution.', aiReason:'Trending in DevOps.', url:'https://devops.com', isTrending:false },
  { id:'r9', title:'Building RAG Systems: Retrieval-Augmented Generation', source:'langchain.com', topic:'AI', readTime:'9 min', preview:'Vector databases, chunking, and production RAG pipelines.', aiReason:'AI engineering essential.', url:'https://langchain.com', isTrending:true },
  { id:'r10', title:'Data Engineering with dbt & Snowflake', source:'getdbt.com', topic:'Data Engineering', readTime:'8 min', preview:'Transform raw data into analytics-ready datasets with ELT.', aiReason:'Data Engineering trending.', url:'https://getdbt.com', isTrending:false },
];

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

const TOPIC_COLORS = {
  'AI Agents':'#D7E65A','Microsoft Fabric':'#60A5FA','LLMs':'#C084FC','Python':'#34D399',
  'React Native':'#F87171','Machine Learning':'#FBBF24','Cybersecurity':'#FF6B6B',
  'DevOps':'#93C5FD','AI':'#E879F9','Data Engineering':'#4ADE80',
};

export default function HomeScreen({ navigation }) {
  const { state } = useContext(VaultContext);
  const insets = useSafeAreaInsets();
  const [passwordCount, setPasswordCount] = useState(0);
  const [greeting, setGreeting] = useState(getGreeting());
  const [profileName, setProfileName] = useState('Friend');
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [trendingRecs, setTrendingRecs] = useState(ALL_RECS.slice(0, 5));
  const [lastUpdated, setLastUpdated] = useState('');
  const quoteFade = useRef(new Animated.Value(0)).current;
  const [isFabOpen, setIsFabOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    Animated.spring(animation, { toValue, friction: 5, useNativeDriver: true }).start();
    setIsFabOpen(!isFabOpen);
  };

  // Load profile name
  useEffect(() => {
    AsyncStorage.getItem(USER_PROFILE_KEY).then(v => { if (v) setProfileName(v); });
  }, []);

  // Greeting timer - update every minute
  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Re-fetch profile on focus
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(USER_PROFILE_KEY).then(v => { if (v) setProfileName(v); });
    setGreeting(getGreeting());
  }, []));

  // Daily quote logic
  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toDateString();
        const saved = await AsyncStorage.getItem(DAILY_QUOTE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        if (parsed && parsed.date === today) {
          setDailyQuote(QUOTES[parsed.index % QUOTES.length]);
        } else {
          const prevIdx = parsed ? parsed.index : -1;
          let newIdx = (prevIdx + 1) % QUOTES.length;
          await AsyncStorage.setItem(DAILY_QUOTE_KEY, JSON.stringify({ index: newIdx, date: today }));
          setDailyQuote(QUOTES[newIdx]);
        }
      } catch { setDailyQuote(QUOTES[0]); }
      Animated.timing(quoteFade, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    })();
  }, []);

  // Trending auto-refresh (1 hour cache)
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(TRENDING_CACHE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        const now = Date.now();
        if (parsed && (now - parsed.timestamp < 3600000)) {
          const ids = parsed.order;
          const mapped = ids.map(id => ALL_RECS.find(r => r.id === id)).filter(Boolean);
          setTrendingRecs(mapped.length >= 5 ? mapped : ALL_RECS.slice(0, 5));
          const mins = Math.floor((now - parsed.timestamp) / 60000);
          setLastUpdated(mins < 1 ? 'Just now' : `${mins}m ago`);
        } else {
          const shuffled = shuffle(ALL_RECS);
          await AsyncStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify({ order: shuffled.map(r=>r.id), timestamp: now }));
          setTrendingRecs(shuffled);
          setLastUpdated('Just now');
        }
      } catch { setTrendingRecs(ALL_RECS.slice(0, 5)); setLastUpdated(''); }
    })();
  }, []);

  const loadPasswords = async () => { const list = await getPasswordsList(); setPasswordCount(list.length); };
  useFocusEffect(useCallback(() => { loadPasswords(); }, []));

  const notesItems = state.items.filter(i => i.type === 'note');
  const linksItems = state.items.filter(i => i.type === 'link');
  const recentNotes = notesItems.slice(0, 3);
  const recentLinks = linksItems.slice(0, 5);

  const fabRotation = animation.interpolate({ inputRange: [0,1], outputRange: ['0deg','45deg'] });
  const actionItemStyle = (index) => ({
    opacity: animation,
    transform: [
      { translateY: animation.interpolate({ inputRange:[0,1], outputRange:[0,-70*index] }) },
      { scale: animation.interpolate({ inputRange:[0,1], outputRange:[0,1] }) },
    ],
  });

  const shareQuote = async () => {
    try { await Share.share({ message: `"${dailyQuote.text}" — ${dailyQuote.author}` }); } catch {}
  };

  const renderRecCard = (item) => {
    const topicColor = TOPIC_COLORS[item.topic] || THEME.colors.highlight;
    return (
      <TouchableOpacity key={item.id} style={styles.recCard} onPress={() => Linking.openURL(item.url)} activeOpacity={0.88}>
        <View style={styles.recHeaderRow}>
          <Text style={[styles.recTopic, { color: topicColor }]}>{item.topic}</Text>
          {item.isTrending && (
            <View style={styles.trendingBadge}>
              <Ionicons name="trending-up" size={11} color={THEME.colors.textDark} />
              <Text style={styles.trendingText}>Trending</Text>
            </View>
          )}
        </View>
        <Text style={styles.recTitle} numberOfLines={3}>{item.title}</Text>
        <Text style={styles.recPreview} numberOfLines={2}>{item.preview}</Text>
        <View style={styles.recFooter}>
          <View style={styles.recSourceRow}>
            <Ionicons name="globe-outline" size={13} color={THEME.colors.textSecondary} />
            <Text style={styles.recSource}>{item.source}</Text>
          </View>
          <View style={styles.recReadRow}>
            <Ionicons name="time-outline" size={13} color={THEME.colors.textSecondary} />
            <Text style={styles.recReadTime}>{item.readTime}</Text>
          </View>
        </View>
        <View style={styles.recAiBox}>
          <Ionicons name="sparkles" size={13} color={THEME.colors.primary} />
          <Text style={styles.recAiText} numberOfLines={1}>{item.aiReason}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLinkCard = (item) => (
    <TouchableOpacity key={item.id} style={styles.linkCard} onPress={() => Linking.openURL(item.url)} activeOpacity={0.88}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.linkThumbnail} />
      ) : (
        <View style={styles.linkIconFallback}>
          <Ionicons name="link" size={24} color={THEME.colors.highlight} />
        </View>
      )}
      <View style={styles.linkContent}>
        <Text style={styles.linkTitle} numberOfLines={2}>{item.title || item.url}</Text>
        <Text style={styles.linkDomain} numberOfLines={1}>{item.domain || 'External'}</Text>
        <View style={styles.linkFooterRow}>
          <Text style={styles.linkCategory}>{item.category || 'General'}</Text>
          {item.summary && <Ionicons name="sparkles" size={13} color={THEME.colors.primary} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.blob, styles.blobTop]} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HERO HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.headerTitle}>{profileName} """ + r"""&#x1F44B;</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.iconBtn}>
            <Ionicons name="settings-sharp" size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* DAILY QUOTE */}
        <Animated.View style={[styles.heroCard, { opacity: quoteFade }]}>
          <View style={styles.heroTextContainer}>
            <View style={styles.quoteHeaderRow}>
              <Text style={styles.heroLabel}>""" + r"""&#x1F4A1; Quote of the Day</Text>
              <TouchableOpacity onPress={shareQuote} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Ionicons name="share-outline" size={18} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroTitle}>"{dailyQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          </View>
          <Ionicons name="planet" size={48} color={THEME.colors.primary} style={styles.heroIcon} />
        </Animated.View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: THEME.colors.primary }]} onPress={() => navigation.navigate('AI Chat')}>
            <Ionicons name="sparkles" size={18} color={THEME.colors.textDark} />
            <Text style={[styles.actionChipText, { color: THEME.colors.textDark }]}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate('AddItem')}>
            <Ionicons name="add-circle" size={18} color={THEME.colors.primary} />
            <Text style={styles.actionChipText}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate('AddItem', { forceType: 'link' })}>
            <Ionicons name="link" size={18} color={THEME.colors.primary} />
            <Text style={styles.actionChipText}>Save URL</Text>
          </TouchableOpacity>
        </View>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.gridRow}>
          {[
            { icon:'document-text', color:THEME.colors.primary, count:notesItems.length, label:'Notes' },
            { icon:'link', color:THEME.colors.highlight, count:linksItems.length, label:'Links' },
            { icon:'key', color:THEME.colors.warning, count:passwordCount, label:'Passwords' },
            { icon:'flame', color:THEME.colors.danger, count:3, label:'Streak' },
          ].map(({ icon, color, count, label }) => (
            <View key={label} style={styles.gridItem}>
              <View style={[styles.iconWrapper, { backgroundColor: THEME.colors.cardSecondary }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={styles.gridNumber}>{count}</Text>
              <Text style={styles.gridLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* TRENDING */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trending in Tech</Text>
          <View style={styles.trendingMeta}>
            {lastUpdated ? <Text style={styles.lastUpdatedText}>{lastUpdated}</Text> : null}
            <View style={styles.aiChip}>
              <Ionicons name="sparkles" size={13} color={THEME.colors.textDark} />
              <Text style={styles.aiChipText}>AI Picks</Text>
            </View>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
          {trendingRecs.map(renderRecCard)}
        </ScrollView>

        {/* SAVED RESOURCES */}
        <View style={[styles.sectionHeaderRow, { marginTop: THEME.spacing.lg }]}>
          <Text style={styles.sectionTitle}>Saved Resources</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notes')}>
            <Text style={styles.seeAllText}>See all """ + r"""&#x2192;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
          {recentLinks.length > 0 ? (
            recentLinks.map(renderLinkCard)
          ) : (
            <View style={styles.emptyHorizontal}>
              <Ionicons name="bookmark-outline" size={30} color={THEME.colors.textSecondary} />
              <Text style={styles.emptyText}>No links saved yet.</Text>
            </View>
          )}
        </ScrollView>

        {/* RECENT NOTES */}
        <View style={[styles.sectionHeaderRow, { marginTop: THEME.spacing.lg }]}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
        </View>
        {recentNotes.length > 0 ? (
          recentNotes.map(item => <ItemCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={THEME.colors.border} />
            <Text style={styles.emptyText}>No notes yet — start your second brain!</Text>
          </View>
        )}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 90 }]}>
        <Animated.View style={[styles.fabMenuBtn, actionItemStyle(2)]}>
          <Text style={styles.fabSubLabel}>Password</Text>
          <TouchableOpacity onPress={() => { toggleFab(); navigation.navigate('AddPassword'); }} style={styles.fabSubBtn}>
            <Ionicons name="key" size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.fabMenuBtn, actionItemStyle(1)]}>
          <Text style={styles.fabSubLabel}>Note / Link</Text>
          <TouchableOpacity onPress={() => { toggleFab(); navigation.navigate('AddItem'); }} style={styles.fabSubBtn}>
            <Ionicons name="document-text" size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.fabMainBtn} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
            <Ionicons name="add" size={34} color={THEME.colors.textDark} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
""")

print("COMPONENT_DONE")
