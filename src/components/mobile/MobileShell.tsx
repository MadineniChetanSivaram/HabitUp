import React from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useHabit } from '../../context/HabitContext';
import { Toast } from '../common/Toast';
import { BottomTabBar } from './BottomTabBar';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { theme, isAuthenticated } = useHabit();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  // Ensure Android status bar height + extra breathing room is strictly padded
  const topPadding = Platform.OS === 'android'
    ? Math.max(insets.top, RNStatusBar.currentHeight || 0, 24)
    : insets.top;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: isDark ? '#050914' : '#E2E8F0',
        },
      ]}
    >
      <View
        style={[
          styles.safeArea,
          {
            backgroundColor: isDark ? '#0B1120' : '#F8FAFC',
            paddingTop: topPadding,
            paddingBottom: insets.bottom,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} translucent />
        <View style={styles.mainContainer}>
          {children}
        </View>

        <Toast />
        {isAuthenticated && <BottomTabBar />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: '100vh',
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(124, 92, 255, 0.12) 0%, transparent 65%), radial-gradient(ellipse at 85% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)',
        } as any)
      : {}),
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          maxHeight: '100vh',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        } as any)
      : {}),
  },
  mainContainer: {
    flex: 1,
    width: '100%',
  },
});
