import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { X, Clock } from 'lucide-react-native';
import { InAppNotification, addInAppNotificationListener } from '../../services/notificationService';
import { useHabit } from '../../context/HabitContext';
import { HabitlyMascot } from '../mobile/HabitlyMascot';
import { formatTo12Hour } from '../../utils/streakCalculator';

export const NotificationBanner: React.FC = () => {
  const { toggleCompletion, theme, t } = useHabit();
  const [currentNotification, setCurrentNotification] = useState<InAppNotification | null>(null);
  const isDark = theme === 'dark';
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = addInAppNotificationListener((notif) => {
      setCurrentNotification(notif);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 14,
          stiffness: 120,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return unsubscribe;
  }, []);

  // Auto dismiss after 7 seconds
  useEffect(() => {
    if (!currentNotification) return;
    const timer = setTimeout(() => {
      dismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [currentNotification]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentNotification(null);
    });
  };

  if (!currentNotification) return null;

  const handleComplete = () => {
    if (currentNotification.habitId) {
      toggleCompletion(currentNotification.habitId);
    }
    dismiss();
  };

  const AnimatedView = Animated.View as any;

  // Clean any remaining emoji glyphs for pure, high-clarity typography
  const cleanTitle = (currentNotification.title || '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanBody = (currentNotification.body || '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <AnimatedView
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
            borderColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}
      >
        {/* Left: Animated Panda Mascot with Current Expression */}
        <View
          style={[
            styles.mascotBadge,
            {
              backgroundColor: isDark ? 'rgba(124, 92, 255, 0.12)' : '#F5F3FF',
              borderColor: isDark ? 'rgba(124, 92, 255, 0.25)' : 'rgba(124, 92, 255, 0.2)',
            },
          ]}
        >
          <HabitlyMascot
            size={36}
            forcedMood={currentNotification.mascotMood}
            forcedExpression={currentNotification.mascotExpression}
            hideSpeechBubble
            disableAura
            disableZzz
          />
        </View>

        {/* Center Text Info: Only Sparky Emotion Title */}
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}
            numberOfLines={2}
          >
            {cleanTitle}
          </Text>
        </View>

        {/* Right Timestamp Badge & Dismiss */}
        <View style={styles.rightColumn}>
          {currentNotification.reminderTime ? (
            <View style={styles.timeTag}>
              <Clock size={11} color="#C084FC" />
              <Text style={styles.timeText}>{formatTo12Hour(currentNotification.reminderTime)}</Text>
            </View>
          ) : (
            <View style={styles.timeTag}>
              <Clock size={11} color="#C084FC" />
              <Text style={styles.timeText}>{t('common.just_now', 'Just now')}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.dismissBtn} onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={15} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 48,
    left: 14,
    right: 14,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    gap: 12,
  },
  mascotBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 92, 255, 0.2)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C084FC',
  },
  dismissBtn: {
    padding: 4,
  },
});
