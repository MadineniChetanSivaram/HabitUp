import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { Sun, Moon, WifiOff, Settings } from 'lucide-react-native';
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
    t,
  } = useHabit();

  const isDark = theme === 'dark';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting_morning', 'Good morning');
    if (hour < 18) return t('home.greeting_afternoon', 'Good afternoon');
    return t('home.greeting_evening', 'Good evening');
  };

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

          <TouchableOpacity onPress={toggleTheme} style={styles.actionBtn}>
            {theme === 'dark' ? (
              <Sun size={18} color="#FDE047" />
            ) : (
              <Moon size={18} color="#6366F1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            style={styles.actionBtn}
          >
            <Settings size={18} color={isDark ? '#94A3B8' : '#475569'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Body: Catchphrase & Mascot */}
      <View style={styles.bodyRow}>
        <View style={styles.headlineCol}>
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
    gap: 4,
  },
  offlineBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 10,
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
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  mascotCol: {
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 10,
  },
});
