import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Widget = ({ title, value, icon, color, subtitle, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={styles.widgetWrapper}>
    <BlurView intensity={20} tint="light" style={[styles.widget, { borderColor: `${color}40`, backgroundColor: `${color}10` }]}>
      <View style={styles.widgetHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.widgetTitle, { color: 'rgba(255,255,255,0.6)' }]}>{title}</Text>
      </View>
      <Text style={styles.widgetValue}>{value}</Text>
      {subtitle && <Text style={[styles.widgetSubtitle, { color: 'rgba(255,255,255,0.4)' }]}>{subtitle}</Text>}
    </BlurView>
  </Animated.View>
);

const ProgressBar = ({ label, progress, color }) => (
  <View style={styles.progressItem}>
    <View style={styles.progressInfo}>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
    </View>
    <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
      <LinearGradient
        colors={[color, `${color}40`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${progress * 100}%` }]}
      />
    </View>
  </View>
);

export default function OverviewDashboard({ items = [], tasks = [], streak = 0, theme }) {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const notesToday = items.filter(i => i.type === 'note' && new Date(i.createdAt).toDateString() === today).length;
    const linksToday = items.filter(i => i.type === 'link' && new Date(i.createdAt).toDateString() === today).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // Categories
    const categoryMap = {};
    items.forEach(item => {
      if (item.category) {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
      }
    });
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Weekly activity (last 7 days)
    const weeklyActivity = Array(7).fill(0);
    const now = new Date();
    items.forEach(item => {
      const itemDate = new Date(item.createdAt);
      const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weeklyActivity[6 - diffDays]++;
      }
    });

    const maxActivity = Math.max(...weeklyActivity, 1);
    const aiActivity = items.filter(i => i.summary || (i.type === 'note' && i.text?.includes('**'))).length;

    return { notesToday, linksToday, taskProgress, completedTasks, streak, topCategories, weeklyActivity, maxActivity, aiActivity };
  }, [items, tasks, streak]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Intelligence Dashboard</Text>
        <View style={[styles.liveBadge, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.pulse} />
          <Text style={styles.liveText}>Live Now</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <Widget 
          title="Daily Streak" 
          value={stats.streak} 
          icon="flame" 
          color="#FF6B35" 
          subtitle="🔥 Active learner"
          delay={0}
        />
        <Widget 
          title="Notes Today" 
          value={stats.notesToday} 
          icon="document-text" 
          color={theme.colors.primary} 
          subtitle={`${stats.linksToday} links saved`}
          delay={100}
        />
        <Widget 
          title="Task Load" 
          value={`${stats.completedTasks}/${tasks.length}`} 
          icon="checkmark-done" 
          color="#4ADE80" 
          subtitle="Keep focusing"
          delay={200}
        />
        <Widget 
          title="AI Activity" 
          value={stats.aiActivity} 
          icon="sparkles" 
          color="#C084FC" 
          subtitle="Insights generated"
          delay={300}
        />
      </View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.fullWidgetWrapper}>
        <BlurView intensity={20} tint="dark" style={[styles.largeWidget, { borderColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.largeWidgetTitle}>Learning Momentum</Text>
          <View style={styles.chartContainer}>
            {stats.weeklyActivity.map((val, i) => (
              <View key={i} style={styles.chartColumn}>
                <LinearGradient
                  colors={[theme.colors.primary, `${theme.colors.primary}20`]}
                  style={[styles.chartBar, { 
                    height: `${(val / stats.maxActivity) * 100}%`, 
                    opacity: i === 6 ? 1 : 0.5
                  }]}
                />
                <Text style={styles.chartDay}>{['M','T','W','T','F','S','S'][(new Date().getDay() + i + 1) % 7]}</Text>
              </View>
            ))}
          </View>
        </BlurView>
      </Animated.View>

      <View style={styles.footerRow}>
        <Animated.View entering={FadeInDown.delay(500)} style={[styles.smallCard, { backgroundColor: `${theme.colors.card}50` }]}>
          <Text style={styles.cardHeader}>Top Categories</Text>
          <View style={styles.catList}>
            {stats.topCategories.map(([cat, count], i) => (
              <View key={cat} style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: [theme.colors.primary, '#60A5FA', '#C084FC'][i] }]} />
                <Text style={styles.catName} numberOfLines={1}>{cat}</Text>
                <Text style={styles.catCount}>{count}</Text>
              </View>
            ))}
            {stats.topCategories.length === 0 && <Text style={styles.emptyText}>No data yet</Text>}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)} style={[styles.smallCard, { backgroundColor: `${theme.colors.card}50` }]}>
          <Text style={styles.cardHeader}>Task Progress</Text>
          <View style={styles.progressBox}>
             <ProgressBar label="Overall" progress={stats.taskProgress} color="#4ADE80" />
             <View style={styles.statsMini}>
                <Text style={styles.miniVal}>{tasks.length - stats.completedTasks}</Text>
                <Text style={styles.miniLabel}>Remaining</Text>
             </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.4)' },
  liveText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  widgetWrapper: { width: (width - 60) / 2 },
  widget: { padding: 16, borderRadius: 24, borderWidth: 1, minHeight: 110 },
  widgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  widgetTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  widgetValue: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  widgetSubtitle: { fontSize: 10, fontWeight: '600' },

  fullWidgetWrapper: { marginTop: 12 },
  largeWidget: { padding: 24, borderRadius: 28, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  largeWidgetTitle: { fontSize: 14, fontWeight: '800', color: '#FFF', marginBottom: 20 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80, paddingHorizontal: 10 },
  chartColumn: { alignItems: 'center', gap: 8, flex: 1 },
  chartBar: { width: 12, borderRadius: 6, minHeight: 4 },
  chartDay: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },

  footerRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  smallCard: { flex: 1, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  catList: { gap: 12 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  catName: { flex: 1, fontSize: 12, fontWeight: '700', color: '#FFF' },
  catCount: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },

  progressItem: { gap: 6 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  progressPercent: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statsMini: { marginTop: 16, alignItems: 'center' },
  miniVal: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  miniLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  emptyText: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
});
