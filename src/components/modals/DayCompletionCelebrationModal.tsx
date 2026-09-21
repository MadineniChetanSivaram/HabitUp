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

            {/* SLIDING PANDA (Exact HabitlyMascot 100% Feast Red Panda) */}
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
              {/* ======================================================== */}
              {/* LAYER 1: ISOLATED HW-ACCELERATED TAIL (behind body)      */}
              {/* ======================================================== */}
              <Animated.View
                style={[
                  styles.layerAbsolute,
                  {
                    transform: [{ rotate: tailRotation }],
                    transformOrigin: '58% 68%' as any,
                    zIndex: 1,
                  },
                ]}
                pointerEvents="none"
              >
                <Svg width={160} height={160} viewBox="0 0 160 160">
                  <Defs>
                    <LinearGradient id="tailGradFullModal" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#FB923C" />
                      <Stop offset="50%" stopColor="#EA580C" />
                      <Stop offset="100%" stopColor="#9A3412" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d="M 94 104 C 122 114, 150 100, 146 72 C 142 50, 120 54, 108 76 Z"
                    fill="url(#tailGradFullModal)"
                  />
                  <Path
                    d="M 146 72 C 144 54, 128 52, 122 62 C 134 68, 142 76, 146 72 Z"
                    fill="#FEF3C7"
                  />
                  <Path
                    d="M 139 80 C 130 77, 122 80, 116 88 C 122 92, 132 90, 139 80 Z"
                    fill="#240F05"
                    opacity={0.8}
                  />
                  <Path
                    d="M 128 92 C 120 90, 114 93, 110 100 C 115 103, 122 101, 128 92 Z"
                    fill="#240F05"
                    opacity={0.8}
                  />
                </Svg>
              </Animated.View>

              {/* ======================================================== */}
              {/* LAYER 2: CHUBBY BODY, EARS, HEAD & BAMBOO FEAST SNACK    */}
              {/* ======================================================== */}
              <View style={[styles.layerAbsolute, { zIndex: 5 }]} pointerEvents="none">
                <Svg width={160} height={160} viewBox="0 0 160 160">
                  <Defs>
                    <RadialGradient id="rpFurGradModal" cx="50%" cy="35%" r="65%">
                      <Stop offset="0%" stopColor="#FB923C" />
                      <Stop offset="60%" stopColor="#EA580C" />
                      <Stop offset="100%" stopColor="#C2410C" />
                    </RadialGradient>
                    <LinearGradient id="rpDarkFurModal" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#3F1D0B" />
                      <Stop offset="100%" stopColor="#240F05" />
                    </LinearGradient>
                    <LinearGradient id="rpCrownModal" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#FDE047" />
                      <Stop offset="60%" stopColor="#F59E0B" />
                      <Stop offset="100%" stopColor="#D97706" />
                    </LinearGradient>
                  </Defs>

                  {/* Teddy Bear Rounded Ears on top of head */}
                  <G id="rp-ears-modal">
                    {/* Left Ear */}
                    <Path
                      d="M 36 50 C 26 30, 40 18, 56 30 C 60 36, 56 46, 48 52 Z"
                      fill="url(#rpFurGradModal)"
                    />
                    <Path
                      d="M 38 48 C 30 34, 42 26, 52 34 Z"
                      fill="#FFFFFF"
                    />

                    {/* Right Ear */}
                    <Path
                      d="M 124 50 C 134 30, 120 18, 104 30 C 100 36, 104 46, 112 52 Z"
                      fill="url(#rpFurGradModal)"
                    />
                    <Path
                      d="M 122 48 C 130 34, 118 26, 108 34 Z"
                      fill="#FFFFFF"
                    />
                  </G>

                  {/* ======================================================== */}
                  {/* 🎩 EQUIPPED HATS & HEADGEAR (Equipped Only - NO default) */}
                  {/* ======================================================== */}
                  {/* 🕵️ Detective Cap */}
                  {equippedHat === 'detective' && (
                    <G id="rp-hat-detective">
                      <Path d="M 52 40 C 50 24, 62 18, 80 18 C 98 18, 110 24, 108 40 Z" fill="#78350F" />
                      <Path d="M 54 34 Q 80 30 106 34" stroke="#92400E" strokeWidth={2.5} fill="none" />
                      <Path d="M 46 40 Q 80 48 114 40 Q 80 36 46 40 Z" fill="#451A03" />
                      <Circle cx="80" cy="26" r="4" stroke="#FDE047" strokeWidth={1.5} fill="#38BDF8" opacity={0.8} />
                      <Line x1="83" y1="29" x2="86" y2="33" stroke="#FDE047" strokeWidth={1.5} strokeLinecap="round" />
                    </G>
                  )}

                  {/* 🧙 Wizard Star Hat */}
                  {equippedHat === 'wizard' && (
                    <G id="rp-hat-wizard">
                      <Path d="M 54 40 C 65 24, 72 8, 82 4 C 88 10, 92 24, 106 40 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                      <Path d="M 82 4 Q 90 0 92 6 Q 85 7 82 4 Z" fill="#1E1B4B" />
                      <Ellipse cx="80" cy="40" rx="30" ry="6.5" fill="#1E1B4B" />
                      <Path d="M 58 37 Q 80 43 102 37" stroke="#F59E0B" strokeWidth={3} fill="none" />
                      <Path d="M 76 22 L 77.5 25 L 81 25.5 L 78.5 28 L 79 31 L 76 29.5 L 73 31 L 73.5 28 L 71 25.5 L 74.5 25 Z" fill="#FDE047" />
                    </G>
                  )}

                  {/* 👨‍🍳 Chef Toque */}
                  {equippedHat === 'chef' && (
                    <G id="rp-hat-chef">
                      <Path d="M 58 36 C 52 24, 62 12, 70 14 C 74 8, 86 8, 90 14 C 98 12, 108 24, 102 36 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
                      <Path d="M 70 16 Q 72 28 72 34 M 80 12 Q 80 26 80 34 M 90 16 Q 88 28 88 34" stroke="#E2E8F0" strokeWidth={1.2} />
                      <Rect x="58" y="34" width="44" height="7" rx="2" fill="#E2E8F0" />
                    </G>
                  )}

                  {/* 👑 Royal Crown (Equipped Only - NO default) */}
                  {equippedHat === 'crown' && (
                    <G id="rp-crown">
                      <Path d="M66 32 L70 14 L76 23 L80 10 L84 23 L90 14 L94 32 Z" fill="url(#rpCrownModal)" stroke="#B45309" strokeWidth={1} />
                      <Circle cx="80" cy="18" r="2.5" fill="#EF4444" />
                      <Circle cx="72" cy="22" r="1.8" fill="#3B82F6" />
                      <Circle cx="88" cy="22" r="1.8" fill="#10B981" />
                    </G>
                  )}

                  {/* 🎅 Santa Cap */}
                  {equippedHat === 'santa' && (
                    <G id="rp-hat-santa">
                      <Path d="M 54 38 C 58 22, 74 12, 94 14 C 104 18, 108 26, 114 34 Z" fill="#DC2626" />
                      <Circle cx="116" cy="36" r="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
                      <Rect x="50" y="34" width="60" height="9" rx="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
                    </G>
                  )}

                  {/* 🥋 Ninja Headband */}
                  {equippedHat === 'ninja_band' && (
                    <G id="rp-hat-ninja">
                      <Path d="M 44 48 Q 80 43 116 48 L 115 54 Q 80 49 45 54 Z" fill="#DC2626" />
                      <Rect x="70" y="46" width="20" height="6" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth={0.8} />
                      <Path d="M 115 50 Q 124 54 128 64 Q 122 62 114 53 Z M 115 52 Q 126 60 124 72 Q 120 66 113 55 Z" fill="#B91C1C" />
                    </G>
                  )}

                  {/* 🌸 Flower Crown */}
                  {equippedHat === 'flower_crown' && (
                    <G id="rp-hat-flower">
                      <Path d="M 48 42 Q 80 36 112 42" stroke="#15803D" strokeWidth={2.5} fill="none" />
                      <Circle cx="54" cy="40" r="4.5" fill="#F472B6" /> <Circle cx="54" cy="40" r="1.8" fill="#FDE047" />
                      <Circle cx="67" cy="37" r="4.5" fill="#FB7185" /> <Circle cx="67" cy="37" r="1.8" fill="#FDE047" />
                      <Circle cx="80" cy="35" r="5" fill="#F472B6" /> <Circle cx="80" cy="35" r="2" fill="#FDE047" />
                      <Circle cx="93" cy="37" r="4.5" fill="#FB7185" /> <Circle cx="93" cy="37" r="1.8" fill="#FDE047" />
                      <Circle cx="106" cy="40" r="4.5" fill="#F472B6" /> <Circle cx="106" cy="40" r="1.8" fill="#FDE047" />
                    </G>
                  )}

                  {/* 🥳 Party Hat */}
                  {equippedHat === 'party_hat' && (
                    <G id="rp-hat-party">
                      <Path d="M 64 38 L 80 12 L 96 38 Z" fill="#F43F5E" />
                      <Path d="M 68 32 L 80 12 L 92 32 Z" fill="#F59E0B" />
                      <Path d="M 72 26 L 80 12 L 88 26 Z" fill="#10B981" />
                      <Path d="M 76 20 L 80 12 L 84 20 Z" fill="#3B82F6" />
                      <Circle cx="80" cy="11" r="3.5" fill="#FDE047" />
                    </G>
                  )}

                  {/* 🧢 Beanie */}
                  {equippedHat === 'beanie' && (
                    <G id="rp-hat-beanie">
                      <Path d="M 52 40 C 50 24, 62 16, 80 16 C 98 16, 110 24, 108 40 Z" fill="#0D9488" />
                      <Rect x="48" y="34" width="64" height="9" rx="3" fill="#115E59" />
                      <Circle cx="80" cy="14" r="4.5" fill="#F59E0B" />
                    </G>
                  )}

                  {/* Chubby Seated Body & Belly */}
                  <Ellipse cx="80" cy="100" rx="34" ry="26" fill="url(#rpFurGradModal)" />
                  <Ellipse cx="80" cy="105" rx="21" ry="15" fill="url(#rpDarkFurModal)" />
                  <Path d="M 72 88 Q 80 95 88 88 Q 80 92 72 88 Z" fill="#FFFFFF" opacity={0.9} />

                  {/* Bottom Hind Feet (Paws 3 & 4 of 4 Paws with Gold Pads) */}
                  {/* Left Foot */}
                  <Ellipse cx="48" cy="123" rx="11" ry="8" fill="url(#rpDarkFurModal)" transform="rotate(-10 48 123)" />
                  <Ellipse cx="48" cy="123" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(-10 48 123)" />
                  <Circle cx="41" cy="119" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="46" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="52" cy="117" r="1.6" fill="#FEF08A" opacity={0.95} />

                  {/* Right Foot */}
                  <Ellipse cx="112" cy="123" rx="11" ry="8" fill="url(#rpDarkFurModal)" transform="rotate(10 112 123)" />
                  <Ellipse cx="112" cy="123" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(10 112 123)" />
                  <Circle cx="108" cy="117" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="114" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="119" cy="119" r="1.6" fill="#FEF08A" opacity={0.95} />

                  {/* Round Chubby Head & Markings */}
                  <Ellipse cx="80" cy="62" rx="36" ry="29" fill="url(#rpFurGradModal)" />
                  <Ellipse cx="80" cy="69" rx="15" ry="11" fill="#FFFFFF" />
                  <Circle cx="63" cy="49" r="4.2" fill="#FFFFFF" />
                  <Circle cx="97" cy="49" r="4.2" fill="#FFFFFF" />
                  <Path d="M 48 64 C 45 72, 52 77, 57 73 C 55 67, 51 64, 48 64 Z" fill="#FFFFFF" />
                  <Path d="M 112 64 C 115 72, 108 77, 103 73 C 105 67, 109 64, 112 64 Z" fill="#FFFFFF" />

                  {/* Cute Black Button Nose with Highlight */}
                  <Path d="M 76 65 Q 80 63 84 65 Q 80 70 76 65 Z" fill="#1C1917" />
                  <Circle cx="78.5" cy="65.5" r="0.7" fill="#FFFFFF" />

                  {/* 😋 100% FEAST: Laughing Joyful Eyes (^ω^) & Chewing Blush */}
                  <G id="rp-face-munching">
                    <Path d="M 61 59 Q 66 53 71 59" stroke="#3F1D0B" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                    <Path d="M 89 59 Q 94 53 99 59" stroke="#3F1D0B" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                    <Ellipse cx="54" cy="66" rx="4.5" ry="2.6" fill="#EC4899" opacity={0.8} />
                    <Ellipse cx="106" cy="66" rx="4.5" ry="2.6" fill="#EC4899" opacity={0.8} />
                  </G>

                  {/* ======================================================== */}
                  {/* 🕶️ EQUIPPED GLASSES & EYEWEAR                            */}
                  {/* ======================================================== */}
                  {/* 😎 Cool Aviators */}
                  {equippedGlasses === 'aviators' && (
                    <G id="rp-glasses-aviators">
                      <Path d="M 52 54 L 108 54 M 74 58 Q 80 55 86 58" stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" />
                      <Path d="M 54 54 C 54 66, 62 70, 72 68 C 76 66, 76 56, 74 54 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth={1.5} />
                      <Line x1="58" y1="56" x2="68" y2="66" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.65} />
                      <Path d="M 86 54 C 84 56, 84 66, 88 68 C 98 70, 106 66, 106 54 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth={1.5} />
                      <Line x1="90" y1="56" x2="100" y2="66" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.65} />
                    </G>
                  )}

                  {/* 👓 Scholar Round Specs */}
                  {equippedGlasses === 'round_specs' && (
                    <G id="rp-glasses-round">
                      <Path d="M 73 59 Q 80 56 87 59" stroke="#334155" strokeWidth={2} strokeLinecap="round" fill="none" />
                      <Circle cx="63" cy="59" r="9" stroke="#334155" strokeWidth={2.2} fill="#38BDF8" opacity={0.2} />
                      <Circle cx="97" cy="59" r="9" stroke="#334155" strokeWidth={2.2} fill="#38BDF8" opacity={0.2} />
                    </G>
                  )}

                  {/* 🧐 Golden Monocle */}
                  {equippedGlasses === 'monocle' && (
                    <G id="rp-glasses-monocle">
                      <Circle cx="95" cy="59" r="8.5" stroke="#F59E0B" strokeWidth={2} fill="#38BDF8" opacity={0.25} />
                      <Path d="M 98 65 Q 106 75 102 88" stroke="#D97706" strokeWidth={1.2} strokeLinecap="round" fill="none" strokeDasharray="2,2" />
                    </G>
                  )}

                  {/* 🤩 Star Rocker Glasses */}
                  {equippedGlasses === 'star_glasses' && (
                    <G id="rp-glasses-star">
                      <Line x1="72" y1="58" x2="88" y2="58" stroke="#EAB308" strokeWidth={2} strokeLinecap="round" />
                      <Path d="M 64 50 L 66.5 56 L 73 57 L 68 62 L 69.5 68 L 64 65 L 58.5 68 L 60 62 L 55 57 L 61.5 56 Z" fill="#FDE047" stroke="#EAB308" strokeWidth={1.2} />
                      <Path d="M 96 50 L 98.5 56 L 105 57 L 100 62 L 101.5 68 L 96 65 L 90.5 68 L 92 62 L 87 57 L 93.5 56 Z" fill="#FDE047" stroke="#EAB308" strokeWidth={1.2} />
                    </G>
                  )}

                  {/* 🕶️ 8-Bit Pixel Shades */}
                  {equippedGlasses === 'pixel_shades' && (
                    <G id="rp-glasses-pixel">
                      <Rect x="54" y="55" width="22" height="10" fill="#0F172A" />
                      <Rect x="84" y="55" width="22" height="10" fill="#0F172A" />
                      <Rect x="76" y="55" width="8" height="4" fill="#0F172A" />
                      <Rect x="58" y="57" width="3" height="3" fill="#FFFFFF" />
                      <Rect x="88" y="57" width="3" height="3" fill="#FFFFFF" />
                    </G>
                  )}

                  {/* ==================================================== */}
                  {/* 😋 STAGE 3: EATING & MUNCHING BAMBOO SNACK (100%)    */}
                  {/* ==================================================== */}
                  <G id="rp-eating-bamboo-snack">
                    <Path d="M 74 72 L 108 102" stroke="#22C55E" strokeWidth={5.2} strokeLinecap="round" />
                    <Line x1="84" y1="81" x2="88" y2="84" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1="97" y1="92" x2="101" y2="95" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                    {/* Nibbled Bite Marks at Top */}
                    <Circle cx="74" cy="72" r="3" fill="#FEF08A" />
                    <Circle cx="76" cy="70" r="1.5" fill="#4ADE80" />
                    {/* Leaves on snack */}
                    <Path d="M 92 88 Q 104 82 108 88 Q 98 94 92 88 Z" fill="#16A34A" />
                    <Path d="M 102 96 Q 114 90 117 97 Q 107 101 102 96 Z" fill="#4ADE80" />
                    {/* Tiny Munching Leaf Crumbs */}
                    <Circle cx="70" cy="78" r="1.2" fill="#22C55E" />
                    <Circle cx="78" cy="80" r="1" fill="#4ADE80" />

                    {/* 🐾 PAW 1: Left Hand Holding Bamboo Snack */}
                    <G id="rp-feast-paw-left">
                      <Path d="M 52 94 C 54 88, 66 84, 76 86 C 80 87, 82 92, 78 96 C 70 99, 60 102, 52 94 Z" fill="url(#rpDarkFurModal)" />
                      <Ellipse cx="76" cy="88" rx="5" ry="4.2" fill="url(#rpDarkFurModal)" transform="rotate(-15 76 88)" />
                      <Ellipse cx="76" cy="88" rx="2.5" ry="2" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="72" cy="85.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="75.5" cy="83.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="79" cy="84.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                    </G>
                  </G>

                  {/* Chewing Animated Mouth */}
                  <G id="rp-chewing-mouth">
                    <Path d="M 76 69 Q 80 74 84 69" stroke="#1C1917" strokeWidth={2.4} strokeLinecap="round" fill="none" />
                  </G>
                </Svg>
              </View>

              {/* ======================================================== */}
              {/* LAYER 3: WAVING RIGHT ARM (PAW 2) Saying "Hi!" 👋       */}
              {/* ======================================================== */}
              <Animated.View
                style={[
                  styles.layerAbsolute,
                  {
                    transform: [{ rotate: waveRotation }],
                    transformOrigin: '61.25% 57.5%' as any,
                    zIndex: 8,
                  },
                ]}
                pointerEvents="none"
              >
                <Svg width={160} height={160} viewBox="0 0 160 160">
                  <Defs>
                    <LinearGradient id="rpDarkFurArmModal" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#3F1D0B" />
                      <Stop offset="100%" stopColor="#240F05" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d="M 96 92 C 102 96, 114 91, 115 80 C 116 73, 113 66, 109 63 C 104 62, 100 68, 99 76 C 98 83, 94 88, 96 92 Z"
                    fill="url(#rpDarkFurArmModal)"
                  />
                  <Ellipse cx="109" cy="64" rx="4.8" ry="3.8" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="104" cy="61" r="1.3" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="108" cy="58.5" r="1.3" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="112" cy="59.5" r="1.3" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="115.5" cy="62" r="1.3" fill="#FEF08A" opacity={0.95} />
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
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  layerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
