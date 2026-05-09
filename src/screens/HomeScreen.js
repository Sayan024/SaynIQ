import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Animated, Dimensions, Image, Linking, Share, RefreshControl,
  ActivityIndicator, Modal
} from 'react-native';

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

// Time-based greeting logic
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
  { id:'r2', title:'Microsoft Fabric: Data Engineer’s Guide', source:'techcommunity.microsoft.com', topic:'Microsoft Fabric', readTime:'9 min', preview:'OneLake, Lakehouse, and unified analytics for the modern data stack.', aiReason:'Matches Data Engineering interests.', url:'https://techcommunity.microsoft.com', isTrending:true },
  { id:'r3', title:'LLMs Explained: From Transformers to GPT-4o', source:'towardsdatascience.com', topic:'LLMs', readTime:'11 min', preview:'Attention heads, embeddings, and RLHF fine-tuning explained visually.', aiReason:'Highly trending in AI.', url:'https://towardsdatascience.com', isTrending:true },
  { id:'r4', title:'Python Data Engineering 2025: Tools & Practices', source:'medium.com', topic:'Python', readTime:'8 min', preview:'Polars vs Pandas, DuckDB, and Python-native data tools.', aiReason:'Based on Python notes.', url:'https://medium.com', isTrending:true },
  { id:'r5', title:'React Native Performance Optimization Guide', source:'reactnative.dev', topic:'React Native', readTime:'7 min', preview:'Hermes, Fabric renderer, lazy loading and new architecture.', aiReason:'React Native dev pick.', url:'https://reactnative.dev', isTrending:true },
  { id:'r6', title:'ML Pipelines with MLflow & Kubeflow', source:'mlops.community', topic:'Machine Learning', readTime:'10 min', preview:'End-to-end ML lifecycle and production-grade pipelines.', aiReason:'Trending in MLOps.', url:'https://mlops.community', isTrending:true },
  { id:'r7', title:'Cybersecurity: Zero Trust Architecture in Practice', source:'csoonline.com', topic:'Cybersecurity', readTime:'8 min', preview:'How enterprises implement Zero Trust for developers.', aiReason:'Top cybersecurity topic.', url:'https://csoonline.com', isTrending:true },
  { id:'r8', title:'DevOps 2025: GitOps & Platform Engineering', source:'devops.com', topic:'DevOps', readTime:'7 min', preview:'Platform engineering, developer portals, and CI/CD evolution.', aiReason:'Trending in DevOps.', url:'https://devops.com', isTrending:false },
  { id:'r9', title:'Building RAG Systems: Retrieval-Augmented Generation', source:'langchain.com', topic:'AI', readTime:'9 min', preview:'Vector databases, chunking, and production RAG pipelines.', aiReason:'AI engineering essential.', url:'https://langchain.com', isTrending:true },
  { id:'r10', title:'Data Engineering with dbt & Snowflake', source:'getdbt.com', topic:'Data Engineering', readTime:'8 min', preview:'Transform raw data into analytics-ready datasets with ELT.', aiReason:'Data Engineering trending.', url:'https://getdbt.com', isTrending:false },
];

const TOPIC_COLORS = {
  'AI Agents':'#D7E65A','Microsoft Fabric':'#60A5FA','LLMs':'#C084FC','Python':'#34D399',
  'React Native':'#F87171','Machine Learning':'#FBBF24','Cybersecurity':'#FF6B6B',
  'DevOps':'#93C5FD','AI':'#E879F9','Data Engineering':'#4ADE80',
};

function shuffle(arr) { 
  const a=[...arr]; 
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  } 
  return a; 
}

