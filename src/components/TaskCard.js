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
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{task.category}</Text>
          {task.isRecurring && (
            <Ionicons name="repeat" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
          )}
        </View>
        <TouchableOpacity onPress={() => onDelete(task.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={() => onToggleStatus(task.id)}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }, task.status === 'Completed' && styles.completedText]}>
          {task.title}
        </Text>
      </TouchableOpacity>
      
      {task.description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {task.description}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
        <View style={styles.timerSection}>
          <View style={[styles.timerBadge, { backgroundColor: isActive ? `${theme.colors.primary}15` : 'rgba(255,255,255,0.05)' }]}>
            <Ionicons name="time-outline" size={14} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.timerText, { color: isActive ? theme.colors.primary : theme.colors.textSecondary }]}>
              {formatDuration(elapsed)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {task.status === 'Pending' && (
            <TouchableOpacity 
              style={[styles.timerBtn, { backgroundColor: isActive ? theme.colors.danger : theme.colors.cardSecondary }]}
              onPress={() => isActive ? onStopTimer(task.id) : onStartTimer(task.id)}
            >
              <Ionicons name={isActive ? "stop" : "play"} size={16} color={isActive ? '#FFF' : theme.colors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.statusBtn]} 
            onPress={() => onToggleStatus(task.id)}
          >
            <Ionicons 
              name={task.status === 'Completed' ? "checkmark-circle" : "ellipse-outline"} 
              size={26} 
              color={task.status === 'Completed' ? theme.colors.primary : theme.colors.border} 
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
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  category: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    opacity: 0.7,
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
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtn: {
    padding: 2,
  }
});
