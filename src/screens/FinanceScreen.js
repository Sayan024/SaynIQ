import React, { useContext, useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, Dimensions, Modal, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { VaultContext } from '../context/VaultContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseSmsTransaction } from '../services/smsParserService';
import { requestSmsPermission, scanTransactionsFromSms } from '../services/smsReaderService';
import { exportStatement } from '../services/financeExportService';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const FILTERS = ['1 Day', '7 Days', '1 Month', '3 Months', '6 Months', 'All'];
const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Subscriptions', 'Bills', 'Salary', 'Recharge', 'Other'];
const MODES = ['UPI', 'Card', 'Cash', 'Net Banking', 'Wallet', 'Other'];

export default function FinanceScreen({ navigation }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const [showSmsInput, setShowSmsInput] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState([]);
  
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setEditFormData({ ...editingTransaction });
    }
  }, [editingTransaction]);

  const filteredTransactions = useMemo(() => {
    let list = [...(state.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Date Filter
    if (activeFilter !== 'All') {
      const now = new Date();
      let startTime = new Date();
      if (activeFilter === '1 Day') startTime.setDate(now.getDate() - 1);
      else if (activeFilter === '7 Days') startTime.setDate(now.getDate() - 7);
      else if (activeFilter === '1 Month') startTime.setMonth(now.getMonth() - 1);
      else if (activeFilter === '3 Months') startTime.setMonth(now.getMonth() - 3);
      else if (activeFilter === '6 Months') startTime.setMonth(now.getMonth() - 6);
      list = list.filter(t => new Date(t.date) >= startTime);
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.merchant.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) || 
        t.bank.toLowerCase().includes(q) ||
        t.paymentMode?.toLowerCase().includes(q) ||
        t.account?.toLowerCase().includes(q)
      );
    }

    // Calculate Running Balances
    let currentBalance = 0;
    return list.map((t, index) => {
      const openingBalance = currentBalance;
      if (t.type === 'Income') currentBalance += t.amount;
      else currentBalance -= t.amount;
      return { ...t, openingBalance, closingBalance: currentBalance, sNo: index + 1 };
    }).reverse(); // Most recent first for table
  }, [state.transactions, activeFilter, searchQuery]);

  // Analytics Calculations
  const stats = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'Expense');
    const income = filteredTransactions.filter(t => t.type === 'Income');
    const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
    const totalInc = income.reduce((acc, t) => acc + t.amount, 0);
    
    // Category Breakdown
    const catMap = {};
    expenses.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    
    // Daily Avg
    const uniqueDates = new Set(filteredTransactions.map(t => new Date(t.date).toDateString())).size || 1;

    return {
      totalExp,
      totalInc,
      balance: filteredTransactions[0]?.closingBalance || 0,
      dailyAvg: totalExp / uniqueDates,
      topCategory: sortedCats[0]?.[0] || 'N/A',
      categories: sortedCats,
      maxCatVal: sortedCats[0]?.[1] || 1
    };
  }, [filteredTransactions]);

  const handleScanSms = async () => {
    setIsScanning(true);
    const hasPermission = await requestSmsPermission();
    if (!hasPermission) {
      setIsScanning(false);
      Alert.alert('Permission Denied', 'SaynIQ needs SMS permission to automate tracking.');
      return;
    }

    try {
      const results = await scanTransactionsFromSms();
      const existingIds = new Set(state.transactions.map(t => t.raw));
      const newTransactions = results.filter(t => !existingIds.has(t.raw));
      
      if (newTransactions.length > 0) setScannedResults(newTransactions);
      else Alert.alert('Scan Complete', 'No new transactions found.');
    } catch (e) {
      Alert.alert('Error', 'Failed to scan SMS messages.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImportScanned = () => {
    scannedResults.forEach(t => dispatch({ type: 'ADD_TRANSACTION', payload: t }));
    setScannedResults([]);
    Alert.alert('Success', 'Transactions imported!');
  };

  const handleParseSms = () => {
    const transaction = parseSmsTransaction(smsText);
    if (transaction) {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      setSmsText('');
      setShowSmsInput(false);
    } else {
      Alert.alert('Error', 'Could not detect any transaction.');
    }
  };

  const handleUpdateTransaction = () => {
    if (!editFormData.merchant || !editFormData.amount) {
      Alert.alert('Error', 'Please fill in merchant and amount.');
      return;
    }

    dispatch({ 
      type: 'EDIT_TRANSACTION', 
      payload: { 
        id: editingTransaction.id, 
        data: {
          ...editFormData,
          amount: parseFloat(editFormData.amount)
        } 
      } 
    });
    setEditingTransaction(null);
    Alert.alert('Success', 'Transaction updated!');
  };

  const handleDeleteTransaction = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to remove this entry?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            setEditingTransaction(null);
          }
        }
      ]
    );
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setIsExportModalVisible(false);
    const success = await exportStatement(format, filteredTransactions, stats, theme);
    setIsExporting(false);
    if (success) {
      // Success is handled inside the service via share/alert
    }
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: theme.colors.cardSecondary }]}>
      <Text style={[styles.columnHeader, { width: 50 }]}>S.No</Text>
      <Text style={[styles.columnHeader, { width: 100 }]}>Date</Text>
      <Text style={[styles.columnHeader, { width: 150 }]}>Description</Text>
      <Text style={[styles.columnHeader, { width: 100 }]}>Mode</Text>
      <Text style={[styles.columnHeader, { width: 120 }]}>Account</Text>
      <Text style={[styles.columnHeader, { width: 120 }]}>Opening Bal</Text>
      <Text style={[styles.columnHeader, { width: 90 }]}>Debited</Text>
      <Text style={[styles.columnHeader, { width: 90 }]}>Credited</Text>
      <Text style={[styles.columnHeader, { width: 120 }]}>Closing Bal</Text>
      <Text style={[styles.columnHeader, { width: 100 }]}>Type</Text>
    </View>
  );

  const renderTableRow = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }]}
      onLongPress={() => handleDeleteTransaction(item.id)}
      onPress={() => setEditingTransaction(item)}
    >
      <Text style={[styles.cell, { width: 50, color: theme.colors.textSecondary }]}>{item.sNo}</Text>
      <Text style={[styles.cell, { width: 100, color: theme.colors.textPrimary }]}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={[styles.cell, { width: 150, color: theme.colors.textPrimary }]} numberOfLines={1}>{item.merchant}</Text>
      <Text style={[styles.cell, { width: 100, color: theme.colors.primary }]}>{item.paymentMode || 'N/A'}</Text>
      <Text style={[styles.cell, { width: 120, color: theme.colors.textSecondary }]}>{item.account || 'Unknown'}</Text>
      <Text style={[styles.cell, { width: 120, color: theme.colors.textSecondary }]}>₹{item.openingBalance.toLocaleString()}</Text>
      <Text style={[styles.cell, { width: 90, color: '#F87171' }]}>{item.type === 'Expense' ? `₹${item.amount}` : '-'}</Text>
      <Text style={[styles.cell, { width: 90, color: '#4ADE80' }]}>{item.type === 'Income' ? `₹${item.amount}` : '-'}</Text>
      <Text style={[styles.cell, { width: 120, color: theme.colors.textPrimary, fontWeight: '800' }]}>₹{item.closingBalance.toLocaleString()}</Text>
      <Text style={[styles.cell, { width: 100, color: theme.colors.textSecondary }]}>{item.type}</Text>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal visible={!!editingTransaction} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Edit Transaction</Text>
              <TouchableOpacity onPress={() => setEditingTransaction(null)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.7 }}>
              <Text style={styles.inputLabel}>Merchant / Description</Text>
              <TextInput
                style={[styles.modalInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={editFormData.merchant}
                onChangeText={(v) => setEditFormData({ ...editFormData, merchant: v })}
                placeholder="Amazon, Swiggy, etc."
                placeholderTextColor={theme.colors.textSecondary}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Amount (₹)</Text>
                  <TextInput
                    style={[styles.modalInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                    value={editFormData.amount?.toString()}
                    onChangeText={(v) => setEditFormData({ ...editFormData, amount: v })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.inputLabel}>Type</Text>
                  <View style={styles.typeSelector}>
                    {['Expense', 'Income'].map(t => (
                      <TouchableOpacity 
                        key={t}
                        onPress={() => setEditFormData({ ...editFormData, type: t })}
                        style={[
                          styles.typeBtn, 
                          editFormData.type === t && { backgroundColor: t === 'Income' ? '#4ADE80' : '#F87171' }
                        ]}
                      >
                        <Text style={[styles.typeBtnText, editFormData.type === t && { color: '#000' }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity 
                    key={c}
                    onPress={() => setEditFormData({ ...editFormData, category: c })}
                    style={[styles.pill, editFormData.category === c && { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={[styles.pillText, editFormData.category === c && { color: '#000' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Payment Mode</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {MODES.map(m => (
                  <TouchableOpacity 
                    key={m}
                    onPress={() => setEditFormData({ ...editFormData, paymentMode: m })}
                    style={[styles.pill, editFormData.paymentMode === m && { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={[styles.pillText, editFormData.paymentMode === m && { color: '#000' }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Debit Account / Source</Text>
              <TextInput
                style={[styles.modalInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={editFormData.account}
                onChangeText={(v) => setEditFormData({ ...editFormData, account: v })}
                placeholder="ICICI XX530, Cash, etc."
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              {editFormData.lastUpdated && (
                <Text style={styles.lastUpdated}>Last Updated: {new Date(editFormData.lastUpdated).toLocaleString()}</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.deleteBtn, { borderColor: '#F87171' }]} 
                onPress={() => handleDeleteTransaction(editingTransaction.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#F87171" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleUpdateTransaction}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderExportModal = () => (
    <Modal visible={isExportModalVisible} transparent animationType="fade">
      <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
        <View style={[styles.exportModal, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.exportTitle, { color: theme.colors.textPrimary }]}>Export Statement</Text>
          <Text style={[styles.exportSubtitle, { color: theme.colors.textSecondary }]}>Select your preferred format for the detailed financial ledger.</Text>
          
          <View style={styles.exportOptions}>
            {[
              { id: 'PDF', name: 'PDF Document', icon: 'document-text', desc: 'Best for sharing & printing' },
              { id: 'CSV', name: 'CSV File', icon: 'list', desc: 'Best for data analysis' },
              { id: 'EXCEL', name: 'Excel Sheet', icon: 'grid', desc: 'Best for spreadsheets' }
            ].map(opt => (
              <TouchableOpacity 
                key={opt.id} 
                style={[styles.exportOption, { backgroundColor: theme.colors.cardSecondary }]}
                onPress={() => handleExport(opt.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Ionicons name={opt.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionName, { color: theme.colors.textPrimary }]}>{opt.name}</Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>{opt.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.exportCancel} onPress={() => setIsExportModalVisible(false)}>
            <Text style={[styles.exportCancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {renderEditModal()}
      {renderExportModal()}
      
      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.colors.textPrimary }]}>Finance Hub</Text>
        <TouchableOpacity 
          onPress={() => setIsExportModalVisible(true)} 
          style={styles.exportBtn}
          disabled={isExporting}
        >
          {isExporting ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Ionicons name="cloud-download-outline" size={24} color={theme.colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Analytics Hero */}
        <View style={styles.analyticsRow}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.mainInsight}>
            <Text style={styles.insightLabel}>Available Balance</Text>
            <Text style={styles.insightValue}>₹{stats.balance.toLocaleString()}</Text>
            <View style={styles.insightFooter}>
              <Text style={styles.footerText}>Monthly Trend: +12%</Text>
              <Ionicons name="trending-up" size={14} color="#FFF" />
            </View>
          </LinearGradient>
          
          <View style={styles.sideInsights}>
            <BlurView intensity={20} tint="dark" style={styles.miniInsight}>
              <Text style={styles.miniLabel}>Daily Avg</Text>
              <Text style={styles.miniValue}>₹{Math.round(stats.dailyAvg).toLocaleString()}</Text>
            </BlurView>
            <BlurView intensity={20} tint="dark" style={styles.miniInsight}>
              <Text style={styles.miniLabel}>Top Spend</Text>
              <Text style={styles.miniValue}>{stats.topCategory}</Text>
            </BlurView>
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="arrow-down-circle" size={24} color="#F87171" />
            <View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
              <Text style={[styles.statValue, { color: '#F87171' }]}>₹{stats.totalExp.toLocaleString()}</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="arrow-up-circle" size={24} color="#4ADE80" />
            <View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Income</Text>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>₹{stats.totalInc.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 24 }}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, activeFilter === f && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, { color: activeFilter === f ? '#000' : theme.colors.textSecondary }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Analysis */}
        <View style={[styles.categorySection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Spending Analysis</Text>
          {stats.categories.map(([cat, val]) => (
            <View key={cat} style={styles.catRow}>
              <View style={styles.catInfo}>
                <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>{cat}</Text>
                <Text style={[styles.catVal, { color: theme.colors.textSecondary }]}>₹{val.toLocaleString()}</Text>
              </View>
              <View style={[styles.barContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[styles.bar, { width: `${(val / stats.maxCatVal) * 100}%`, backgroundColor: theme.colors.primary }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={handleScanSms}>
            {isScanning ? <ActivityIndicator color="#000" /> : <Ionicons name="scan-circle" size={22} color="#000" />}
            <Text style={styles.actionText}>Scan SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.cardSecondary }]} onPress={() => setShowSmsInput(!showSmsInput)}>
            <Ionicons name="create" size={22} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        {showSmsInput && (
          <View style={styles.smsBox}>
            <TextInput
              style={[styles.smsInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="Paste banking SMS here..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline value={smsText} onChangeText={setSmsText}
            />
            <TouchableOpacity style={[styles.parseBtn, { backgroundColor: theme.colors.primary }]} onPress={handleParseSms}>
              <Text style={styles.parseBtnText}>Detect Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction Table */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textPrimary }]}>Detailed Statement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
          <View>
            {renderTableHeader()}
            <FlatList
              data={filteredTransactions}
              keyExtractor={item => item.id}
              renderItem={renderTableRow}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={scannedResults.length > 0} transparent animationType="slide">
        <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Detected Transactions</Text>
            <ScrollView style={{ maxHeight: 400, marginVertical: 20 }}>
              {scannedResults.map((t, i) => (
                <View key={i} style={[styles.reviewRow, { borderBottomColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewMerchant, { color: theme.colors.textPrimary }]}>{t.merchant}</Text>
                    <Text style={[styles.reviewDetails, { color: theme.colors.textSecondary }]}>{t.account} • {t.paymentMode}</Text>
                  </View>
                  <Text style={[styles.reviewAmount, { color: t.type === 'Income' ? '#4ADE80' : '#F87171' }]}>
                    {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setScannedResults([])}><Text style={styles.cancelBtnText}>Discard</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleImportScanned}><Text style={styles.saveBtnText}>Import All</Text></TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15 },
  navTitle: { fontSize: 22, fontWeight: '900' },
  exportBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },

  analyticsRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 24, marginBottom: 20 },
  mainInsight: { flex: 1.8, padding: 24, borderRadius: 32, justifyContent: 'center' },
  insightLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  insightValue: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 5 },
  insightFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15 },
  footerText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  
  sideInsights: { flex: 1, gap: 12 },
  miniInsight: { flex: 1, padding: 15, borderRadius: 20, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  miniLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  miniValue: { fontSize: 15, fontWeight: '900', color: '#FFF', marginTop: 4 },

  statGrid: { flexDirection: 'row', gap: 15, paddingHorizontal: 24, marginBottom: 24 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24 },
  statLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', marginTop: 2 },

  filterRow: { marginBottom: 25 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, marginRight: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterText: { fontSize: 13, fontWeight: '800' },

  categorySection: { marginHorizontal: 24, padding: 24, borderRadius: 32, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  catRow: { marginBottom: 18 },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontSize: 14, fontWeight: '700' },
  catVal: { fontSize: 13, fontWeight: '800' },
  barContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },

  actionGrid: { flexDirection: 'row', gap: 15, paddingHorizontal: 24, marginBottom: 25 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 24 },
  actionText: { fontSize: 14, fontWeight: '900' },

  smsBox: { marginHorizontal: 24, marginBottom: 30 },
  smsInput: { height: 100, borderWidth: 1, borderRadius: 20, padding: 18, textAlignVertical: 'top', fontSize: 14, fontWeight: '600' },
  parseBtn: { paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginTop: 12 },
  parseBtnText: { color: '#000', fontWeight: '900' },

  sectionHeader: { fontSize: 18, fontWeight: '900', marginHorizontal: 24, marginBottom: 15 },
  tableScroll: { paddingHorizontal: 10 },
  tableHeader: { flexDirection: 'row', paddingVertical: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  columnHeader: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  cell: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 32, padding: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 10 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  reviewMerchant: { fontSize: 14, fontWeight: '800' },
  reviewDetails: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  reviewAmount: { fontSize: 15, fontWeight: '900' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800' },
  saveBtn: { flex: 2, paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900' },

  /* Edit Modal Styles */
  editModal: { padding: 24, borderRadius: 32, maxHeight: '90%', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  inputLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10, marginTop: 15, marginLeft: 4 },
  modalInput: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 15 },
  typeSelector: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, height: 56 },
  typeBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  typeBtnText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  pillScroll: { marginBottom: 5 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8, height: 40 },
  pillText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  deleteBtn: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  lastUpdated: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 20, fontWeight: '600' },

  /* Export Modal */
  exportModal: { padding: 32, borderRadius: 40 },
  exportTitle: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  exportSubtitle: { fontSize: 14, lineHeight: 22, marginBottom: 30, opacity: 0.7 },
  exportOptions: { gap: 12 },
  exportOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, gap: 16 },
  optionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  optionName: { fontSize: 16, fontWeight: '800' },
  optionDesc: { fontSize: 11, fontWeight: '600', opacity: 0.5, marginTop: 2 },
  exportCancel: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  exportCancelText: { fontSize: 14, fontWeight: '700' },
});
