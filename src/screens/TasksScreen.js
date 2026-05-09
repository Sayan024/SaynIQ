import React, { useState, useContext, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VaultContext } from '../context/VaultContext';
import { 
  formatDuration, calculateDailyProductivity, 
  saveTasks, saveTimeLogs, calculateProductivityStreak 
} from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskInsights from '../components/TaskInsights';
import FocusModeModal from '../components/FocusModeModal';

const { width } = Dimensions.get('window');

export default function TasksScreen({ navigation }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [focusModeVisible, setFocusModeVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Priority'); // Priority, Newest, Deadline

  // Stats calculation
  const stats = useMemo(() => {
    const tasks = state.tasks || [];
    const logs = state.timeLogs || [];
    
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const totalDuration = calculateDailyProductivity(logs);
    const prodStreak = calculateProductivityStreak(tasks);
    
    return {
      total: tasks.length,
      completed,
      pending,
      duration: formatDuration(totalDuration),
      streak: prodStreak
    };
  }, [state.tasks, state.timeLogs]);

  const filteredTasks = useMemo(() => {
    let list = (state.tasks || []).filter(t => t.status === activeTab);
    
    // Sort
    if (sortBy === 'Priority') {
      const pMap = { High: 3, Medium: 2, Low: 1 };
      list.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
    } else if (sortBy === 'Newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return list;
  }, [state.tasks, activeTab, sortBy]);


  const handleToggleStatus = (id) => {
    const task = state.tasks.find(t => t.id === id);
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    
    // If completing, stop timer
    if (newStatus === 'Completed' && activeTimerId === id) {
      handleStopTimer(id);
    }

    const updates = { 
      status: newStatus,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : null 
    };
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    
    const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTasks(updatedTasks);
  };


  const handleDeleteTask = (id) => {
    if (activeTimerId === id) setActiveTimerId(null);
    dispatch({ type: 'DELETE_TASK', payload: id });
    const updatedTasks = state.tasks.filter(t => t.id !== id);
    saveTasks(updatedTasks);
  };

  const handleStartTimer = (id) => {
    if (activeTimerId) {
      handleStopTimer(activeTimerId);
    }
    setActiveTimerId(id);
    const newLog = {
      id: Date.now().toString(),
      taskId: id,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0
    };
    dispatch({ type: 'ADD_TIME_LOG', payload: newLog });
    saveTimeLogs([newLog, ...state.timeLogs]);
  };

  const handleStopTimer = (id) => {
    setActiveTimerId(null);
    const logIndex = state.timeLogs.findIndex(l => l.taskId === id && !l.endTime);
    if (logIndex > -1) {
      const log = state.timeLogs[logIndex];
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime) - new Date(log.startTime)) / 1000);
      
      const updatedLog = { ...log, endTime, duration };
      const newLogs = state.timeLogs.map(l => l.id === log.id ? updatedLog : l);
      dispatch({ type: 'SET_TIME_LOGS', payload: newLogs });
      saveTimeLogs(newLogs);

      // Update task total duration
      const task = state.tasks.find(t => t.id === id);
      const updates = { totalDuration: (task.totalDuration || 0) + duration };
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
      const newTasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      saveTasks(newTasks);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Task Hub</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.primary }]}>AI Productivity OS</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.focusBtn, { backgroundColor: theme.colors.cardSecondary }]}
            onPress={() => setFocusModeVisible(true)}
          >
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <Text style={[styles.focusBtnText, { color: theme.colors.textPrimary }]}>Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('AddTask')}>
            <Ionicons name="add" size={28} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <FocusModeModal 
        visible={focusModeVisible} 
        onClose={() => setFocusModeVisible(false)}
        onFinish={(duration) => {
          // Focus session reported
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TaskInsights tasks={state.tasks} logs={state.timeLogs} theme={theme} />

        <View style={styles.filterHeader}>
          <Text style={[styles.filterTitle, { color: theme.colors.textPrimary }]}>Tasks</Text>
          <View style={styles.sortOptions}>
            {['Priority', 'Newest'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => setSortBy(opt)} style={[styles.sortBtn, sortBy === opt && { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.sortBtnText, { color: sortBy === opt ? theme.colors.textDark : theme.colors.textSecondary }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.cardSecondary }]}>
          {['Pending', 'Completed'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.colors.textDark : theme.colors.textSecondary }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
              onStartTimer={handleStartTimer}
              onStopTimer={handleStopTimer}
              isActive={activeTimerId === task.id}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={60} color={theme.colors.border} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No {activeTab.toLowerCase()} tasks found.
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingVertical: 20 
  },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  focusBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  focusBtnText: { fontSize: 14, fontWeight: '800' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  filterTitle: { fontSize: 20, fontWeight: '800' },
  sortOptions: { flexDirection: 'row', gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sortBtnText: { fontSize: 11, fontWeight: '800' },

  tabBar: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '800' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 }
});
