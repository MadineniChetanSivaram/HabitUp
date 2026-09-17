import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { PlantStreakCard } from '../mobile/PlantStreakCard';
import { CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { LottieAnimation } from '../common/LottieAnimation';

export const StreaksView: React.FC = () => {
  const { overallStats, setActiveTab, theme, t } = useHabit();
  const isDark = theme === 'dark';

  const plant = overallStats.plantStreak;
  const currentStreak = Math.max(plant?.currentStreak ?? 0, overallStats.currentBestStreak ?? 0);
  const bestStreak = Math.max(plant?.bestStreak ?? 0, overallStats.bestAllTimeStreak ?? 0);
  const totalCompletions = overallStats.totalCompletionsCount || 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1120' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Header with Back Button: [ < ] Streaks & Momentum */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={[
            styles.backButton,
            { backgroundColor: isDark ? '#162032' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' },
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={isDark ? '#E2E8F0' : '#0F172A'} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {t('streaks.title', 'Streaks & Momentum')}
        </Text>

        <View style={{ width: 38 }} />
      </View>

      {/* Hero Flame Mascot with Lottie */}
      <View style={styles.heroFlameBox}>
        <View style={{ width: 130, height: 130, alignItems: 'center', justifyContent: 'center' }}>
          <LottieAnimation source="streakFlame" size={130} />
        </View>

        <Text style={[styles.streakHeroNumber, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {currentStreak}
        </Text>
        <Text style={[styles.streakHeroUnit, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {t('streaks.day_streak', 'DAY STREAK')}
        </Text>
      </View>

      {/* Living Plant Garden Streak Card */}
      <PlantStreakCard />

      {/* Milestones & Summary Cards */}
      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#162032' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.metricIconCircle}>
            <LottieAnimation source="trophyAchievement" size={26} />
          </View>
          <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('streaks.longest_streak', 'Longest Streak')}
          </Text>
          <Text style={[styles.metricNumber, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {bestStreak} <Text style={{ fontSize: 13 }}>{t('streaks.days', 'days')}</Text>
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#162032' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.metricIconCircle}>
            <CheckCircle2 size={18} color="#38BDF8" />
          </View>
          <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('streaks.total_checkins', 'Total Check-ins')}
          </Text>
          <Text style={[styles.metricNumber, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {totalCompletions}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroFlameBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  streakHeroNumber: {
    fontSize: 48,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -1,
  },
  streakHeroUnit: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 6,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  metricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
});
