import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useHabit } from '../../context/HabitContext';
import { soundService } from '../../services/soundService';
import { HabitlyMascot } from '../mobile/HabitlyMascot';
import { Flame, Check, Trophy } from 'lucide-react-native';

const CELEBRATION_MESSAGES = [
  'Hi! You did it! 🎉 All habits completed today!',
  'Nom nom nom! 🎋 That bamboo is delicious! You fed me a full stalk!',
  '100% Perfection! Your streak is burning bright! 🔥',
  'Woohoo! Day fully conquered! Keep this energy going! 🏆',
];

export const DayCompletionCelebrationModal: React.FC = () => {
  const {
    isDayCompletionModalOpen,
    setIsDayCompletionModalOpen,
    theme,
    overallStats,
    soundEnabled,
    hapticsEnabled,
    t,
  } = useHabit();

  const isDark = theme === 'dark';

  // Animation values
  const slideAnim = useRef(new Animated.Value(450)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const coinPopAnim = useRef(new Animated.Value(0)).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isDayCompletionModalOpen) {
      slideAnim.setValue(450);
      scaleAnim.setValue(0.7);
      coinPopAnim.setValue(0);
      return;
    }

    const useNative = Platform.OS !== 'web';
    setMessageIndex(Math.floor(Math.random() * CELEBRATION_MESSAGES.length));

    // Spring-based Slide up from bottom with scale bounce
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: useNative,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 45,
        useNativeDriver: useNative,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.spring(coinPopAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: useNative,
        }),
      ]),
    ]).start();
  }, [isDayCompletionModalOpen]);

  const handleDismiss = () => {
    if (soundEnabled) {
      soundService.playClickSound();
    }
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 220,
        easing: Easing.in(Easing.back(1.5)),
        useNativeDriver: useNative,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 220,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      setIsDayCompletionModalOpen(false);
    });
  };

  const streakDays = Math.max(
    overallStats.plantStreak?.currentStreak ?? overallStats.currentBestStreak ?? 1,
    1
  );

  return (
    <Modal
      visible={isDayCompletionModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalBackdrop}>
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Banner Sparkle */}
          <View style={styles.topBadgeRow}>
            <View style={styles.trophyBadge}>
              <Trophy size={14} color="#F59E0B" />
              <Text style={styles.trophyBadgeText}>
                {t('celebration.perfect_day', 'PERFECT 100% DAY!')}
              </Text>
            </View>
          </View>

          {/* Speech Bubble (Duolingo Style) */}
          <View style={styles.speechBubbleWrapper}>
            <View
              style={[
                styles.speechBubble,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            >
              <Text style={[styles.speechBubbleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {CELEBRATION_MESSAGES[messageIndex]}
              </Text>
              {/* Pointer arrow pointing down to Panda */}
              <View
                style={[
                  styles.speechArrow,
                  {
                    borderTopColor: isDark ? '#1E293B' : '#F1F5F9',
                  },
                ]}
              />
            </View>
          </View>

          {/* Sparky Feast Stage (Cute animated panda munching bamboo) */}
          <View style={styles.pandaStage}>
            <HabitlyMascot size={135} forcedMood="celebrating" />
          </View>

          {/* Rewards Grid */}
          <Animated.View
            style={[
              styles.rewardsGrid,
              {
                opacity: coinPopAnim,
                transform: [
                  {
                    scale: coinPopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Coin Bonus Pill */}
            <View
              style={[
                styles.rewardCard,
                {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#DCFCE7',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#86EFAC',
                },
              ]}
            >
              <Text style={styles.rewardEmoji}>🎋</Text>
              <View>
                <Text style={[styles.rewardTitle, { color: '#10B981' }]}>+15 Bamboo</Text>
                <Text style={[styles.rewardSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Coins Added
                </Text>
              </View>
            </View>

            {/* Streak Bonus Pill */}
            <View
              style={[
                styles.rewardCard,
                {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FCD34D',
                },
              ]}
            >
              <Flame size={22} color="#F59E0B" />
              <View>
                <Text style={[styles.rewardTitle, { color: '#F59E0B' }]}>{streakDays}d Streak</Text>
                <Text style={[styles.rewardSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Active & On Fire!
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Duolingo-style Action Dismiss Button */}
          <TouchableOpacity
            style={styles.awesomeBtn}
            onPress={handleDismiss}
            activeOpacity={0.85}
          >
            <ExpoLinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.awesomeBtnGradient}
            >
              <Check size={20} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.awesomeBtnText}>
                {t('celebration.continue_btn', 'AWESOME!')}
              </Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.82)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 16,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  topBadgeRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trophyBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  speechBubbleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  speechBubble: {
    position: 'relative',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    maxWidth: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  speechBubbleText: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 19,
  },
  speechArrow: {
    position: 'absolute',
    bottom: -9,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pandaStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    height: 175,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 12,
  },
  rewardCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    gap: 10,
  },
  rewardEmoji: {
    fontSize: 22,
  },
  rewardTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  rewardSub: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  awesomeBtn: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  awesomeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  awesomeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
