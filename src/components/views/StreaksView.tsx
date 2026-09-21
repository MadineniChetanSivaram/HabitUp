import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { PlantStreakCard } from '../mobile/PlantStreakCard';
import { CheckCircle2, ChevronLeft, Sparkles, Flame } from 'lucide-react-native';
import { LottieAnimation } from '../common/LottieAnimation';

export const StreaksView: React.FC = () => {
  const { overallStats, setActiveTab, theme, t } = useHabit();
  const isDark = theme === 'dark';

  const plant = overallStats.plantStreak;
  const currentStreak = Math.max(plant?.currentStreak ?? 0, overallStats.currentBestStreak ?? 0);
  const bestStreak = Math.max(plant?.bestStreak ?? 0, overallStats.bestAllTimeStreak ?? 0);
  const totalCompletions = overallStats.totalCompletionsCount || 0;

  const pulseAura = useRef(new Animated.Value(1)).current;
  const countScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.spring(countScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: useNative,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAura, {
          toValue: 1.12,
          duration: 1800,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAura, {
          toValue: 0.95,
          duration: 1800,
          useNativeDriver: useNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

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

      {/* Hero Flame Mascot with Animated Pulsing Glow Aura */}
      <View style={styles.heroFlameBox}>
        <Animated.View
          style={[
            styles.flameAura,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.18)',
              transform: [{ scale: pulseAura }],
            },
          ]}
        />
        <View style={{ width: 130, height: 130, alignItems: 'center', justifyContent: 'center' }}>
          <LottieAnimation source="streakFlame" size={130} />
        </View>

        <Animated.View style={{ transform: [{ scale: countScale }], alignItems: 'center' }}>
          <Text style={[styles.streakHeroNumber, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {currentStreak}
          </Text>
          <View style={styles.streakUnitRow}>
            <Sparkles size={13} color="#F59E0B" />
            <Text style={[styles.streakHeroUnit, { color: isDark ? '#FBBF24' : '#D97706' }]}>
              {t('streaks.day_streak', 'DAY STREAK')}
            </Text>
            <Sparkles size={13} color="#F59E0B" />
          </View>
        </Animated.View>
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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  flameAura: {
    position: 'absolute',
    top: 10,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  streakHeroNumber: {
    fontSize: 48,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -1,
  },
  streakUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
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