export default function HomeScreen({ navigation }) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [passwordCount, setPasswordCount] = useState(0);
  const [greeting, setGreeting] = useState(getGreeting());
  const [profileName, setProfileName] = useState('User'); // Default fallback

  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [trendingRecs, setTrendingRecs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  const quoteFade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;


  // Load profile name and initial greeting
  const loadProfile = async () => {
    try {
      const name = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (name) setProfileName(name);
      setGreeting(getGreeting());
    } catch (e) {
      console.log('Profile load error', e);
    }
  };

  // Re-fetch profile on focus to ensure dynamic updates
  useFocusEffect(useCallback(() => {
    loadProfile();
    loadPasswords();
    checkDailyQuote();
    checkTrendingFeed();
  }, []));

  // Greeting timer - update every 30 seconds to ensure accuracy
  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Daily quote logic - Change every 24 hours
  const checkDailyQuote = async () => {
    try {
      const today = new Date().toDateString();
      const saved = await AsyncStorage.getItem(DAILY_QUOTE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      
      if (parsed && parsed.date === today) {
        setDailyQuote(QUOTES[parsed.index % QUOTES.length]);
      } else {
        const prevIdx = parsed ? parsed.index : -1;
        let newIdx;
        do {
          newIdx = Math.floor(Math.random() * QUOTES.length);
        } while (newIdx === prevIdx && QUOTES.length > 1);
        
        await AsyncStorage.setItem(DAILY_QUOTE_KEY, JSON.stringify({ index: newIdx, date: today }));
        setDailyQuote(QUOTES[newIdx]);
      }
      
      Animated.parallel([
        Animated.timing(quoteFade, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ]).start();
    } catch { 
      setDailyQuote(QUOTES[0]); 
    }
  };

  // Trending auto-refresh (1 hour cache)
  const checkTrendingFeed = async (force = false) => {
    try {
      const [saved, savedInterests] = await Promise.all([
        AsyncStorage.getItem(TRENDING_CACHE_KEY),
        AsyncStorage.getItem('@user_interests')
      ]);
      
      const parsed = saved ? JSON.parse(saved) : null;
      const userInterests = savedInterests ? JSON.parse(savedInterests) : [];
      const now = Date.now();
      const ONE_HOUR = 3600000;

      let sourceList = ALL_RECS;
      if (userInterests.length > 0) {
        const filtered = ALL_RECS.filter(r => 
          userInterests.some(interest => r.topic.includes(interest) || r.topic === interest)
        );
        if (filtered.length > 0) sourceList = filtered;
      }


      if (!force && parsed && (now - parsed.timestamp < ONE_HOUR)) {
        const ids = parsed.order;
        const mapped = ids.map(id => sourceList.find(r => r.id === id)).filter(Boolean);
        setTrendingRecs(mapped.length > 0 ? mapped : sourceList.slice(0, 5));
        
        const mins = Math.floor((now - parsed.timestamp) / 60000);
        setLastUpdated(mins < 1 ? 'Just now' : `${mins}m ago`);
      } else {
        const shuffled = shuffle(sourceList);
        await AsyncStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify({ 
          order: shuffled.map(r=>r.id), 
          timestamp: now 
        }));
        setTrendingRecs(shuffled);
        setLastUpdated('Updated now');
      }
    } catch (e) { 
      setTrendingRecs(ALL_RECS.slice(0, 5)); 
      setLastUpdated('Live');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadProfile(),
      checkTrendingFeed(true),
      loadPasswords()
    ]);
    setRefreshing(false);
  }, []);

  const loadPasswords = async () => { 
    const list = await getPasswordsList(); 
    setPasswordCount(list.length); 
  };

  const handleOpenLink = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback for malformed URLs
        const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
        await Linking.openURL(fixedUrl);
      }
    } catch (error) {
      Alert.alert("Link Error", "Could not open this URL. It might be invalid.");
    }
  };

  const shareQuote = async (platform) => {
    const text = `"${dailyQuote.text}" — ${dailyQuote.author}\n\nShared via SaynIQ: Your AI Second Brain`;
    const encodedText = encodeURIComponent(text);
    setShareModalVisible(false);

    try {
      if (platform === 'whatsapp') {
        await Linking.openURL(`whatsapp://send?text=${encodedText}`);
      } else if (platform === 'instagram') {
        // Instagram doesn't support direct text sharing to stories via deep link without media.
        // We fallback to native share but with a specialized message.
        await Share.share({ message: text });
      } else if (platform === 'facebook') {
        await Share.share({ message: text });
      } else {
        await Share.share({ message: text });
      }
    } catch (e) {
      // Fallback if app is not installed
      await Share.share({ message: text });
    }
  };


  const renderShareModal = () => (
    <Modal
      visible={shareModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setShareModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShareModalVisible(false)}
      >
        <View style={[styles.shareModal, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Share Inspiration</Text>
          <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Spread the wisdom with your network</Text>
          
          <View style={styles.shareOptions}>
            {[
              { id: 'whatsapp', label: 'WhatsApp Status', icon: 'logo-whatsapp', color: '#25D366' },
              { id: 'instagram', label: 'Instagram Stories', icon: 'logo-instagram', color: '#E1306C' },
              { id: 'facebook', label: 'Facebook Post', icon: 'logo-facebook', color: '#1877F2' },
              { id: 'native', label: 'More Options', icon: 'share-social', color: theme.colors.primary },
            ].map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.shareBtn, { backgroundColor: theme.colors.cardSecondary }]}
                onPress={() => shareQuote(item.id)}
              >
                <View style={[styles.shareIconBox, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={[styles.shareLabel, { color: theme.colors.textPrimary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );


  const getTimeRemaining = (dateString) => {
    const diff = new Date(dateString) - new Date();
    if (diff <= 0) return 'Due now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Soon';
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const renderAlertSection = () => {
    const alerts = state.items.filter(item => item.alertType || item.reminderDate).slice(0, 5);
    if (alerts.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Upcoming Reminders</Text>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alertScroll}>
          {alerts.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.alertCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('Notes', { scrollToId: item.id })}
            >
              <View style={[styles.alertIconBox, { backgroundColor: theme.colors.cardSecondary }]}>
                <Ionicons 
                  name={item.alertType === 'Watch Important' ? 'logo-youtube' : (item.alertType === 'Read Later' ? 'book' : 'notifications')} 
                  size={18} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertCardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.alertMeta}>
                  <Text style={[styles.alertBadgeText, { color: theme.colors.primary }]}>{item.alertType || 'Reminder'}</Text>
                  {item.reminderDate && (
                    <Text style={[styles.alertTime, { color: theme.colors.highlight }]}>
                      • {getTimeRemaining(item.reminderDate)}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Notes', { scrollToId: item.id })} style={styles.quickOpenBtn}>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };


  const renderRecCard = (item) => {

    const topicColor = TOPIC_COLORS[item.topic] || theme.colors.highlight;
    return (
      <TouchableOpacity key={item.id} style={[styles.recCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => handleOpenLink(item.url)} activeOpacity={0.8}>

        <View style={styles.recHeaderRow}>
          <Text style={[styles.recTopic, { color: topicColor }]}>{item.topic}</Text>
          {item.isTrending && (
            <View style={[styles.trendingBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="trending-up" size={11} color={theme.colors.textDark} />
              <Text style={[styles.trendingText, { color: theme.colors.textDark }]}>Trending</Text>
            </View>
          )}
        </View>
        <Text style={[styles.recTitle, { color: theme.colors.textPrimary }]} numberOfLines={3}>{item.title}</Text>
        <Text style={[styles.recPreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>{item.preview}</Text>
        <View style={styles.recFooter}>
          <View style={styles.recSourceRow}>
            <Ionicons name="globe-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={[styles.recSource, { color: theme.colors.textSecondary }]}>{item.source}</Text>
          </View>
          <View style={styles.recReadRow}>
            <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={[styles.recReadTime, { color: theme.colors.textSecondary }]}>{item.readTime}</Text>
          </View>
        </View>
        <View style={[styles.recAiBox, { backgroundColor: `${theme.colors.primary}10` }]}>
          <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
          <Text style={[styles.recAiText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.aiReason}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const notesItems = (state.items || []).filter(i => i.type === 'note');
  const linksItems = (state.items || []).filter(i => i.type === 'link');
  const recentNotes = notesItems.slice(0, 3);


  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {renderShareModal()}
      <View style={[styles.blob, { backgroundColor: theme.colors.primary }]} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >

        {/* HERO HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>{greeting},</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{profileName} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('About')} style={[styles.iconBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="person-circle-outline" size={26} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* PREMIUM DAILY QUOTE */}
        <Animated.View style={[styles.heroCard, { opacity: quoteFade, transform: [{ translateY: slideAnim }], backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.heroTextContainer}>
            <View style={styles.quoteHeaderRow}>
              <Text style={[styles.heroLabel, { color: theme.colors.primary }]}>💡 Daily Inspiration</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(true)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>"{dailyQuote.text}"</Text>
            <View style={styles.quoteAuthorRow}>
              <View style={[styles.authorLine, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>{dailyQuote.author}</Text>
            </View>
          </View>
          <View style={styles.heroIconWrapper}>
             <Ionicons name="planet" size={54} color={theme.colors.primary} />
          </View>
        </Animated.View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('SaynIQ')}>
            <Ionicons name="sparkles" size={18} color={theme.colors.textDark} />
            <Text style={[styles.actionChipText, { color: theme.colors.textDark }]}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => navigation.navigate('AddItem')}>
            <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionChipText, { color: theme.colors.textPrimary }]}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => navigation.navigate('AddLink')}>
            <Ionicons name="link" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionChipText, { color: theme.colors.textPrimary }]}>Save URL</Text>
          </TouchableOpacity>
        </View>
        
        {renderAlertSection()}


        {/* OVERVIEW GRID */}

        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Overview</Text>
        <View style={styles.gridRow}>
          {[
            { icon:'document-text', color:theme.colors.primary, count:notesItems.length, label:'Notes' },
            { icon:'link', color:theme.colors.highlight, count:linksItems.length, label:'Links' },
            { icon:'key', color:theme.colors.warning, count:passwordCount, label:'Vault' },
            { icon:'flame', color:theme.colors.danger, count:state.appStreak, label:'Streak' },

          ].map(({ icon, color, count, label }) => (
            <View key={label} style={[styles.gridItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={[styles.gridNumber, { color: theme.colors.textPrimary }]}>{count}</Text>
              <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* TRENDING SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Trending Tech</Text>
            {lastUpdated ? <Text style={[styles.lastUpdatedText, { color: theme.colors.textSecondary }]}>Refresh: {lastUpdated}</Text> : null}
          </View>
          <View style={[styles.aiChip, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="flash" size={12} color={theme.colors.textDark} />
            <Text style={[styles.aiChipText, { color: theme.colors.textDark }]}>Live Feed</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
          {trendingRecs.length > 0 ? trendingRecs.map(renderRecCard) : <ActivityIndicator color={theme.colors.primary} style={{ marginLeft: 20 }} />}
        </ScrollView>

        {/* RECENT ACTIVITY */}
        <View style={[styles.sectionHeaderRow, { marginTop: 32 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Recent Notes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notes')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See all →</Text>
          </TouchableOpacity>
        </View>
        
        {recentNotes.length > 0 ? (
          recentNotes.map(item => <ItemCard key={item.id} item={item} />)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="document-text-outline" size={40} color={theme.colors.border} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Your second brain is waiting for its first note.</Text>
          </View>
        )}
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  blob:         { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: 9999, opacity: 0.1, top: -width * 0.6, right: -width * 0.3 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 },
  greeting:     { fontSize: 15, fontWeight: '600' },
  headerTitle:  { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  iconBtn:      { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  heroCard: {
    borderRadius: 28, padding: 24, marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10,
    borderWidth: 1, overflow: 'hidden',
  },
  heroTextContainer: { flex: 1, paddingRight: 10 },
  quoteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heroLabel:   { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  heroTitle:   { fontSize: 18, fontWeight: '800', lineHeight: 26, marginBottom: 12, fontStyle: 'italic' },
  quoteAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorLine: { width: 15, height: 2, opacity: 0.6 },
  quoteAuthor: { fontSize: 14, fontWeight: '700' },
  heroIconWrapper: { opacity: 0.8, transform: [{ rotate: '15deg' }] },

  quickActionsRow: { flexDirection: 'row', marginBottom: 32, gap: 10 },
  actionChip:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, gap: 6, borderWidth: 1 },
  actionChipText: { fontWeight: '800', fontSize: 13 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  seeAllText:   { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  lastUpdatedText: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  aiChip:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  aiChipText:   { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 10 },
  gridItem: {
    flex: 1, alignItems: 'center',
    paddingVertical: 24, borderRadius: 24,
    borderWidth: 1,
  },
  iconWrapper:  { padding: 10, borderRadius: 16, marginBottom: 10 },
  gridNumber:   { fontSize: 22, fontWeight: '900' },
  gridLabel:    { fontSize: 11, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  hScrollContent: { paddingBottom: 10, paddingRight: 20 },

  recCard: {
    width: 280, borderRadius: 24, marginRight: 16, padding: 20, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
  recHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recTopic:      { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  trendingText:  { fontSize: 10, fontWeight: '900' },
  recTitle:      { fontSize: 16, fontWeight: '800', lineHeight: 24, marginBottom: 10 },
  recPreview:    { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  recFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, opacity: 0.8 },
  recSourceRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recSource:     { fontSize: 12, fontWeight: '700' },
  recReadRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recReadTime:   { fontSize: 12, fontWeight: '700' },
  recAiBox:      { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 8 },
  recAiText:     { fontSize: 12, fontWeight: '600', lineHeight: 18, flex: 1 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  shareModal: {
    padding: 32, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderBottomWidth: 0,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 24, opacity: 0.5,
  },
  modalTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32 },
  shareOptions: { gap: 12 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 16,
  },
  shareIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shareLabel: { fontSize: 16, fontWeight: '700' },

  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  alertScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 10 },
  alertCard: { 
    width: 240, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertCardTitle: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  alertTime: { fontSize: 10, fontWeight: '800' },
  quickOpenBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
});





