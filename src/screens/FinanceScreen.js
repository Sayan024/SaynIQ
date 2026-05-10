import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, Alert, Modal, TextInput, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Rect, Path } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, useSharedValue, withSpring, 
  FadeIn, FadeInDown, Layout 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { VaultContext } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CATEGORIES = [
  { id: 'Food', label: '🍔 Food', color: '#FF6B6B' },
  { id: 'Transport', label: '🚗 Travel', color: '#4ADE80' },
  { id: 'Shopping', label: '🛍️ Shop', color: '#7C3AED' },
  { id: 'Rent', label: '🏠 Rent', color: '#FACC15' },
  { id: 'Bills', label: '⚡ Bills', color: '#FB923C' },
  { id: 'Health', label: '🏥 Health', color: '#2DD4BF' },
  { id: 'Other', label: '📦 Other', color: '#A099B0' },
];

const FinanceScreen = () => {
  const { state, dispatch } = React.useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();

  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [formData, setFormData] = useState({
    merchant: '', amount: '', type: 'Expense', category: 'Food', date: new Date(), isRecurring: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const progress = useSharedValue(0);

  // 1. Advanced Calculations
  const stats = useMemo(() => {
    const expenses = state.transactions.filter(t => t.type === 'Expense');
    const income = state.transactions.filter(t => t.type === 'Income');
    const totalExp = expenses.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalInc = income.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Trend Data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    const trendData = last7Days.map(date => ({
      date, 
      amount: expenses.filter(t => t.date.startsWith(date)).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
    }));

    // Category Distribution Data
    const catData = CATEGORIES.map(cat => {
      const amount = expenses.filter(t => t.category === cat.id).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      return { ...cat, amount, percent: totalExp > 0 ? (amount / totalExp) : 0 };
    }).filter(c => c.amount > 0);

    return {
      totalExp, totalInc, balance: totalInc - totalExp,
      trendData, catData,
      maxDayAmount: Math.max(...trendData.map(d => d.amount), 1),
      budgetLimit: 50000,
      budgetProgress: Math.min(totalExp / 50000, 1)
    };
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || t.type === filterType;
      return matchesSearch && matchesType;
    }).slice().reverse();
  }, [state.transactions, searchQuery, filterType]);

  useEffect(() => {
    progress.value = withSpring(stats.totalInc > 0 ? stats.totalExp / (stats.totalInc || stats.totalExp || 1) : 0, { damping: 15 });
  }, [stats.totalExp, stats.totalInc]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - progress.value) * (2 * Math.PI * 95),
  }));

  const handleAdd = () => {
    if (!formData.merchant || !formData.amount) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: 'ADD_TRANSACTION', payload: { ...formData, id: Date.now(), amount: parseFloat(formData.amount), date: formData.date.toISOString() } });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const renderSwipeActions = (id) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(id)}>
      <Ionicons name="trash" size={24} color="#FFF" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient colors={['rgba(124, 58, 237, 0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
        <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[4]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}>
          
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Finance Hub</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700' }}>Smart Insights & Tracking</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsAdding(true); }}>
              <Ionicons name="add" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.balanceCircle}>
              <Svg width={220} height={220}>
                <G rotation="-90" origin="110, 110">
                  <Circle cx="110" cy="110" r="95" stroke="rgba(255,255,255,0.05)" strokeWidth="15" fill="transparent" />
                  <AnimatedCircle cx="110" cy="110" r="95" stroke="#7C3AED" strokeWidth="15" strokeDasharray={`${2 * Math.PI * 95}`} animatedProps={animatedProps} strokeLinecap="round" fill="transparent" />
                </G>
              </Svg>
              <View style={styles.balanceTextContainer}>
                <Text style={[styles.balanceValue, { color: theme.colors.textPrimary }]}>₹{stats.balance.toLocaleString()}</Text>
                <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Available Balance</Text>
              </View>
            </View>
            <View style={styles.budgetContainer}>
               <View style={styles.budgetInfo}><Text style={styles.budgetLabel}>Monthly Budget</Text><Text style={styles.budgetValue}>₹{stats.totalExp.toLocaleString()} / ₹{stats.budgetLimit.toLocaleString()}</Text></View>
               <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${stats.budgetProgress * 100}%`, backgroundColor: stats.budgetProgress > 0.8 ? '#FF6B6B' : '#7C3AED' }]} /></View>
            </View>
          </View>

          {/* Spending Trends Bar Chart */}
          <View style={styles.trendSection}>
             <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 20 }]}>Weekly Trends</Text>
             <View style={styles.barChart}>
                {stats.trendData.map((day, idx) => (
                  <View key={idx} style={styles.barCol}>
                    <View style={styles.barTrack}><View style={[styles.barFill, { height: `${(day.amount / stats.maxDayAmount) * 100}%` }]} /></View>
                    <Text style={styles.barLabel}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}</Text>
                  </View>
                ))}
             </View>
          </View>

          {/* Category Distribution Donut */}
          {stats.catData.length > 0 && (
            <View style={styles.catDistributionSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 20 }]}>Top Categories</Text>
              <View style={styles.donutRow}>
                <View style={styles.donutContainer}>
                   <Svg width={120} height={120}>
                     <G rotation="-90" origin="60, 60">
                       <Circle cx="60" cy="60" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                       {stats.catData.map((cat, i) => {
                         let offset = stats.catData.slice(0, i).reduce((sum, c) => sum + c.percent, 0);
                         return (
                           <Circle key={cat.id} cx="60" cy="60" r="45" stroke={cat.color} strokeWidth="12" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={(1 - cat.percent) * (2 * Math.PI * 45)} rotation={offset * 360} origin="60, 60" strokeLinecap="round" fill="transparent" />
                         );
                       })}
                     </G>
                   </Svg>
                </View>
                <View style={styles.catLegend}>
                   {stats.catData.slice(0, 4).map(cat => (
                     <View key={cat.id} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.legendLabel} numberOfLines={1}>{cat.label}</Text>
                        <Text style={styles.legendValue}>{Math.round(cat.percent * 100)}%</Text>
                     </View>
                   ))}
                </View>
              </View>
            </View>
          )}

          <View style={[styles.stickyContainer, { backgroundColor: theme.colors.background + 'EE' }]}>
             <View style={styles.searchBar}><Ionicons name="search" size={18} color="#A099B0" /><TextInput style={styles.searchInput} placeholder="Search records..." placeholderTextColor="#555" value={searchQuery} onChangeText={setSearchQuery} /></View>
             <View style={styles.filterPills}>
                {['All', 'Income', 'Expense'].map(type => (
                  <TouchableOpacity key={type} style={[styles.pill, filterType === type && styles.activePill]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterType(type); }}>
                    <Text style={[styles.pillText, filterType === type && styles.activePillText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          </View>

          <View style={styles.listContainer}>
            {filteredTransactions.map((item) => (
              <Swipeable key={item.id} renderRightActions={() => renderSwipeActions(item.id)}>
                <Animated.View layout={Layout.springify()} entering={FadeInDown} style={[styles.txItem, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.txIcon, { backgroundColor: CATEGORIES.find(c => c.id === item.category)?.color + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{CATEGORIES.find(c => c.id === item.category)?.label.split(' ')[0] || '📦'}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txMerchant, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.merchant}</Text>
                    <Text style={[styles.txDate, { color: theme.colors.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: item.type === 'Expense' ? '#FF6B6B' : '#4ADE80' }]}>
                    {item.type === 'Expense' ? '-' : '+'}₹{(item.amount || 0).toLocaleString()}
                  </Text>
                </Animated.View>
              </Swipeable>
            ))}
          </View>
        </ScrollView>

        <Modal visible={isAdding} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#1A1625' }]}>
              <Text style={styles.modalTitle}>Quick Entry</Text>
              <TextInput style={styles.input} placeholder="Merchant" placeholderTextColor="#555" value={formData.merchant} onChangeText={(t) => setFormData({...formData, merchant: t})} />
              <TextInput style={styles.input} placeholder="Amount (₹)" placeholderTextColor="#555" value={formData.amount} keyboardType="numeric" onChangeText={(t) => setFormData({...formData, amount: t})} />
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id} style={[styles.chip, formData.category === cat.id && { backgroundColor: '#7C3AED' }]} onPress={() => setFormData({...formData, category: cat.id})}><Text style={[styles.chipText, formData.category === cat.id && { color: '#FFF' }]}>{cat.label}</Text></TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.row}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar" size={18} color="#A099B0" /><Text style={styles.dateBtnText}>{formData.date.toLocaleDateString()}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.rowBtn, formData.isRecurring && { backgroundColor: '#7C3AED' }]} onPress={() => setFormData({...formData, isRecurring: !formData.isRecurring})}><Ionicons name="repeat" size={18} color={formData.isRecurring ? "#FFF" : "#A099B0"} /><Text style={[styles.rowBtnText, formData.isRecurring && { color: '#FFF' }]}>Recurring</Text></TouchableOpacity>
              </View>
              <View style={styles.typeRow}>
                {['Expense', 'Income'].map(t => (
                  <TouchableOpacity key={t} style={[styles.typeBtn, formData.type === t && { backgroundColor: t === 'Expense' ? '#FF6B6B' : '#4ADE80' }]} onPress={() => setFormData({...formData, type: t})}><Text style={[styles.typeBtnText, formData.type === t && { color: '#FFF' }]}>{t}</Text></TouchableOpacity>
                ))}
              </View>
              {showDatePicker && <DateTimePicker value={formData.date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setFormData({...formData, date: d}); }} />}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleAdd} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900' },
  addBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  heroSection: { alignItems: 'center', marginVertical: 10 },
  balanceCircle: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center' },
  balanceTextContainer: { position: 'absolute', alignItems: 'center' },
  balanceValue: { fontSize: 32, fontWeight: '900' },
  balanceLabel: { fontSize: 12, fontWeight: '600', opacity: 0.5 },
  budgetContainer: { width: width - 48, marginTop: 24 },
  budgetInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetLabel: { color: '#A099B0', fontSize: 12, fontWeight: '800' },
  budgetValue: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  progressBarBg: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  trendSection: { paddingHorizontal: 24, marginVertical: 30 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 14, height: 70, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { backgroundColor: '#7C3AED', borderRadius: 7, width: '100%' },
  barLabel: { marginTop: 10, color: '#A099B0', fontSize: 10, fontWeight: '900' },
  catDistributionSection: { paddingHorizontal: 24, marginBottom: 30 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  donutContainer: { width: 120, height: 120 },
  catLegend: { flex: 1, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, color: '#A099B0', fontSize: 11, fontWeight: '700' },
  legendValue: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  stickyContainer: { paddingHorizontal: 24, paddingVertical: 12, gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 12, fontSize: 14 },
  filterPills: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)' },
  activePill: { backgroundColor: '#7C3AED20', borderWidth: 1, borderColor: '#7C3AED' },
  pillText: { color: '#A099B0', fontWeight: '900', fontSize: 12 },
  activePillText: { color: '#7C3AED' },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  listContainer: { paddingHorizontal: 24, gap: 12, marginTop: 10 },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 28 },
  txIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1, marginLeft: 16 },
  txMerchant: { fontSize: 15, fontWeight: '800' },
  txDate: { fontSize: 12, opacity: 0.5 },
  txAmount: { fontSize: 16, fontWeight: '900' },
  deleteAction: { backgroundColor: '#FF6B6B', width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 28, marginVertical: 4, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: Platform.OS === 'ios' ? 50 : 32 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 24 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, color: '#FFF', fontSize: 16, marginBottom: 16 },
  label: { color: '#A099B0', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 15 },
  chipScroll: { marginBottom: 25 },
  chip: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12 },
  chipText: { color: '#A099B0', fontWeight: '900' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 20 },
  dateBtnText: { color: '#FFF', fontWeight: '900' },
  rowBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 20 },
  rowBtnText: { color: '#A099B0', fontWeight: '900' },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  typeBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  typeBtnText: { color: '#A099B0', fontWeight: '900' },
  modalActions: { flexDirection: 'row', gap: 16 },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 20 },
  cancelBtnText: { color: '#A099B0', fontWeight: '900' },
  saveBtn: { flex: 2, backgroundColor: '#7C3AED', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});

export default FinanceScreen;
