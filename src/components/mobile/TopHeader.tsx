import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { WifiOff, Sparkles, Moon, Sun } from 'lucide-react-native';

export const TopHeader: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    isOffline,
    setIsOffline,
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
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {getGreetingTime()}, {user?.name ? user.name.split(' ')[0] : 'Hero'}! 👋
        </Text>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {t('home.tagline', "Let's crush today!")}
        </Text>
      </View>

      <View style={styles.actionRow}>
        {/* Offline status button */}
        <TouchableOpacity
          onPress={() => {
            const nextOffline = !isOffline;
            setIsOffline(nextOffline);
            showToast(
              nextOffline
                ? t('home.offline_mode_active', 'Switched to Offline Mode (Mutations cached locally)')
                : t('home.online_mode_active', 'Back Online! Synchronized with storage'),
              undefined,
              nextOffline ? 'warning' : 'success'
            );
          }}
          style={[
            styles.iconBtn,
            isOffline && { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
          ]}
        >
          {isOffline ? (
            <WifiOff size={18} color="#FBBF24" />
          ) : (
            <Sparkles size={18} color={isDark ? '#94A3B8' : '#64748B'} />
          )}
        </TouchableOpacity>

        {/* Theme toggle */}
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
          {theme === 'dark' ? (
            <Sun size={18} color="#FDE047" />
          ) : (
            <Moon size={18} color="#6366F1" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    position: 'relative',
  },
});
