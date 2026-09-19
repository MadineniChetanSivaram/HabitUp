import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { Sun, Moon, WifiOff, Settings, Flame, Zap } from 'lucide-react-native';
import { HabitlyMascot } from './HabitlyMascot';

interface HomeHeroProps {
  onMascotClick?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onMascotClick }) => {
  const {
    user,
    theme,
    toggleTheme,
    isOffline,
    setIsOffline,
    setActiveTab,
    showToast,
    overallStats,
    t,
  } = useHabit();

  const isDark = theme === 'dark';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting_morning', 'Good morning');
    if (hour < 18) return t('home.greeting_afternoon', 'Good afternoon');
    return t('home.greeting_evening', 'Good evening');
  };

  const currentStreak = Math.max(
    overallStats.plantStreak?.currentStreak ?? 0,
    overallStats.currentBestStreak ?? 0
  );

  return (
    <View style={styles.container}>
      {/* Top Action Icons Row */}
      <View style={styles.topRow}>
        <Text style={[styles.greeting, { color: isDark ? '#E2E8F0' : '#0F172A' }]}>
          {getGreetingTime()}, {user?.name ? user.name.split(' ')[0] : 'Hero'}! 👋
        </Text>

        <View style={styles.iconActions}>
          {isOffline && (
            <TouchableOpacity
              onPress={() => {
                setIsOffline(false);
                showToast(
                  t('home.online_mode_active', 'Back Online! Synchronized with storage'),
                  undefined,
                  'success'
                );
              }}
              style={styles.offlineBtn}
            >
              <WifiOff size={14} color="#F59E0B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#FDE047" />
            ) : (
              <Moon size={17} color="#6366F1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Settings size={17} color={isDark ? '#94A3B8' : '#475569'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Body: Catchphrase, Momentum Pill & Mascot */}
      <View style={styles.bodyRow}>
        <View style={styles.headlineCol}>
          <View
            style={[
              styles.momentumPill,
              currentStreak > 0
                ? {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.3)',
                  }
                : {
                    backgroundColor: isDark ? 'rgba(124, 92, 255, 0.15)' : 'rgba(124, 92, 255, 0.08)',
                    borderColor: isDark ? 'rgba(124, 92, 255, 0.3)' : 'rgba(124, 92, 255, 0.2)',
                  },
            ]}
          >
            {currentStreak > 0 ? (
              <>
                <Flame size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.momentumText, { color: isDark ? '#FDE68A' : '#B45309' }]}>
                  {currentStreak} {t('home.day_streak', 'Day Streak')} 🔥
                </Text>
              </>
            ) : (
              <>
                <Zap size={12} color="#7C5CFF" fill="#7C5CFF" />
                <Text style={[styles.momentumText, { color: isDark ? '#C7D2FE' : '#4F46E5' }]}>
                  {t('home.start_momentum', "Today's Momentum")}
                </Text>
              </>
            )}
          </View>

          <Text style={[styles.headline, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {t('home.tagline', "Let's crush today!")}
          </Text>
        </View>

        <View style={styles.mascotCol}>
          <HabitlyMascot onClick={onMascotClick} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    overflow: 'visible',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    position: 'relative',
    zIndex: 50,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 60,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'visible',
    position: 'relative',
    zIndex: 10,
  },
  headlineCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  momentumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 6,
  },
  momentumText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  mascotCol: {
    width: 156,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
    zIndex: 10,
  },
});
