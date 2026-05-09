import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../services/taskService';
import { VaultContext } from '../context/VaultContext';

export default function TaskCard({ task, onToggleStatus, onDelete, onStartTimer, onStopTimer, isActive }) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;
  
  const [elapsed, setElapsed] = useState(task.totalDuration || 0);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(task.totalDuration || 0);
    }
    return () => clearInterval(interval);
  }, [isActive, task.totalDuration]);

  const priorityColor = {
    High: theme.colors.danger,
    Medium: theme.colors.warning,
    Low: theme.colors.success
  }[task.priority] || theme.colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>{task.priority}</Text>
          </View>
          <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{task.category}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(task.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary }, task.status === 'Completed' && styles.completedText]}>
        {task.title}
      </Text>
      
      {task.description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.timerSection}>
          <Ionicons name="time-outline" size={16} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.timerText, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
            {formatDuration(elapsed)}
          </Text>
        </View>

        <View style={styles.actions}>
          {task.status === 'Pending' && (
            <TouchableOpacity 
              style={[styles.timerBtn, { backgroundColor: isActive ? theme.colors.danger : theme.colors.primary }]}
              onPress={() => isActive ? onStopTimer(task.id) : onStartTimer(task.id)}
            >
              <Ionicons name={isActive ? "stop" : "play"} size={18} color={theme.colors.textDark} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.statusBtn, { borderColor: theme.colors.border }]} 
            onPress={() => onToggleStatus(task.id)}
          >
            <Ionicons 
              name={task.status === 'Completed' ? "checkbox" : "square-outline"} 
              size={24} 
              color={task.status === 'Completed' ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtn: {
    padding: 4,
  }
});
