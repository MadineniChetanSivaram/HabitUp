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
  Dimensions,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Path,
  Circle,
  Ellipse,
  Line,
  Rect,
} from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useHabit } from '../../context/HabitContext';
import { soundService } from '../../services/soundService';
import { Sparkles, Flame, Check, Trophy } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CELEBRATION_MESSAGES = [
  'Hi! You did it! 🎉 All habits completed today!',
  'Nom nom nom! 🎋 Delicious bamboo! You fed me a full stalk!',
  '100% Perfection! Your streak is burning bright! 🔥',
  'Woohoo! Day fully conquered! Rest well champion! 🏆',
];

export const DayCompletionCelebrationModal: React.FC = () => {
  const {
    isDayCompletionModalOpen,
    setIsDayCompletionModalOpen,
    theme,
    overallStats,
    equippedHat,
    equippedGlasses,
    soundEnabled,
    hapticsEnabled,
    t,
  } = useHabit();

  const isDark = theme === 'dark';

  // Animation values
  const slideAnim = useRef(new Animated.Value(450)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const chewAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const coinPopAnim = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;
  const crumbAnim = useRef(new Animated.Value(0)).current;

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

    // 1. Spring-based Slide up from bottom
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
        Animated.delay(400),
        Animated.spring(coinPopAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: useNative,
        }),
      ]),
    ]).start();

    // 2. Rhythmic Chewing / Munching loop
    const chewLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chewAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(chewAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    chewLoop.start();

    // 3. Bamboo Crumb Sparkles Loop
    const crumbLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(crumbAnim, {
          toValue: 1,
          duration: 440,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(crumbAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: useNative,
        }),
      ])
    );
    crumbLoop.start();

    // 4. Cheerful Wave loop
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: -8,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(waveAnim, {
          toValue: 8,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    waveLoop.start();

    // 5. Gentle floating breathe loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 6. Glowing Aura Pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(auraPulse, {
          toValue: 0.9,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    auraLoop.start();

    return () => {
      chewLoop.stop();
      crumbLoop.stop();
      waveLoop.stop();
      floatLoop.stop();
      auraLoop.stop();
    };
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
        duration: 250,
        easing: Easing.in(Easing.back(1.5)),
        useNativeDriver: useNative,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 250,
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

          {/* Panda Stage with Munching Animation */}
          <View style={styles.pandaStage}>
            {/* Aura Glow */}
            <Animated.View
              style={[
                styles.auraCircle,
                {
                  transform: [{ scale: auraPulse }],
                },
              ]}
            />

            {/* Sparky Character */}
            <Animated.View
              style={{
                transform: [
                  { translateY: floatAnim },
                  { rotate: waveAnim.interpolate({ inputRange: [-8, 8], outputRange: ['-3deg', '3deg'] }) },
                ],
              }}
            >
              <Svg width={170} height={170} viewBox="0 0 160 160">
                <Defs>
                  <RadialGradient id="feastFurGrad" cx="50%" cy="35%" r="65%">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="60%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#C2410C" />
                  </RadialGradient>
                  <LinearGradient id="feastDarkFur" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3F1D0B" />
                    <Stop offset="100%" stopColor="#240F05" />
                  </LinearGradient>
                  <LinearGradient id="bambooGreen" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#4ADE80" />
                    <Stop offset="50%" stopColor="#22C55E" />
                    <Stop offset="100%" stopColor="#15803D" />
                  </LinearGradient>
                  <LinearGradient id="feastCrown" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="60%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </LinearGradient>
                </Defs>

                {/* Ears */}
                <G id="ears">
                  <Path d="M 36 50 C 26 30, 40 18, 56 30 C 60 36, 56 46, 48 52 Z" fill="url(#feastFurGrad)" />
                  <Path d="M 38 48 C 30 34, 42 26, 52 34 Z" fill="#FFFFFF" />
                  <Path d="M 124 50 C 134 30, 120 18, 104 30 C 100 36, 104 46, 112 52 Z" fill="url(#feastFurGrad)" />
                  <Path d="M 122 48 C 130 34, 118 26, 108 34 Z" fill="#FFFFFF" />
                </G>

                {/* Equipped Hat */}
                {equippedHat === 'detective' && (
                  <G id="hat-detective">
                    <Path d="M 52 40 C 50 24, 62 18, 80 18 C 98 18, 110 24, 108 40 Z" fill="#78350F" />
                    <Path d="M 54 34 Q 80 30 106 34" stroke="#92400E" strokeWidth={2.5} fill="none" />
                    <Path d="M 46 40 Q 80 48 114 40 Q 80 36 46 40 Z" fill="#451A03" />
                    <Circle cx="80" cy="26" r="4" stroke="#FDE047" strokeWidth={1.5} fill="#38BDF8" opacity={0.8} />
                  </G>
                )}
                {equippedHat === 'wizard' && (
                  <G id="hat-wizard">
                    <Path d="M 54 40 C 65 24, 72 8, 82 4 C 88 10, 92 24, 106 40 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                    <Ellipse cx="80" cy="40" rx="30" ry="6.5" fill="#1E1B4B" />
                    <Path d="M 58 37 Q 80 43 102 37" stroke="#F59E0B" strokeWidth={3} fill="none" />
                    <Path d="M 76 22 L 77.5 25 L 81 25.5 L 78.5 28 L 79 31 L 76 29.5 L 73 31 L 73.5 28 L 71 25.5 L 74.5 25 Z" fill="#FDE047" />
                  </G>
                )}
                {equippedHat === 'chef' && (
                  <G id="hat-chef">
                    <Path d="M 58 36 C 52 24, 62 12, 70 14 C 74 8, 86 8, 90 14 C 98 12, 108 24, 102 36 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
                    <Rect x="58" y="34" width="44" height="7" rx="2" fill="#E2E8F0" />
                  </G>
                )}
                {(equippedHat === 'crown' || !equippedHat) && (
                  <G id="hat-crown">
                    <Path d="M 66 32 L 70 14 L 76 23 L 80 10 L 84 23 L 90 14 L 94 32 Z" fill="url(#feastCrown)" stroke="#B45309" strokeWidth={1} />
                    <Circle cx="80" cy="18" r="2.5" fill="#EF4444" />
                    <Circle cx="70" cy="22" r="1.8" fill="#3B82F6" />
                    <Circle cx="90" cy="22" r="1.8" fill="#10B981" />
                  </G>
                )}

                {/* Body */}
                <Path
                  d="M 44 94 C 40 126, 52 146, 80 146 C 108 146, 120 126, 116 94 C 104 88, 56 88, 44 94 Z"
                  fill="url(#feastDarkFur)"
                />
                {/* Belly patch */}
                <Ellipse cx="80" cy="120" rx="24" ry="18" fill="#180A04" />

                {/* Paws */}
                <Ellipse cx="58" cy="144" rx="14" ry="9" fill="#180A04" />
                <Ellipse cx="102" cy="144" rx="14" ry="9" fill="#180A04" />

                {/* Head */}
                <Circle cx="80" cy="74" r="38" fill="url(#feastFurGrad)" />

                {/* White Cheek & Brow Markings */}
                <Ellipse cx="54" cy="78" rx="14" ry="11" fill="#FFFFFF" />
                <Ellipse cx="106" cy="78" rx="14" ry="11" fill="#FFFFFF" />
                <Ellipse cx="62" cy="54" rx="5" ry="7" fill="#FFFFFF" transform="rotate(-15, 62, 54)" />
                <Ellipse cx="98" cy="54" rx="5" ry="7" fill="#FFFFFF" transform="rotate(15, 98, 54)" />

                {/* Eye Tear Stripes */}
                <Path d="M 60 72 C 58 78, 57 88, 53 91" stroke="#9A3412" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M 100 72 C 102 78, 103 88, 107 91" stroke="#9A3412" strokeWidth={3} strokeLinecap="round" fill="none" />

                {/* Joyful Starry / Happy Eyes */}
                <Circle cx="64" cy="69" r="6.5" fill="#1E1B4B" />
                <Circle cx="66.5" cy="66.5" r="2.5" fill="#FFFFFF" />
                <Circle cx="63" cy="71" r="1.2" fill="#FFFFFF" />

                <Circle cx="96" cy="69" r="6.5" fill="#1E1B4B" />
                <Circle cx="98.5" cy="66.5" r="2.5" fill="#FFFFFF" />
                <Circle cx="95" cy="71" r="1.2" fill="#FFFFFF" />

                {/* Equipped Glasses */}
                {equippedGlasses === 'shades' && (
                  <G id="glasses-shades">
                    <Path d="M 52 64 Q 65 62 76 66 L 75 75 Q 64 77 53 73 Z" fill="#090D16" />
                    <Path d="M 84 66 Q 95 62 108 64 L 107 73 Q 96 77 85 75 Z" fill="#090D16" />
                    <Line x1="75" y1="66" x2="85" y2="66" stroke="#090D16" strokeWidth={3} />
                  </G>
                )}
                {equippedGlasses === 'nerd' && (
                  <G id="glasses-nerd">
                    <Circle cx="64" cy="69" r="9" stroke="#000000" strokeWidth={2.2} fill="none" />
                    <Circle cx="96" cy="69" r="9" stroke="#000000" strokeWidth={2.2} fill="none" />
                    <Line x1="73" y1="69" x2="87" y2="69" stroke="#000000" strokeWidth={2.5} />
                  </G>
                )}

                {/* Snout */}
                <Ellipse cx="80" cy="80" rx="13" ry="9" fill="#FFFFFF" />
                <Path d="M 76 76 C 76 74, 84 74, 84 76 C 84 78, 80 80, 80 80 C 80 80, 76 78, 76 76 Z" fill="#1F2937" />

                {/* Chewing Open / Closed Mouth */}
                <Path d="M 73 82 Q 80 88 87 82" stroke="#991B1B" strokeWidth={3} fill="#EF4444" strokeLinecap="round" />

                {/* Whiskers */}
                <Line x1="42" y1="78" x2="28" y2="76" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
                <Line x1="42" y1="83" x2="29" y2="86" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
                <Line x1="118" y1="78" x2="132" y2="76" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
                <Line x1="118" y1="83" x2="131" y2="86" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />

                {/* 🎋 BAMBOO STALK HELD IN PAWS */}
                <G id="bamboo-feast">
                  <Rect x="68" y="76" width="24" height="62" rx="5" fill="url(#bambooGreen)" stroke="#15803D" strokeWidth={1.2} />
                  <Line x1="68" y1="94" x2="92" y2="94" stroke="#166534" strokeWidth={2} />
                  <Line x1="68" y1="114" x2="92" y2="114" stroke="#166534" strokeWidth={2} />
                  {/* Bamboo Leaves */}
                  <Path d="M 90 84 Q 106 76 112 82 Q 102 90 90 88 Z" fill="#22C55E" />
                  <Path d="M 70 102 Q 52 96 46 102 Q 58 108 70 106 Z" fill="#22C55E" />

                  {/* Left & Right Paws holding bamboo */}
                  <Circle cx="64" cy="98" r="9" fill="#240F05" />
                  <Circle cx="96" cy="98" r="9" fill="#240F05" />
                </G>
              </Svg>
            </Animated.View>
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
    paddingTop: 20,
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
    marginBottom: 10,
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
    paddingVertical: 12,
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
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  speechArrow: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pandaStage: {
    position: 'relative',
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  auraCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 14,
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
