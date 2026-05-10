import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, icon, color, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={styles.statCardWrapper}>
    <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }]}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statTitle, { color: 'rgba(255,255,255,0.4)' }]}>{title}</Text>
    </View>
  </Animated.View>
);

export default function TaskInsights({ tasks = [], logs = [], theme }) {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const completedToday = tasks.filter(t => t.status === 'Completed' && new Date(t.completedAt).toDateString() === today).length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    
    // Focus Hours
    const totalSecs = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
    const focusHours = (totalSecs / 3600).toFixed(1);
    const sessions = logs.length;

    // Discipline Score (0-100)
    const completionRate = tasks.length > 0 ? tasks.filter(t => t.status === 'Completed').length / tasks.length : 0;
    const activeDays = new Set(tasks.filter(t => t.completedAt).map(t => new Date(t.completedAt).toDateString())).size;
    const consistency = Math.min(activeDays / 7, 1);
    const disciplineScore = Math.round(((completionRate * 0.6) + (consistency * 0.4)) * 100);

    // Weekly consistency (last 7 days)
    const weeklyData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const count = tasks.filter(t => t.status === 'Completed' && new Date(t.completedAt).toDateString() === dayStr).length;
      return { label: ['S','M','T','W','T','F','S'][d.getDay()], count };
    });

    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    return { completedToday, pending, focusHours, sessions, disciplineScore, weeklyData, maxCount };
  }, [tasks, logs]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.heroRow}>
        <LinearGradient
          colors={[theme.colors.primary, '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.disciplineCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.disciplineLabel}>Discipline Score</Text>
            <Text style={styles.disciplineValue}>{stats.disciplineScore}</Text>
            <Text style={styles.disciplineStatus}>
              {stats.disciplineScore > 80 ? 'Mastermind' : stats.disciplineScore > 50 ? 'Consistent' : 'Building Habit'}
            </Text>
            
            {/* Daily Goal Progress */}
            <View style={styles.goalContainer}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Daily Focus Goal</Text>
                <Text style={styles.goalValue}>{Math.min(Math.round((stats.focusHours / 4) * 100), 100)}%</Text>
              </View>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${Math.min((stats.focusHours / 4) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
          <View style={styles.disciplineIcon}>
             <Ionicons name="medal" size={40} color="rgba(255,255,255,0.4)" />
          </View>
        </LinearGradient>

        <View style={styles.miniStats}>
           <StatCard title="Focus Hrs" value={stats.focusHours} icon="time" color="#60A5FA" delay={100} />
           <StatCard title="Sessions" value={stats.sessions} icon="flash" color="#FBBF24" delay={200} />
        </View>
      </Animated.View>

      <View style={styles.grid}>
        <StatCard title="Done Today" value={stats.completedToday} icon="checkmark-circle" color={theme.colors.primary} delay={300} />
        <StatCard title="Pending" value={stats.pending} icon="hourglass" color="#F87171" delay={400} />
      </View>

      <Animated.View entering={FadeInDown.delay(500)} style={styles.chartWrapper}>
        <View style={[styles.chartCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }]}>
          <Text style={styles.chartTitle}>Weekly Consistency</Text>
          <View style={styles.chart}>
            {stats.weeklyData.map((day, i) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { 
                  height: `${(day.count / stats.maxCount) * 100}%`, 
                  backgroundColor: theme.colors.primary,
                  opacity: i === 6 ? 1 : 0.5
                }]} />
                <Text style={styles.chartLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  heroRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  disciplineCard: { 
    flex: 2, padding: 20, borderRadius: 28, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  disciplineLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  disciplineValue: { fontSize: 36, fontWeight: '900', color: '#FFF', marginVertical: 4 },
  disciplineStatus: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  disciplineIcon: { opacity: 0.8 },

  goalContainer: { marginTop: 16, paddingRight: 20 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  goalValue: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  goalTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },

  miniStats: { flex: 1, gap: 12 },
  statCardWrapper: { flex: 1 },
  statCard: { 
    padding: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  iconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  statTitle: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  chartWrapper: { marginTop: 4 },
  chartCard: { padding: 20, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' },
  chartTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 16, opacity: 0.6 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 60, paddingHorizontal: 10 },
  chartBarWrapper: { alignItems: 'center', gap: 8, flex: 1 },
  chartBar: { width: 10, borderRadius: 5, minHeight: 4 },
  chartLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
});
