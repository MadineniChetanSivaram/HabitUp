import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { HabitlyMascot } from '../mobile/HabitlyMascot';
import {
  X,
  LayoutGrid,
  Smartphone,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  Info,
  Palette,
  Layers,
} from 'lucide-react-native';

export type WidgetType = 'small' | 'medium' | 'lockscreen';
export type WidgetBackgroundTheme = 'glass' | 'midnight' | 'emerald' | 'sunset' | 'slate';

export const WidgetPreviewModal: React.FC = () => {
  const {
    isWidgetModalOpen,
    setIsWidgetModalOpen,
    habits,
    completions,
    selectedDate,
    overallStats,
    toggleCompletion,
    widgetTheme,
    setWidgetTheme,
    theme,
  } = useHabit();

  const isDark = theme === 'dark';
  const [activeWidgetType, setActiveWidgetType] = useState<WidgetType>('medium');

  if (!isWidgetModalOpen) return null;

  // Active scheduled habits
  const activeHabits = habits.filter((h) => !h.archived_at && !h.deleted_at && !h.paused_at);
  const completedToday = activeHabits.filter((h) =>
    completions.some(
      (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === selectedDate
    )
  );
  const totalCount = activeHabits.length;
  const completedCount = completedToday.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentStreak = overallStats.plantStreak?.currentStreak ?? overallStats.currentBestStreak ?? 7;

  // Theme styling for the simulated widget
  const getWidgetThemeStyles = () => {
    switch (widgetTheme) {
      case 'midnight':
        return {
          bg: '#0F172A',
          border: '#38BDF8',
          text: '#F8FAFC',
          subtext: '#94A3B8',
          cardBg: 'rgba(255, 255, 255, 0.06)',
          accent: '#38BDF8',
        };
      case 'emerald':
        return {
          bg: '#064E3B',
          border: '#34D399',
          text: '#ECFDF5',
          subtext: '#A7F3D0',
          cardBg: 'rgba(255, 255, 255, 0.08)',
          accent: '#10B981',
        };
      case 'sunset':
        return {
          bg: '#7C2D12',
          border: '#FBBF24',
          text: '#FFFBEB',
          subtext: '#FDE68A',
          cardBg: 'rgba(255, 255, 255, 0.08)',
          accent: '#F59E0B',
        };
      case 'slate':
        return {
          bg: '#18181B',
          border: '#52525B',
          text: '#FAFAFA',
          subtext: '#A1A1AA',
          cardBg: 'rgba(255, 255, 255, 0.05)',
          accent: '#A1A1AA',
        };
      case 'glass':
      default:
        return {
          bg: isDark ? 'rgba(30, 41, 59, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          border: isDark ? 'rgba(124, 92, 255, 0.4)' : 'rgba(124, 92, 255, 0.3)',
          text: isDark ? '#FFFFFF' : '#0F172A',
          subtext: isDark ? '#94A3B8' : '#64748B',
          cardBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
          accent: '#7C5CFF',
        };
    }
  };

  const widgetStyles = getWidgetThemeStyles();

  return (
    <Modal
      visible={isWidgetModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsWidgetModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}
        >
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.iconBadge}>
                <LayoutGrid size={18} color="#7C5CFF" />
              </View>
              <View>
                <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Home & Lock Screen Widgets
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Keep Sparky & habits on your home screen! 📱✨
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsWidgetModalOpen(false)}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Widget Size Selector Tabs */}
          <View style={styles.sizeTabsRow}>
            {[
              { type: 'small', label: 'Small 2x2', icon: '📱' },
              { type: 'medium', label: 'Medium 4x2', icon: '📲' },
              { type: 'lockscreen', label: 'Lock Screen', icon: '🔒' },
            ].map((item) => {
              const isActive = activeWidgetType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => setActiveWidgetType(item.type as WidgetType)}
                  style={[
                    styles.sizeTab,
                    isActive
                      ? { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' }
                      : {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                        },
                  ]}
                >
                  <Text style={styles.sizeTabIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.sizeTabLabel,
                      { color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Simulated Home Screen Wallpaper Canvas */}
          <View style={styles.canvasContainer}>
            {/* 1. SMALL 2x2 MASCOT WIDGET */}
            {activeWidgetType === 'small' && (
              <View
                style={[
                  styles.smallWidgetCard,
                  {
                    backgroundColor: widgetStyles.bg,
                    borderColor: widgetStyles.border,
                  },
                ]}
              >
                <View style={styles.smallWidgetTop}>
                  <View style={styles.smallStreakPill}>
                    <Flame size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.smallStreakText}>{currentStreak}d</Text>
                  </View>
                  <Text style={[styles.smallProgressText, { color: widgetStyles.accent }]}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>

                <View style={styles.smallWidgetCenter}>
                  <HabitlyMascot size={78} />
                </View>

                <View style={styles.smallWidgetBottom}>
                  <View style={styles.smallProgressBarBg}>
                    <View
                      style={[
                        styles.smallProgressBarFill,
                        { width: `${progressPercent}%`, backgroundColor: widgetStyles.accent },
                      ]}
                    />
                  </View>
                  <Text style={[styles.smallTagline, { color: widgetStyles.subtext }]}>
                    {progressPercent === 100 ? 'Feast King! 🎋😋' : 'HabitUp Today'}
                  </Text>
                </View>
              </View>
            )}

            {/* 2. MEDIUM 4x2 HABIT PROGRESS WIDGET */}
            {activeWidgetType === 'medium' && (
              <View
                style={[
                  styles.mediumWidgetCard,
                  {
                    backgroundColor: widgetStyles.bg,
                    borderColor: widgetStyles.border,
                  },
                ]}
              >
                {/* Left: Mascot Column */}
                <View style={styles.mediumLeftCol}>
                  <HabitlyMascot size={74} />
                  <View style={styles.mediumStreakPill}>
                    <Flame size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.mediumStreakText}>{currentStreak} Day Streak</Text>
                  </View>
                </View>

                {/* Right: Interactive Quick Check Habit List */}
                <View style={styles.mediumRightCol}>
                  <View style={styles.mediumHeaderRow}>
                    <Text style={[styles.mediumTitle, { color: widgetStyles.text }]}>
                      Today's Focus
                    </Text>
                    <Text style={[styles.mediumRatio, { color: widgetStyles.accent }]}>
                      {completedCount}/{totalCount} Done
                    </Text>
                  </View>

                  <ScrollView style={styles.mediumHabitsList} showsVerticalScrollIndicator={false}>
                    {activeHabits.slice(0, 3).map((h) => {
                      const isDone = completions.some(
                        (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === selectedDate
                      );
                      return (
                        <TouchableOpacity
                          key={h.id}
                          onPress={() => toggleCompletion(h.id)}
                          style={[
                            styles.mediumHabitItem,
                            { backgroundColor: widgetStyles.cardBg },
                          ]}
                          activeOpacity={0.7}
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} color="#10B981" />
                          ) : (
                            <Circle size={16} color={widgetStyles.subtext} />
                          )}
                          <Text
                            style={[
                              styles.mediumHabitName,
                              {
                                color: isDone ? widgetStyles.subtext : widgetStyles.text,
                                textDecorationLine: isDone ? 'line-through' : 'none',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {h.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* 3. LOCK SCREEN CIRCULAR / DYNAMIC ISLAND WIDGET */}
            {activeWidgetType === 'lockscreen' && (
              <View style={styles.lockScreenWrapper}>
                {/* Dynamic Island Capsule */}
                <View style={styles.dynamicIslandCapsule}>
                  <Text style={styles.diEmoji}>🎋</Text>
                  <Text style={styles.diText}>Sparky Habit: {progressPercent}%</Text>
                  <View style={styles.diFlame}>
                    <Flame size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.diStreak}>{currentStreak}</Text>
                  </View>
                </View>

                {/* Lock Screen Circular Widget */}
                <View style={styles.lockScreenCircularWidget}>
                  <View style={styles.lsProgressRing}>
                    <Text style={styles.lsMascotEmoji}>🐾</Text>
                    <Text style={styles.lsRatioText}>{completedCount}/{totalCount}</Text>
                  </View>
                  <Text style={styles.lsWidgetLabel}>Habits</Text>
                </View>
              </View>
            )}
          </View>

          {/* Theme Switcher for Widgets */}
          <View style={styles.themeSection}>
            <View style={styles.themeSectionHeader}>
              <Palette size={14} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text style={[styles.themeSectionTitle, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                Widget Theme Style
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
              {[
                { key: 'glass', label: 'Glassmorphism', color: '#7C5CFF' },
                { key: 'midnight', label: 'Midnight Aurora', color: '#38BDF8' },
                { key: 'emerald', label: 'Emerald Garden', color: '#10B981' },
                { key: 'sunset', label: 'Sunset Amber', color: '#F59E0B' },
                { key: 'slate', label: 'Dark Slate', color: '#71717A' },
              ].map((tItem) => {
                const isSelected = widgetTheme === tItem.key;
                return (
                  <TouchableOpacity
                    key={tItem.key}
                    onPress={() => setWidgetTheme(tItem.key as WidgetBackgroundTheme)}
                    style={[
                      styles.themeTab,
                      isSelected
                        ? { borderColor: tItem.color, backgroundColor: `${tItem.color}22` }
                        : { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                    ]}
                  >
                    <View style={[styles.themeDot, { backgroundColor: tItem.color }]} />
                    <Text
                      style={[
                        styles.themeTabLabel,
                        { color: isSelected ? tItem.color : isDark ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {tItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Installation Guide Accordion */}
          <View
            style={[
              styles.guideCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.guideHeader}>
              <Smartphone size={16} color="#7C5CFF" />
              <Text style={[styles.guideTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                How to Add to Home Screen:
              </Text>
            </View>
            <Text style={[styles.guideStep, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              • <Text style={{ fontWeight: '700' }}>iOS</Text>: Long press Home Screen ➔ Tap <Text style={{ color: '#7C5CFF', fontWeight: '700' }}>(+)</Text> in top corner ➔ Search "HabitUp" ➔ Choose Size.
            </Text>
            <Text style={[styles.guideStep, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              • <Text style={{ fontWeight: '700' }}>Android</Text>: Long press empty space ➔ Tap <Text style={{ color: '#7C5CFF', fontWeight: '700' }}>Widgets</Text> ➔ Drag HabitUp widget.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 92, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sizeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  sizeTabIcon: {
    fontSize: 13,
  },
  sizeTabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  canvasContainer: {
    backgroundColor: '#0B1120',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 180,
    position: 'relative',
    marginBottom: 16,
  },
  smallWidgetCard: {
    width: 148,
    height: 148,
    borderRadius: 24,
    borderWidth: 1.8,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  smallWidgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  smallStreakText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  smallProgressText: {
    fontSize: 11,
    fontWeight: '800',
  },
  smallWidgetCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallWidgetBottom: {
    gap: 3,
  },
  smallProgressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  smallProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  smallTagline: {
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  mediumWidgetCard: {
    width: '100%',
    height: 140,
    borderRadius: 24,
    borderWidth: 1.8,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  mediumLeftCol: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mediumStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  mediumStreakText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  mediumRightCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mediumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mediumTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  mediumRatio: {
    fontSize: 11,
    fontWeight: '700',
  },
  mediumHabitsList: {
    flex: 1,
  },
  mediumHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
    gap: 7,
  },
  mediumHabitName: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  lockScreenWrapper: {
    alignItems: 'center',
    gap: 14,
  },
  dynamicIslandCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  diEmoji: {
    fontSize: 13,
  },
  diText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  diFlame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  diStreak: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  lockScreenCircularWidget: {
    alignItems: 'center',
    gap: 4,
  },
  lsProgressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lsMascotEmoji: {
    fontSize: 16,
  },
  lsRatioText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  lsWidgetLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  themeSection: {
    marginBottom: 16,
  },
  themeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  themeSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeScroll: {
    gap: 8,
  },
  themeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeTabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  guideCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 5,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  guideStep: {
    fontSize: 11,
    lineHeight: 16,
  },
});
