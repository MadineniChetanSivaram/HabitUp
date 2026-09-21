import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useHabit } from '../../context/HabitContext';
import { IconRenderer } from '../common/IconRenderer';
import { formatDateKey, isHabitScheduledOnDate } from '../../utils/streakCalculator';
import { ChevronLeft, Flame, Trophy, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { LottieAnimation } from '../common/LottieAnimation';

export const StatsView: React.FC = () => {
  const {
    habits,
    completions,
    getHabitStats,
    overallStats,
    setSelectedHabitForDetail,
    setActiveTab,
    theme,
    t,
    tHabitName,
  } = useHabit();

  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const analytics = useMemo(() => {
    const activeHabits = habits.filter(
      (h) => !h.archived_at && !h.deleted_at && !h.paused_at
    );

    let chartTitle = t('stats.weekly_activity_daily', 'Weekly Activity (Daily)');
    let donutLabel = t('stats.week_rate', 'Week Rate');
    let checkInsLabel = t('stats.week_checkins', 'Week Check-ins');
    let streakLabel = t('stats.active_streak', 'Active Streak');
    let bars: {
      label: string;
      subLabel?: string;
      completedCount: number;
      totalDue: number;
      percent: number;
    }[] = [];

    let periodCompletionsCount = 0;
    let periodScheduledTotal = 0;
    let periodCompletedTotal = 0;
    let periodBestStreak = 0;

    const completionLookup = new Set<string>();
    completions.forEach((c) => {
      const dKey = (c.completion_date || '').split('T')[0];
      if (dKey) {
        completionLookup.add(`${c.habit_id}_${dKey}`);
      }
    });

    if (timeRange === 'week') {
      chartTitle = t('stats.weekly_activity_daily', 'Weekly Activity (Daily)');
      donutLabel = t('stats.week_rate', 'Week Rate');
      checkInsLabel = t('stats.week_checkins', 'Week Check-ins');
      streakLabel = t('stats.active_streak', 'Active Streak');

      const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon..6=Sun
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const dayLabels = [
        t('days.m', 'Mon'),
        t('days.t', 'Tue'),
        t('days.w', 'Wed'),
        t('days.th', 'Thu'),
        t('days.f', 'Fri'),
        t('days.s', 'Sat'),
        t('days.su', 'Sun'),
      ];

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dStr = formatDateKey(d);

        let due = 0;
        let done = 0;

        activeHabits.forEach((h) => {
          if (isHabitScheduledOnDate(h, d)) {
            due++;
            if (completionLookup.has(`${h.id}_${dStr}`)) {
              done++;
            }
          }
        });

        periodScheduledTotal += due;
        periodCompletedTotal += done;

        completions.forEach((c) => {
          const cDate = (c.completion_date || '').split('T')[0];
          if (cDate === dStr) {
            periodCompletionsCount++;
          }
        });

        const percent = due > 0 ? Math.round((done / due) * 100) : 0;
        bars.push({
          label: dayLabels[i],
          completedCount: done,
          totalDue: due,
          percent,
        });
      }

      periodBestStreak = overallStats.currentBestStreak || 0;
    } else if (timeRange === 'month') {
      const monthNames = [
        t('months.january', 'January'),
        t('months.february', 'February'),
        t('months.march', 'March'),
        t('months.april', 'April'),
        t('months.may', 'May'),
        t('months.june', 'June'),
        t('months.july', 'July'),
        t('months.august', 'August'),
        t('months.september', 'September'),
        t('months.october', 'October'),
        t('months.november', 'November'),
        t('months.december', 'December'),
      ];
      chartTitle = t('stats.month_activity_weeks', '{month} Activity (Weeks)', { month: monthNames[currentMonth] });
      donutLabel = t('stats.month_rate', 'Month Rate');
      checkInsLabel = t('stats.month_checkins', 'Month Check-ins');
      streakLabel = t('stats.best_streak', 'Best Streak');

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const buckets: { start: number; end: number; label: string }[] = [
        { start: 1, end: 7, label: 'W1' },
        { start: 8, end: 14, label: 'W2' },
        { start: 15, end: 21, label: 'W3' },
        { start: 22, end: 28, label: 'W4' },
      ];
      if (daysInMonth > 28) {
        buckets.push({ start: 29, end: daysInMonth, label: 'W5' });
      }

      buckets.forEach((b) => {
        let bucketDue = 0;
        let bucketDone = 0;

        for (let day = b.start; day <= b.end; day++) {
          const d = new Date(currentYear, currentMonth, day);
          const dStr = formatDateKey(d);

          activeHabits.forEach((h) => {
            if (isHabitScheduledOnDate(h, d)) {
              bucketDue++;
              if (completionLookup.has(`${h.id}_${dStr}`)) {
                bucketDone++;
              }
            }
          });
        }

        periodScheduledTotal += bucketDue;
        periodCompletedTotal += bucketDone;

        const percent = bucketDue > 0 ? Math.round((bucketDone / bucketDue) * 100) : 0;
        bars.push({
          label: b.label,
          subLabel: `${b.start}-${b.end}`,
          completedCount: bucketDone,
          totalDue: bucketDue,
          percent,
        });
      });

      const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      completions.forEach((c) => {
        const cDate = (c.completion_date || '').split('T')[0];
        if (cDate && cDate.startsWith(monthPrefix)) {
          periodCompletionsCount++;
        }
      });

      periodBestStreak = overallStats.currentBestStreak || 0;
    } else if (timeRange === 'year') {
      chartTitle = t('stats.yearly_activity_months', '{year} Yearly Activity (Months)', { year: currentYear });
      donutLabel = t('stats.year_rate', 'Year Rate');
      checkInsLabel = t('stats.year_checkins', 'Year Check-ins');
      streakLabel = t('stats.all_time_best', 'All-Time Best');

      const monthShortNames = [
        t('months.short.jan', 'Jan'),
        t('months.short.feb', 'Feb'),
        t('months.short.mar', 'Mar'),
        t('months.short.apr', 'Apr'),
        t('months.short.may', 'May'),
        t('months.short.jun', 'Jun'),
        t('months.short.jul', 'Jul'),
        t('months.short.aug', 'Aug'),
        t('months.short.sep', 'Sep'),
        t('months.short.oct', 'Oct'),
        t('months.short.nov', 'Nov'),
        t('months.short.dec', 'Dec'),
      ];

      for (let m = 0; m < 12; m++) {
        const daysInM = new Date(currentYear, m + 1, 0).getDate();
        let monthDue = 0;
        let monthDone = 0;

        for (let day = 1; day <= daysInM; day++) {
          const d = new Date(currentYear, m, day);
          const dStr = formatDateKey(d);

          activeHabits.forEach((h) => {
            if (isHabitScheduledOnDate(h, d)) {
              monthDue++;
              if (completionLookup.has(`${h.id}_${dStr}`)) {
                monthDone++;
              }
            }
          });
        }

        periodScheduledTotal += monthDue;
        periodCompletedTotal += monthDone;

        const percent = monthDue > 0 ? Math.round((monthDone / monthDue) * 100) : 0;
        bars.push({
          label: monthShortNames[m],
          completedCount: monthDone,
          totalDue: monthDue,
          percent,
        });
      }

      const yearPrefix = `${currentYear}-`;
      completions.forEach((c) => {
        const cDate = (c.completion_date || '').split('T')[0];
        if (cDate && cDate.startsWith(yearPrefix)) {
          periodCompletionsCount++;
        }
      });

      periodBestStreak = overallStats.bestAllTimeStreak || 0;
    }

    const overallSuccessRate =
      periodScheduledTotal > 0
        ? Math.round((periodCompletedTotal / periodScheduledTotal) * 100)
        : periodCompletedTotal > 0
        ? 100
        : 0;

    const habitBreakdown = activeHabits.map((h) => {
      let hDue = 0;
      let hDone = 0;

      if (timeRange === 'week') {
        const dayOfWeek = (now.getDay() + 6) % 7;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dStr = formatDateKey(d);
          if (isHabitScheduledOnDate(h, d)) {
            hDue++;
            if (completionLookup.has(`${h.id}_${dStr}`)) hDone++;
          }
        }
      } else if (timeRange === 'month') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(currentYear, currentMonth, day);
          const dStr = formatDateKey(d);
          if (isHabitScheduledOnDate(h, d)) {
            hDue++;
            if (completionLookup.has(`${h.id}_${dStr}`)) hDone++;
          }
        }
      } else if (timeRange === 'year') {
        for (let m = 0; m < 12; m++) {
          const daysInM = new Date(currentYear, m + 1, 0).getDate();
          for (let day = 1; day <= daysInM; day++) {
            const d = new Date(currentYear, m, day);
            const dStr = formatDateKey(d);
            if (isHabitScheduledOnDate(h, d)) {
              hDue++;
              if (completionLookup.has(`${h.id}_${dStr}`)) hDone++;
            }
          }
        }
      }

      const rate = hDue > 0 ? Math.round((hDone / hDue) * 100) : hDone > 0 ? 100 : 0;
      const stats = getHabitStats(h.id);

      return {
        habit: h,
        name: h.name,
        icon: h.icon,
        color: h.color || '#FF5A79',
        rate,
        streak: stats.currentStreak || 0,
      };
    });

    return {
      chartTitle,
      donutLabel,
      checkInsLabel,
      streakLabel,
      bars,
      periodCompletionsCount,
      periodBestStreak,
      overallSuccessRate,
      habitBreakdown,
    };
  }, [habits, completions, timeRange, overallStats, getHabitStats, t, currentMonth, currentYear]);

  const [animProgress, setAnimProgress] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [displayCompletions, setDisplayCompletions] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 700;
    let animFrameId: number;

    const startPercent = displayPercent;
    const targetPercent = analytics.overallSuccessRate;
    const startCompletions = displayCompletions;
    const targetCompletions = analytics.periodCompletionsCount;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progressRatio = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic curve
      const eased = 1 - Math.pow(1 - progressRatio, 3);

      setAnimProgress(eased);
      setDisplayPercent(Math.round(startPercent + (targetPercent - startPercent) * eased));
      setDisplayCompletions(Math.round(startCompletions + (targetCompletions - startCompletions) * eased));

      if (progressRatio < 1) {
        animFrameId = requestAnimationFrame(step);
      }
    };

    animFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameId);
  }, [timeRange, analytics.overallSuccessRate, analytics.periodCompletionsCount]);

  // Donut Gauge math
  const radius = 48;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (displayPercent / 100) * circumference;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1120' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Header with Back Button: [ < ] Statistics */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={isDark ? '#E2E8F0' : '#0F172A'} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {t('stats.title', 'Statistics')}
        </Text>

        <View style={{ width: 38 }} />
      </View>

      {/* Time Range Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#141D2E' : '#E2E8F0', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1' }]}>
        {(['week', 'month', 'year'] as const).map((r) => {
          const isActive = timeRange === r;
          const rangeLabel =
            r === 'week'
              ? t('stats.week', 'Week')
              : r === 'month'
              ? t('stats.month', 'Month')
              : t('stats.year', 'Year');
          return (
            <TouchableOpacity
              key={r}
              style={[
                styles.tabBtn,
                isActive && {
                  backgroundColor: '#7C5CFF',
                  shadowColor: '#7C5CFF',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setTimeRange(r)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B', fontWeight: isActive ? '800' : '600' },
                ]}
              >
                {rangeLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Donut Gauge Overview Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.overviewRow}>
          {/* Circular Donut Gauge */}
          <View style={styles.donutContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={isDark ? '#1E293B' : '#F1F5F9'}
                strokeWidth={strokeWidth}
              />
              <Circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#7C5CFF"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </Svg>
            <View style={styles.donutCenter}>
              <Text
                style={[styles.donutPercent, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              >
                {displayPercent}%
              </Text>
              <Text
                style={[styles.donutLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}
              >
                {analytics.donutLabel}
              </Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsCol}>
            <View style={styles.metricItem}>
              <Text
                style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}
              >
                {analytics.checkInsLabel}
              </Text>
              <Text
                style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              >
                {displayCompletions}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text
                style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}
              >
                {analytics.streakLabel}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <LottieAnimation source="streakFlame" size={20} />
                <Text
                  style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                >
                  {analytics.periodBestStreak}{' '}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                    {t('common.days', 'days')}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Dynamic Activity Breakdown Card (Week, Month, Year) */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {analytics.chartTitle}
          </Text>
        </View>

        <View style={styles.barChartRow}>
          {analytics.bars.map((item, idx) => {
            const totalBars = analytics.bars.length;
            const staggerOffset = (idx / Math.max(totalBars, 1)) * 0.35;
            const barRatio = Math.max(0, Math.min(1, (animProgress - staggerOffset) / (1 - staggerOffset || 1)));
            const animatedPercent = Math.max(8, Math.round(item.percent * barRatio));

            return (
              <View key={idx} style={styles.barCol}>
                <View
                  style={[
                    styles.barTrack,
                    {
                      width: timeRange === 'year' ? 12 : 18,
                      backgroundColor: isDark ? '#0C1322' : '#F1F5F9',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${animatedPercent}%`,
                        backgroundColor:
                          item.percent === 100
                            ? '#10B981'
                            : item.percent > 0
                            ? '#7C5CFF'
                            : isDark
                            ? '#1E293B'
                            : '#CBD5E1',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barDayText,
                    {
                      fontSize: timeRange === 'year' ? 9 : 10,
                      color: isDark ? '#94A3B8' : '#64748B',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Individual Habits Performance */}
      <View style={styles.habitsSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {t('stats.habits_breakdown', 'Habits Breakdown ({period})', {
            period: timeRange === 'week' ? t('stats.week', 'Week') : timeRange === 'month' ? t('stats.month', 'Month') : t('stats.year', 'Year')
          })}
        </Text>

        {analytics.habitBreakdown.map((item, index) => {
          const totalHabits = analytics.habitBreakdown.length;
          const itemStagger = (index / Math.max(totalHabits, 1)) * 0.3;
          const habitRatio = Math.max(0, Math.min(1, (animProgress - itemStagger) / (1 - itemStagger || 1)));
          const animatedWidth = Math.round(item.rate * habitRatio);

          return (
            <TouchableOpacity
              key={item.habit.id}
              style={[
                styles.habitRowCard,
                {
                  backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
              onPress={() => setSelectedHabitForDetail(item.habit)}
              activeOpacity={0.75}
            >
              <View style={[styles.habitIconCircle, { backgroundColor: item.color }]}>
                <IconRenderer name={item.icon} size={18} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.habitName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {tHabitName(item.name)}
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: isDark ? '#0C1322' : '#F1F5F9' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${animatedWidth}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.rateBadge}>
                <Text style={[styles.rateText, { color: item.color }]}>
                  {item.rate}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 12,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  donutContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  donutLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricsCol: {
    gap: 14,
  },
  metricItem: {
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 6,
  },
  barCol: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barTrack: {
    height: 75,
    borderRadius: 9,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
  },
  barDayText: {
    fontSize: 10,
    fontWeight: '700',
  },
  habitsSection: {
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  habitRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  habitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rateBadge: {
    paddingHorizontal: 8,
  },
  rateText: {
    fontSize: 15,
    fontWeight: '900',
  },
});
