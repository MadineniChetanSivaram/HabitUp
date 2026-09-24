import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabit } from '../../context/HabitContext';
import { IconRenderer } from '../common/IconRenderer';
import { DuotoneIconBadge } from '../common/DuotoneIconBadge';
import { LottieAnimation } from '../common/LottieAnimation';
import {
  getMonthCalendarDays,
  formatDateKey,
  isHabitScheduledOnDate,
} from '../../utils/streakCalculator';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Sparkles,
} from 'lucide-react-native';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CalendarView: React.FC = () => {
  const {
    habits,
    completions,
    setActiveTab,
    theme,
    language,
    t,
    tHabitName,
  } = useHabit();

  const isDark = theme === 'dark';
  const activeHabits = habits.filter((h) => !h.archived_at && !h.deleted_at && !h.paused_at);

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const todayKey = formatDateKey(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(todayKey);

  const selectedDayScale = useRef(new Animated.Value(1)).current;
  const monthGridFade = useRef(new Animated.Value(1)).current;
  const monthGridSlide = useRef(new Animated.Value(0)).current;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = getMonthCalendarDays(year, month);

  // Group days into 7-day rows (weeks)
  const weeks: (typeof daysInMonth)[] = [];
  for (let i = 0; i < daysInMonth.length; i += 7) {
    weeks.push(daysInMonth.slice(i, i + 7));
  }

  const monthName =
    t(
      `calendar.month_${month}`,
      new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, {
        month: 'long',
      }).format(calendarDate)
    ) +
    ' ' +
    year;

  const changeMonth = (offset: number) => {
    const useNative = Platform.OS !== 'web';
    monthGridFade.setValue(0.7);
    monthGridSlide.setValue(offset * 20);

    setCalendarDate(new Date(year, month + offset, 1));

    Animated.parallel([
      Animated.timing(monthGridFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: useNative,
      }),
      Animated.timing(monthGridSlide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: useNative,
      }),
    ]).start();
  };

  const handleSelectDay = (dayKey: string) => {
    setSelectedCalendarDay(dayKey);
    const useNative = Platform.OS !== 'web';
    Animated.sequence([
      Animated.timing(selectedDayScale, {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: useNative,
      }),
      Animated.spring(selectedDayScale, {
        toValue: 1.18,
        friction: 3,
        tension: 45,
        useNativeDriver: useNative,
      }),
      Animated.spring(selectedDayScale, {
        toValue: 1.0,
        friction: 5,
        tension: 40,
        useNativeDriver: useNative,
      }),
    ]).start();
  };

  const selectedDateObj = new Date(selectedCalendarDay + 'T12:00:00');
  const formattedSelectedHeader = new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : language,
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }
  ).format(selectedDateObj);

  const isSelectedToday = selectedCalendarDay === todayKey;

  // Habits scheduled on the selected day
  const displayHabitsForDay = activeHabits.filter((h) =>
    isHabitScheduledOnDate(h, selectedDateObj)
  );

  const completedHabitsForDay = displayHabitsForDay.filter((h) =>
    completions.some(
      (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === selectedCalendarDay
    )
  );

  const totalDayCount = displayHabitsForDay.length;
  const completedDayCount = completedHabitsForDay.length;
  const dayProgressPercent =
    totalDayCount > 0 ? Math.round((completedDayCount / totalDayCount) * 100) : 0;

  // Smooth animated day progress
  const [animatedDayProgress, setAnimatedDayProgress] = useState(dayProgressPercent);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 450;
    const startVal = animatedDayProgress;
    const endVal = dayProgressPercent;
    let animFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);

      setAnimatedDayProgress(Math.round(startVal + (endVal - startVal) * eased));

      if (progressRatio < 1) {
        animFrameId = requestAnimationFrame(step);
      }
    };

    animFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameId);
  }, [selectedCalendarDay, dayProgressPercent]);

  const dayHeaderKeys = ['days.m', 'days.t', 'days.w', 'days.th', 'days.f', 'days.s', 'days.su'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1120' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Header: [ < ] Calendar */}
      <View style={styles.topHeader}>
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
          {t('calendar.title', 'Calendar')}
        </Text>

        <View style={{ width: 38 }} />
      </View>

      {/* Month Navigator Header */}
      <View style={styles.monthNavRow}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={[
            styles.monthNavBtn,
            {
              backgroundColor: isDark ? '#141D2E' : '#F1F5F9',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>

        <View style={styles.monthTitleWrapper}>
          <Text style={[styles.monthTitleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {monthName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={[
            styles.monthNavBtn,
            {
              backgroundColor: isDark ? '#141D2E' : '#F1F5F9',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={styles.dayLabelsRow}>
        {dayHeaderKeys.map((k, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={[styles.dayLabelText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
              {t(k, DAY_LABELS[i])}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Matrix Rows (7 columns per row) */}
      <Animated.View
        style={[
          styles.calGridContainer,
          {
            opacity: monthGridFade,
            transform: [{ translateX: monthGridSlide }],
          },
        ]}
      >
        {weeks.map((week, wIdx) => (
          <View key={`week-${wIdx}`} style={styles.weekRow}>
            {week.map((item, index) => {
              if (!item) {
                return (
                  <View key={`empty-${wIdx}-${index}`} style={styles.dayCol}>
                    <View style={styles.calNodeWrapper} />
                  </View>
                );
              }

              const scheduledForDay = activeHabits.filter((h) =>
                isHabitScheduledOnDate(h, item.date)
              );
              const doneForDay = scheduledForDay.filter((h) =>
                completions.some(
                  (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === item.key
                )
              );

              const isCurrentToday = item.key === todayKey;
              const isSelected = item.key === selectedCalendarDay;
              const isPast = item.key < todayKey;
              const totalDue = scheduledForDay.length;
              const doneCount = doneForDay.length;

              let nodeType: 'completed' | 'partial' | 'missed' | 'pending' = 'pending';
              if (item.isCurrentMonth && totalDue > 0) {
                if (doneCount === totalDue) {
                  nodeType = 'completed';
                } else if (doneCount > 0) {
                  nodeType = 'partial';
                } else if (isPast) {
                  nodeType = 'missed';
                }
              }

              const nodeTextColor = !item.isCurrentMonth
                ? isDark
                  ? '#334155'
                  : '#CBD5E1'
                : nodeType === 'completed' || nodeType === 'missed' || nodeType === 'partial'
                ? '#FFFFFF'
                : isCurrentToday
                ? isDark
                  ? '#FFFFFF'
                  : '#7C5CFF'
                : isDark
                ? '#FFFFFF'
                : '#0F172A';

              if (nodeType === 'partial') {
                return (
                  <View key={item.key} style={styles.dayCol}>
                    <Animated.View
                      style={{
                        transform: [{ scale: isSelected ? selectedDayScale : 1 }],
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleSelectDay(item.key)}
                        style={[
                          styles.calNodeWrapper,
                          isCurrentToday && styles.todayRing,
                          isSelected && styles.selectedRing,
                        ]}
                      >
                        <LinearGradient
                          colors={['#10B981', '#10B981', '#EF4444', '#EF4444']}
                          locations={[0, 0.5, 0.5, 1]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.calNode,
                            styles.nodePartial,
                            !item.isCurrentMonth && styles.nodeInactiveMonth,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calNodeText,
                              {
                                color: nodeTextColor,
                                fontWeight: isSelected || isCurrentToday ? '900' : '700',
                              },
                            ]}
                          >
                            {item.dayNumber}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                );
              }

              return (
                <View key={item.key} style={styles.dayCol}>
                  <Animated.View
                    style={{
                      transform: [{ scale: isSelected ? selectedDayScale : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSelectDay(item.key)}
                      style={[
                        styles.calNodeWrapper,
                        isCurrentToday && styles.todayRing,
                        isSelected && styles.selectedRing,
                      ]}
                    >
                      <View
                        style={[
                          styles.calNode,
                          nodeType === 'completed' && styles.nodeCompleted,
                          nodeType === 'missed' && styles.nodeMissed,
                          nodeType === 'pending' && {
                            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                            borderWidth: 1,
                          },
                          !item.isCurrentMonth && styles.nodeInactiveMonth,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calNodeText,
                            {
                              color: nodeTextColor,
                              fontWeight: isSelected || isCurrentToday ? '900' : '700',
                            },
                          ]}
                        >
                          {item.dayNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* Status Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('calendar.all_done', 'All Done')}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <LinearGradient
            colors={['#10B981', '#10B981', '#EF4444', '#EF4444']}
            locations={[0, 0.5, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.legendDot}
          />
          <Text style={[styles.legendText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('calendar.partial', 'Partial')}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('calendar.missed', 'Missed')}
          </Text>
        </View>
      </View>

      {/* Selected Day Details Section */}
      <View style={styles.selectedDaySection}>
        <View style={styles.selectedDayHeader}>
          <Text style={[styles.selectedDayTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {formattedSelectedHeader}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {dayProgressPercent === 100 && totalDayCount > 0 && (
              <View style={styles.perfectDayBadge}>
                <LottieAnimation source="trophyAchievement" size={18} />
                <Text style={styles.perfectDayBadgeText}>{t('home.perfect', 'Perfect!')}</Text>
              </View>
            )}
            {isSelectedToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>{t('calendar.today', 'Today')}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.selectedDaySub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {totalDayCount === 0
            ? t('calendar.no_habits_scheduled', 'No habits scheduled for this day')
            : t('calendar.completed_summary', `${completedDayCount} of ${totalDayCount} completed (${animatedDayProgress}%)`, {
                completed: completedDayCount,
                total: totalDayCount,
                percent: animatedDayProgress,
              })}
        </Text>

        {totalDayCount > 0 && (
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${animatedDayProgress}%`,
                  backgroundColor: animatedDayProgress === 100 ? '#10B981' : '#7C5CFF',
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Habits on that day */}
      <View style={styles.habitsListContainer}>
        {displayHabitsForDay.length > 0 ? (
          displayHabitsForDay.map((habit) => {
            const isHabitDone = completions.some(
              (c) =>
                c.habit_id === habit.id &&
                (c.completion_date || '').split('T')[0] === selectedCalendarDay
            );

            return (
              <View
                key={habit.id}
                style={[
                  styles.habitItemCard,
                  {
                    backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.habitItemLeft}>
                  <DuotoneIconBadge
                    name={habit.icon}
                    color={habit.color || '#7C5CFF'}
                    size={18}
                    containerSize={38}
                    borderRadius={13}
                  />
                  <View>
                    <Text style={[styles.habitItemName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      {tHabitName(habit.name)}
                    </Text>
                    <Text style={[styles.habitItemFreq, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      {habit.frequency_type === 'daily' ? t('common.daily', 'Daily') : t('common.custom_days', 'Custom Days')}
                    </Text>
                  </View>
                </View>

                {isHabitDone ? (
                  <View style={styles.doneStatusBadge}>
                    <LottieAnimation source="streakFlame" size={16} />
                    <Text style={styles.doneStatusText}>{t('common.done', 'Done')}</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.pendingStatusBadge,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                    ]}
                  >
                    <Text style={[styles.pendingStatusText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                      {t('home.filter_pending', 'Pending')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyDayBox}>
            <Text style={[styles.emptyDayText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
              {t('calendar.no_habits_due', 'No habits due on this date.')}
            </Text>
          </View>
        )}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
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
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  calGridContainer: {
    paddingHorizontal: 16,
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calNodeWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    borderWidth: 2,
    borderColor: '#7C5CFF',
    borderRadius: 21,
  },
  selectedRing: {
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 21,
  },
  calNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodeCompleted: {
    backgroundColor: '#10B981',
    borderRadius: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeMissed: {
    backgroundColor: '#EF4444',
    borderRadius: 18,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  nodePartial: {
    borderRadius: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeInactiveMonth: {
    opacity: 0.25,
  },
  calNodeText: {
    fontSize: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectedDaySection: {
    paddingHorizontal: 20,
    marginTop: 6,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  todayBadge: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  perfectDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  perfectDayBadgeText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '800',
  },
  selectedDaySub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  habitsListContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  habitItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  habitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  habitItemFreq: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  doneStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doneStatusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  pendingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendingStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyDayBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 12,
  },
});
