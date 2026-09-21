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

const CELEBRATION_MESSAGES = [
  'Hi! You did it! 🎉 All habits completed today!',
  'Hi there! 🎋 You fed me a full day of bamboo! Awesome job!',
  '100% Day Perfection! Your streak is on fire! 🔥',
  'Woohoo! Day conquered! Keep this energy going! 🚀',
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

  // Modal slide from bottom
  const sheetSlideAnim = useRef(new Animated.Value(450)).current;
  const sheetScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Panda sliding DOWN the bamboo stalk from top
  const pandaSlideDownAnim = useRef(new Animated.Value(-240)).current;
  const pandaBounceAnim = useRef(new Animated.Value(1)).current;

  // Waving Paw Animation
  const waveAnim = useRef(new Animated.Value(0)).current;
  // Tail Wag Animation
  const tailAnim = useRef(new Animated.Value(0)).current;
  // Floating Breathe Animation
  const breatheAnim = useRef(new Animated.Value(0)).current;
  // Rewards & Speech bubble pop
  const rewardsPopAnim = useRef(new Animated.Value(0)).current;
  const speechBubblePopAnim = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isDayCompletionModalOpen) {
      sheetSlideAnim.setValue(450);
      sheetScaleAnim.setValue(0.8);
      pandaSlideDownAnim.setValue(-240);
      pandaBounceAnim.setValue(1);
      rewardsPopAnim.setValue(0);
      speechBubblePopAnim.setValue(0);
      return;
    }

    const useNative = Platform.OS !== 'web';
    setMessageIndex(Math.floor(Math.random() * CELEBRATION_MESSAGES.length));

    // 1. Sheet slide-up & Panda slide DOWN the bamboo simultaneously!
    Animated.parallel([
      Animated.spring(sheetSlideAnim, {
        toValue: 0,
        friction: 6.5,
        tension: 50,
        useNativeDriver: useNative,
      }),
      Animated.spring(sheetScaleAnim, {
        toValue: 1,
        friction: 5.5,
        tension: 45,
        useNativeDriver: useNative,
      }),
      // Panda slides smoothly down the bamboo pole from top (-240 -> 0)
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(pandaSlideDownAnim, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: useNative,
        }),
        // Landing bounce on bamboo
        Animated.sequence([
          Animated.timing(pandaBounceAnim, {
            toValue: 1.12,
            duration: 90,
            useNativeDriver: useNative,
          }),
          Animated.spring(pandaBounceAnim, {
            toValue: 1,
            friction: 4,
            tension: 60,
            useNativeDriver: useNative,
          }),
        ]),
      ]),
      // Speech bubble pop in after landing
      Animated.sequence([
        Animated.delay(650),
        Animated.spring(speechBubblePopAnim, {
          toValue: 1,
          friction: 4.5,
          tension: 65,
          useNativeDriver: useNative,
        }),
      ]),
      // Rewards card pop in
      Animated.sequence([
        Animated.delay(800),
        Animated.spring(rewardsPopAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: useNative,
        }),
      ]),
    ]).start();

    // 2. Continuous Waving Paw Animation Loop ("Hi! 👋")
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(waveAnim, {
          toValue: -1,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.delay(300),
      ])
    );
    waveLoop.start();

    // 3. Tail Wagging Loop
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(tailAnim, {
          toValue: -1,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    tailLoop.start();

    // 4. Gentle Breathe Float
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: -4,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 5. Glow Pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.15,
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
      waveLoop.stop();
      tailLoop.stop();
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
      Animated.timing(sheetSlideAnim, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.back(1.5)),
        useNativeDriver: useNative,
      }),
      Animated.timing(sheetScaleAnim, {
        toValue: 0.75,
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

  const waveRotation = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '22deg'],
  });

  const tailRotation = tailAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

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
              transform: [{ translateY: sheetSlideAnim }, { scale: sheetScaleAnim }],
            },
          ]}
        >
          {/* Top Trophy Banner */}
          <View style={styles.topBadgeRow}>
            <View style={styles.trophyBadge}>
              <Trophy size={14} color="#F59E0B" />
              <Text style={styles.trophyBadgeText}>
                {t('celebration.perfect_day', 'PERFECT 100% DAY!')}
              </Text>
            </View>
          </View>

          {/* Speech Bubble (Duolingo Style) */}
          <Animated.View
            style={[
              styles.speechBubbleWrapper,
              {
                opacity: speechBubblePopAnim,
                transform: [
                  {
                    scale: speechBubblePopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          >
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
          </Animated.View>

          {/* BAMBOO TREE CLIMB & SLIDE STAGE */}
          <View style={styles.bambooStage}>
            {/* Aura Glow */}
            <Animated.View
              style={[
                styles.auraCircle,
                {
                  transform: [{ scale: auraPulse }],
                },
              ]}
            />

            {/* Static Bamboo Trunk (Vertical Stalk) */}
            <Svg width={220} height={200} viewBox="0 0 220 200" style={styles.bambooSvg}>
              <Defs>
                <LinearGradient id="bambooTrunkGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#15803D" />
                  <Stop offset="25%" stopColor="#22C55E" />
                  <Stop offset="75%" stopColor="#4ADE80" />
                  <Stop offset="100%" stopColor="#166534" />
                </LinearGradient>
                <LinearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#86EFAC" />
                  <Stop offset="100%" stopColor="#16A34A" />
                </LinearGradient>
              </Defs>

              {/* Main Thick Bamboo Stalk */}
              <Rect x="120" y="0" width="22" height="200" rx="4" fill="url(#bambooTrunkGrad)" />
              {/* Bamboo Segment Rings */}
              <Line x1="118" y1="35" x2="144" y2="35" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="118" y1="85" x2="144" y2="85" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="118" y1="140" x2="144" y2="140" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="118" y1="190" x2="144" y2="190" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />

              {/* Sprouting Bamboo Shoots & Leaves on top & bottom */}
              <Path d="M 142 35 Q 170 20 185 30 Q 165 42 142 38 Z" fill="url(#leafGrad)" />
              <Path d="M 142 37 Q 165 45 178 60 Q 155 58 142 41 Z" fill="url(#leafGrad)" />
              <Path d="M 120 140 Q 95 125 80 135 Q 100 148 120 143 Z" fill="url(#leafGrad)" />
              <Path d="M 142 140 Q 168 130 180 142 Q 160 152 142 143 Z" fill="url(#leafGrad)" />
            </Svg>

            {/* SLIDING PANDA (Hugging bamboo & Sliding down with waving paw) */}
            <Animated.View
              style={[
                styles.slidingPandaWrapper,
                {
                  transform: [
                    { translateY: pandaSlideDownAnim },
                    { translateY: breatheAnim },
                    { scale: pandaBounceAnim },
                  ],
                },
              ]}
            >
              {/* Fluffy Red-Panda Tail (Wagging behind bamboo) */}
              <Animated.View
                style={[
                  styles.tailLayer,
                  {
                    transform: [{ rotate: tailRotation }],
                    transformOrigin: '80% 80%' as any,
                  },
                ]}
              >
                <Svg width={70} height={70} viewBox="0 0 70 70">
                  <Defs>
                    <LinearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#FB923C" />
                      <Stop offset="50%" stopColor="#EA580C" />
                      <Stop offset="100%" stopColor="#9A3412" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M 50 55 C 20 60, 2 45, 8 20 C 12 5, 30 10, 42 30 Z" fill="url(#tailGrad)" />
                  <Path d="M 8 20 C 10 8, 24 6, 28 16 C 18 20, 10 24, 8 20 Z" fill="#FEF3C7" />
                  <Path d="M 15 28 C 22 25, 28 28, 32 35 C 26 38, 18 36, 15 28 Z" fill="#240F05" opacity={0.8} />
                  <Path d="M 24 38 C 30 36, 36 39, 40 46 C 34 49, 28 47, 24 38 Z" fill="#240F05" opacity={0.8} />
                </Svg>
              </Animated.View>

              {/* Main Panda Body (Hugging Bamboo) */}
              <Svg width={180} height={180} viewBox="0 0 180 180">
                <Defs>
                  <RadialGradient id="pandaFur" cx="45%" cy="35%" r="65%">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="60%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#C2410C" />
                  </RadialGradient>
                  <LinearGradient id="pandaDarkFur" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3F1D0B" />
                    <Stop offset="100%" stopColor="#1C0B03" />
                  </LinearGradient>
                  <LinearGradient id="goldCrown" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="60%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </LinearGradient>
                </Defs>

                {/* Back Left Leg wrapped on bamboo */}
                <Ellipse cx="118" cy="130" rx="14" ry="10" fill="#1C0B03" transform="rotate(15, 118, 130)" />
                {/* Back Right Leg on other side of bamboo */}
                <Ellipse cx="146" cy="126" rx="12" ry="9" fill="#1C0B03" transform="rotate(-15, 146, 126)" />

                {/* Chubby Body */}
                <Path
                  d="M 68 85 C 55 115, 68 140, 98 140 C 124 140, 136 120, 130 85 C 115 80, 80 80, 68 85 Z"
                  fill="url(#pandaDarkFur)"
                />

                {/* White Belly Patch */}
                <Ellipse cx="94" cy="116" rx="18" ry="14" fill="#2D1307" />

                {/* Left Arm Gripping Bamboo Trunk */}
                <Path
                  d="M 80 88 C 95 86, 122 84, 128 92 C 128 98, 120 102, 108 102 C 92 102, 78 98, 80 88 Z"
                  fill="#1C0B03"
                />
                <Circle cx="128" cy="94" r="8" fill="#1C0B03" />

                {/* Fluffy Round Ears */}
                <G id="ears">
                  <Path d="M 52 44 C 40 26, 52 14, 68 24 C 72 30, 68 38, 62 44 Z" fill="url(#pandaFur)" />
                  <Path d="M 54 42 C 44 30, 54 22, 64 30 Z" fill="#FFFFFF" />
                  <Path d="M 124 44 C 136 26, 124 14, 108 24 C 104 30, 108 38, 114 44 Z" fill="url(#pandaFur)" />
                  <Path d="M 122 42 C 132 30, 122 22, 112 30 Z" fill="#FFFFFF" />
                </G>

                {/* Equipped Hat */}
                {equippedHat === 'detective' && (
                  <G id="hat-detective">
                    <Path d="M 64 34 C 62 20, 74 14, 90 14 C 106 14, 118 20, 116 34 Z" fill="#78350F" />
                    <Path d="M 56 34 Q 90 42 124 34 Q 90 30 56 34 Z" fill="#451A03" />
                  </G>
                )}
                {equippedHat === 'wizard' && (
                  <G id="hat-wizard">
                    <Path d="M 66 34 C 76 20, 82 4, 92 2 C 98 8, 102 20, 114 34 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                    <Ellipse cx="90" cy="34" rx="26" ry="6" fill="#1E1B4B" />
                    <Path d="M 86 18 L 87.5 21 L 91 21.5 L 88.5 24 L 89 27 L 86 25.5 L 83 27 L 83.5 24 L 81 21.5 L 84.5 21 Z" fill="#FDE047" />
                  </G>
                )}
                {equippedHat === 'chef' && (
                  <G id="hat-chef">
                    <Path d="M 70 30 C 64 18, 74 8, 82 10 C 86 4, 98 4, 102 10 C 110 8, 118 18, 112 30 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
                    <Rect x="70" y="28" width="42" height="6" rx="2" fill="#E2E8F0" />
                  </G>
                )}
                {(equippedHat === 'crown' || !equippedHat) && (
                  <G id="hat-crown">
                    <Path d="M 74 28 L 78 12 L 84 20 L 88 8 L 92 20 L 98 12 L 102 28 Z" fill="url(#goldCrown)" stroke="#B45309" strokeWidth={1} />
                    <Circle cx="88" cy="15" r="2.2" fill="#EF4444" />
                    <Circle cx="79" cy="19" r="1.6" fill="#3B82F6" />
                    <Circle cx="97" cy="19" r="1.6" fill="#10B981" />
                  </G>
                )}

                {/* Round Head */}
                <Circle cx="88" cy="65" r="35" fill="url(#pandaFur)" />

                {/* Soft White Cheek Fur Patches */}
                <Ellipse cx="64" cy="69" rx="13" ry="10" fill="#FFFFFF" />
                <Ellipse cx="112" cy="69" rx="13" ry="10" fill="#FFFFFF" />
                <Ellipse cx="72" cy="46" rx="4.5" ry="6.5" fill="#FFFFFF" transform="rotate(-15, 72, 46)" />
                <Ellipse cx="104" cy="46" rx="4.5" ry="6.5" fill="#FFFFFF" transform="rotate(15, 104, 46)" />

                {/* Tear Stripes */}
                <Path d="M 70 63 C 68 69, 67 77, 63 80" stroke="#9A3412" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                <Path d="M 106 63 C 108 69, 109 77, 113 80" stroke="#9A3412" strokeWidth={2.8} strokeLinecap="round" fill="none" />

                {/* Big Shiny Anime / Duolingo Eyes */}
                <Circle cx="74" cy="60" r="6.2" fill="#1E1B4B" />
                <Circle cx="76.5" cy="57.5" r="2.4" fill="#FFFFFF" />
                <Circle cx="73" cy="62" r="1.1" fill="#FFFFFF" />

                <Circle cx="102" cy="60" r="6.2" fill="#1E1B4B" />
                <Circle cx="104.5" cy="57.5" r="2.4" fill="#FFFFFF" />
                <Circle cx="101" cy="62" r="1.1" fill="#FFFFFF" />

                {/* Equipped Glasses */}
                {equippedGlasses === 'shades' && (
                  <G id="glasses-shades">
                    <Path d="M 62 56 Q 74 54 85 58 L 84 66 Q 73 68 63 64 Z" fill="#090D16" />
                    <Path d="M 91 58 Q 102 54 114 56 L 113 64 Q 103 68 92 66 Z" fill="#090D16" />
                    <Line x1="84" y1="58" x2="92" y2="58" stroke="#090D16" strokeWidth={2.5} />
                  </G>
                )}
                {equippedGlasses === 'nerd' && (
                  <G id="glasses-nerd">
                    <Circle cx="74" cy="60" r="8" stroke="#000000" strokeWidth={2} fill="none" />
                    <Circle cx="102" cy="60" r="8" stroke="#000000" strokeWidth={2} fill="none" />
                    <Line x1="82" y1="60" x2="94" y2="60" stroke="#000000" strokeWidth={2.2} />
                  </G>
                )}

                {/* Snout */}
                <Ellipse cx="88" cy="70" rx="12" ry="8" fill="#FFFFFF" />
                <Path d="M 85 67 C 85 65, 91 65, 91 67 C 91 69, 88 71, 88 71 C 88 71, 85 69, 85 67 Z" fill="#1F2937" />

                {/* Happy Big Smile */}
                <Path d="M 82 72 Q 88 78 94 72" stroke="#991B1B" strokeWidth={2.6} fill="#EF4444" strokeLinecap="round" />

                {/* Whiskers */}
                <Line x1="52" y1="69" x2="38" y2="67" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
                <Line x1="52" y1="73" x2="39" y2="76" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
                <Line x1="124" y1="69" x2="138" y2="67" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
                <Line x1="124" y1="73" x2="137" y2="76" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
              </Svg>

              {/* SEPARATE ANIMATED WAVING RIGHT PAW ("Hi! 👋") */}
              <Animated.View
                style={[
                  styles.wavingPawWrapper,
                  {
                    transform: [{ rotate: waveRotation }],
                    transformOrigin: '20% 80%' as any,
                  },
                ]}
              >
                <Svg width={46} height={46} viewBox="0 0 46 46">
                  {/* Waving Arm & Paw */}
                  <Path d="M 12 36 C 10 24, 20 12, 32 8 C 38 12, 40 20, 32 28 C 24 34, 18 38, 12 36 Z" fill="#1C0B03" />
                  <Circle cx="32" cy="12" r="7" fill="#1C0B03" />
                  {/* Paw pads (pink accents) */}
                  <Circle cx="31" cy="12" r="3.2" fill="#F472B6" />
                  <Circle cx="26" cy="10" r="1.4" fill="#F472B6" />
                  <Circle cx="29" cy="6" r="1.4" fill="#F472B6" />
                  <Circle cx="34" cy="6" r="1.4" fill="#F472B6" />
                </Svg>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Rewards Grid */}
          <Animated.View
            style={[
              styles.rewardsGrid,
              {
                opacity: rewardsPopAnim,
                transform: [
                  {
                    scale: rewardsPopAnim.interpolate({
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
    marginBottom: 2,
    zIndex: 20,
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
  bambooStage: {
    position: 'relative',
    width: 220,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  auraCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  bambooSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  slidingPandaWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  tailLayer: {
    position: 'absolute',
    left: 10,
    bottom: 30,
    zIndex: 1,
  },
  wavingPawWrapper: {
    position: 'absolute',
    right: 28,
    top: 48,
    zIndex: 10,
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
