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

const { width } = Dimensions.get('window');

export default function TasksScreen({ navigation }) {
  const { state, dispatch } = useContext(VaultContext);
  const theme = state.theme;
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [activeTimerId, setActiveTimerId] = useState(null);

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

  const filteredTasks = (state.tasks || []).filter(t => t.status === activeTab);


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
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Task Manager</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.primary }]}>Focus & Productivity</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('AddTask')}>
          <Ionicons name="add" size={28} color={theme.colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Analytics Insights */}
        <View style={styles.insightsRow}>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.insightValue, { color: theme.colors.textPrimary }]}>{stats.pending}</Text>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.insightValue, { color: theme.colors.primary }]}>{stats.duration}</Text>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>Work Time</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.insightValue, { color: theme.colors.warning }]}>{stats.streak}d</Text>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
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
  addBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingHorizontal: 24 },
  
  insightsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  insightCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  insightValue: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  insightLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  tabBar: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '800' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 }
});
