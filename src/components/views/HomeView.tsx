import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { HomeHero } from '../mobile/HomeHero';
import { DateStrip } from '../mobile/DateStrip';
import { TodayProgressCard } from '../mobile/TodayProgressCard';
import { HabitCard } from '../mobile/HabitCard';
import { isHabitScheduledOnDate, formatDateKey } from '../../utils/streakCalculator';
import { Plus, Sparkles } from 'lucide-react-native';
import { LottieAnimation } from '../common/LottieAnimation';

export const HomeView: React.FC = () => {
  const {
    habits,
    completions,
    selectedDate,
    theme,
    setIsCreateModalOpen,
    setIsOnboardingModalOpen,
    t,
    language,
  } = useHabit();

  const isDark = theme === 'dark';
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  const selectedDateTime = new Date(selectedDate + 'T12:00:00');
  const activeHabits = habits.filter(
    (h) => !h.archived_at && !h.deleted_at && !h.paused_at
  );

  const scheduledHabits = activeHabits.filter((h) =>
    isHabitScheduledOnDate(h, selectedDateTime)
  );

  const filteredHabits = scheduledHabits.filter((h) => {
    const isDone = completions.some(
      (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === selectedDate
    );
    if (filterMode === 'pending') return !isDone;
    if (filterMode === 'completed') return isDone;
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1120' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <HomeHero />
      <DateStrip />
      <TodayProgressCard />

      {/* Habits Section Header & Filter Tabs */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {selectedDate === formatDateKey(new Date())
              ? t('home.todays_habits', "Today's Habits")
              : `${t('tab.habits', 'Habits')} (${new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, { month: 'short', day: 'numeric', weekday: 'short' }).format(selectedDateTime)})`}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isDark ? 'rgba(124, 92, 255, 0.16)' : 'rgba(124, 92, 255, 0.1)' },
            ]}
          >
            <Text style={[styles.badgeText, { color: isDark ? '#A78BFA' : '#7C5CFF' }]}>
              {filteredHabits.length}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        {scheduledHabits.length > 0 && (
          <View style={styles.filterRow}>
            {(['all', 'pending', 'completed'] as const).map((mode) => {
              const isActive = filterMode === mode;
              const label =
                mode === 'all'
                  ? t('home.filter_all', 'All')
                  : mode === 'pending'
                  ? t('home.filter_pending', 'Pending')
                  : t('home.filter_completed', 'Done');
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setFilterMode(mode)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? isDark
                          ? '#7C5CFF'
                          : '#7C5CFF'
                        : isDark
                        ? '#141D2E'
                        : '#F1F5F9',
                      borderColor: isActive
                        ? '#7C5CFF'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#E2E8F0',
                    },
                    isActive && styles.activeFilterChip,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive
                          ? '#FFFFFF'
                          : isDark
                          ? '#94A3B8'
                          : '#64748B',
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Habit List */}
      <View style={styles.listContainer}>
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))
        ) : activeHabits.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
              },
            ]}
          >
            <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <LottieAnimation source="mascotWaving" size={80} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {t('home.no_habits', 'No habits yet!')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {t(
                'home.no_habits_desc',
                'Choose from popular templates or create a custom habit to start building your streak.'
              )}
            </Text>

            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={[styles.templateBtn, { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' }]}
                onPress={() => setIsOnboardingModalOpen(true)}
                activeOpacity={0.8}
              >
                <Sparkles size={15} color="#FFFFFF" />
                <Text style={[styles.templateBtnText, { color: '#FFFFFF' }]}>
                  {t('home.browse_templates', 'Browse Templates')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setIsCreateModalOpen(true)}
                activeOpacity={0.8}
              >
                <Plus size={15} color={isDark ? '#F8FAFC' : '#0F172A'} />
                <Text style={[styles.addBtnText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {t('home.custom_habit', 'Custom Habit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
              },
            ]}
          >
            <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <LottieAnimation source="zenMeditation" size={80} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {filterMode === 'completed'
                ? t('home.no_habits_completed', 'No habits completed yet')
                : filterMode === 'pending'
                ? t('home.all_completed', 'All pending habits completed!')
                : scheduledHabits.length === 0
                ? t('home.no_habits_for_day', 'No habits scheduled for today')
                : t('home.all_completed', 'All scheduled habits completed!')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {scheduledHabits.length === 0
                ? t('home.enjoy_rest_day', 'Enjoy your rest day or add a new habit.')
                : t('home.all_completed_desc', 'Great job maintaining consistency today!')}
            </Text>

            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setIsCreateModalOpen(true)}
                activeOpacity={0.8}
              >
                <Plus size={15} color="#FFFFFF" />
                <Text style={styles.addBtnText}>{t('home.add_habit', 'Add Habit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.templateBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                  },
                ]}
                onPress={() => setIsOnboardingModalOpen(true)}
                activeOpacity={0.8}
              >
                <Sparkles size={15} color="#7C5CFF" />
                <Text style={[styles.templateBtnText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {t('home.templates', 'Templates')}
                </Text>
              </TouchableOpacity>
            </View>
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeFilterChip: {
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyBox: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  emptyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  addBtn: {
    backgroundColor: '#7C5CFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  templateBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
