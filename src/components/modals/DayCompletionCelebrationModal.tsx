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
import { Flame, Check, Trophy } from 'lucide-react-native';

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

  // Modal fade & float
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentScaleAnim = useRef(new Animated.Value(0.85)).current;

  // Panda sliding DOWN the bamboo stalk from top
  const pandaSlideDownAnim = useRef(new Animated.Value(-260)).current;
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
      contentFadeAnim.setValue(0);
      contentScaleAnim.setValue(0.85);
      pandaSlideDownAnim.setValue(-260);
      pandaBounceAnim.setValue(1);
      rewardsPopAnim.setValue(0);
      speechBubblePopAnim.setValue(0);
      return;
    }

    const useNative = Platform.OS !== 'web';
    setMessageIndex(Math.floor(Math.random() * CELEBRATION_MESSAGES.length));

    // 1. Fade in on screen & Panda slides DOWN the bamboo
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      }),
      Animated.spring(contentScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: useNative,
      }),
      // Panda slides smoothly down the bamboo pole from top (-260 -> 0)
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(pandaSlideDownAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: useNative,
        }),
        // Landing bounce on bamboo
        Animated.sequence([
          Animated.timing(pandaBounceAnim, {
            toValue: 1.14,
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
        Animated.delay(350),
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
          toValue: -5,
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
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.quad),
        useNativeDriver: useNative,
      }),
      Animated.timing(contentScaleAnim, {
        toValue: 0.8,
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
    outputRange: ['-20deg', '0deg', '24deg'],
  });

  const tailRotation = tailAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Modal
      visible={isDayCompletionModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      {/* Dimmed Screen Backdrop without any boxed white container */}
      <View style={styles.modalBackdrop}>
        <Animated.View
          style={[
            styles.screenContentWrapper,
            {
              opacity: contentFadeAnim,
              transform: [{ scale: contentScaleAnim }],
            },
          ]}
        >
          {/* Top Trophy Banner */}
          <View style={styles.topBadgeRow}>
            <View style={styles.trophyBadge}>
              <Trophy size={15} color="#F59E0B" />
              <Text style={styles.trophyBadgeText}>
                {t('celebration.perfect_day', 'PERFECT 100% DAY!')}
              </Text>
            </View>
          </View>

          {/* Floating Speech Bubble (Duolingo Style) */}
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
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
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
                    borderTopColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* BAMBOO TREE CLIMB & SLIDE STAGE */}
          <View style={styles.bambooStage}>
            {/* Ambient Aura Glow behind Bamboo */}
            <Animated.View
              style={[
                styles.auraCircle,
                {
                  transform: [{ scale: auraPulse }],
                },
              ]}
            />

            {/* Tall Vertical Bamboo Stalk */}
            <Svg width={240} height={210} viewBox="0 0 240 210" style={styles.bambooSvg}>
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
              <Rect x="130" y="0" width="22" height="210" rx="5" fill="url(#bambooTrunkGrad)" />
              {/* Bamboo Segment Joint Rings */}
              <Line x1="128" y1="35" x2="154" y2="35" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="128" y1="85" x2="154" y2="85" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="128" y1="145" x2="154" y2="145" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />
              <Line x1="128" y1="195" x2="154" y2="195" stroke="#14532D" strokeWidth={3.5} strokeLinecap="round" />

              {/* Sprouting Bamboo Shoots & Leaves on sides */}
              <Path d="M 152 35 Q 180 20 198 30 Q 175 44 152 38 Z" fill="url(#leafGrad)" />
              <Path d="M 152 37 Q 178 46 190 62 Q 165 60 152 41 Z" fill="url(#leafGrad)" />
              <Path d="M 130 145 Q 100 130 82 140 Q 105 154 130 148 Z" fill="url(#leafGrad)" />
              <Path d="M 152 145 Q 182 134 195 146 Q 172 158 152 148 Z" fill="url(#leafGrad)" />
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
                <Svg width={76} height={76} viewBox="0 0 76 76">
                  <Defs>
                    <LinearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#FB923C" />
                      <Stop offset="50%" stopColor="#EA580C" />
                      <Stop offset="100%" stopColor="#C2410C" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M 54 60 C 22 66, 2 50, 8 22 C 12 6, 32 12, 46 32 Z" fill="url(#tailGrad)" />
                  <Path d="M 8 22 C 10 10, 26 8, 30 18 C 20 22, 10 26, 8 22 Z" fill="#FFF7ED" />
                  <Path d="M 16 30 C 24 27, 30 30, 35 38 C 28 42, 20 40, 16 30 Z" fill="#3B1A0E" opacity={0.7} />
                  <Path d="M 26 42 C 32 40, 38 43, 43 50 C 37 54, 30 52, 26 42 Z" fill="#3B1A0E" opacity={0.7} />
                </Svg>
              </Animated.View>

              {/* Main Red Panda Body (Turned Right, Showing Left Body & Clinging to Bamboo) */}
              <Svg width={180} height={180} viewBox="0 0 180 180">
                <Defs>
                  <RadialGradient id="pandaHeadFur" cx="45%" cy="35%" r="65%">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="55%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#C2410C" />
                  </RadialGradient>
                  <LinearGradient id="pandaBodyFur" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="45%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#9A3412" />
                  </LinearGradient>
                  <LinearGradient id="chestFurGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#FFF7ED" />
                    <Stop offset="100%" stopColor="#FFEDD5" />
                  </LinearGradient>
                  <LinearGradient id="goldCrown" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="60%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </LinearGradient>
                </Defs>

                {/* 1. FAR HIND LEG (Right Leg - Wrapping around right side of bamboo) */}
                <G id="far-hind-leg">
                  <Path
                    d="M 94 122 C 104 122, 115 120, 122 125 C 126 128, 125 134, 119 136 C 111 136, 101 133, 94 129 Z"
                    fill="#9A3412"
                  />
                  <Circle cx="121" cy="129" r="5.5" fill="#38180C" />
                  <Circle cx="121" cy="129" r="2.3" fill="#F472B6" />
                </G>

                {/* 2. FAR FRONT ARM (Right Arm - Gripping around right side of bamboo) */}
                <G id="far-front-arm">
                  <Path
                    d="M 80 77 C 94 73, 112 73, 122 77 C 126 79, 125 85, 119 87 C 109 87, 95 85, 80 82 Z"
                    fill="#EA580C"
                  />
                  <Circle cx="121" cy="81" r="5.8" fill="#38180C" />
                  <Circle cx="120.5" cy="81" r="2.4" fill="#F472B6" />
                </G>

                {/* 3. CHUBBY RED-PANDA TORSO (Turned right, showing Left Body Profile & Flank) */}
                <Path
                  d="M 54 76 C 42 92, 44 120, 56 134 C 72 140, 92 138, 102 131 C 108 115, 106 92, 95 78 C 82 72, 66 72, 54 76 Z"
                  fill="url(#pandaBodyFur)"
                />

                {/* Soft Creamy Chest & Belly Patch (Facing right against bamboo) */}
                <Path
                  d="M 76 80 C 68 98, 70 124, 82 133 C 94 135, 101 129, 103 119 C 105 101, 99 84, 89 80 C 83 78, 78 78, 76 80 Z"
                  fill="url(#chestFurGrad)"
                />

                {/* 4. NEAR HIND LEG (Left Leg - Bent naturally & firmly gripping front of bamboo) */}
                <G id="near-hind-leg">
                  <Path
                    d="M 54 120 C 52 131, 62 139, 78 139 C 91 139, 101 135, 104 129 C 102 123, 86 121, 72 119 C 62 117, 56 117, 54 120 Z"
                    fill="url(#pandaBodyFur)"
                  />
                  {/* Espresso Paw & Pink Pads on Bamboo */}
                  <Ellipse cx="101" cy="129" rx="6.5" ry="5.5" fill="#38180C" transform="rotate(-10, 101, 129)" />
                  <Ellipse cx="101" cy="129" rx="3.2" ry="2.2" fill="#F472B6" />
                  <Circle cx="97" cy="125.5" r="1.1" fill="#F472B6" />
                  <Circle cx="101" cy="123.5" r="1.1" fill="#F472B6" />
                  <Circle cx="105" cy="125.5" r="1.1" fill="#F472B6" />
                </G>

                {/* Fluffy Round Ears (3/4 Right Perspective) */}
                <G id="ears">
                  {/* Left Ear (Near/Closer) */}
                  <Path d="M 46 36 C 34 20, 48 8, 62 18 C 66 24, 62 32, 56 38 Z" fill="url(#pandaHeadFur)" />
                  <Path d="M 48 34 C 38 22, 48 14, 58 22 Z" fill="#FFFFFF" />

                  {/* Right Ear (Far/Receding) */}
                  <Path d="M 98 34 C 108 18, 96 8, 84 18 C 80 24, 84 32, 90 38 Z" fill="url(#pandaHeadFur)" />
                  <Path d="M 96 32 C 104 22, 94 14, 86 22 Z" fill="#FFFFFF" />
                </G>

                {/* Equipped Hat (Rendered ONLY if user equipped one - No default crown) */}
                {equippedHat === 'detective' && (
                  <G id="hat-detective">
                    <Path d="M 54 28 C 52 14, 64 8, 80 8 C 96 8, 106 14, 104 28 Z" fill="#78350F" />
                    <Path d="M 46 28 Q 78 36 110 28 Q 78 24 46 28 Z" fill="#451A03" />
                  </G>
                )}
                {equippedHat === 'wizard' && (
                  <G id="hat-wizard">
                    <Path d="M 56 28 C 66 14, 72 2, 80 0 C 86 6, 90 16, 102 28 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                    <Ellipse cx="78" cy="28" rx="24" ry="5.5" fill="#1E1B4B" />
                    <Path d="M 74 14 L 75.5 17 L 79 17.5 L 76.5 20 L 77 23 L 74 21.5 L 71 23 L 71.5 20 L 69 17.5 L 72.5 17 Z" fill="#FDE047" />
                  </G>
                )}
                {equippedHat === 'chef' && (
                  <G id="hat-chef">
                    <Path d="M 60 24 C 54 12, 64 2, 72 4 C 76 -2, 88 -2, 92 4 C 100 2, 108 12, 102 24 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
                    <Rect x="60" y="22" width="38" height="6" rx="2" fill="#E2E8F0" />
                  </G>
                )}
                {equippedHat === 'crown' && (
                  <G id="hat-crown">
                    <Path d="M 64 24 L 68 8 L 74 16 L 78 4 L 82 16 L 88 8 L 92 24 Z" fill="url(#goldCrown)" stroke="#B45309" strokeWidth={1} />
                    <Circle cx="78" cy="11" r="2" fill="#EF4444" />
                    <Circle cx="69" cy="15" r="1.5" fill="#3B82F6" />
                    <Circle cx="87" cy="15" r="1.5" fill="#10B981" />
                  </G>
                )}

                {/* Round Cute Head (3/4 Angle) */}
                <Circle cx="76" cy="56" r="32" fill="url(#pandaHeadFur)" />

                {/* Soft White Cheek Fur Patches */}
                <Ellipse cx="54" cy="62" rx="11" ry="8.5" fill="#FFFFFF" />
                <Ellipse cx="96" cy="60" rx="10" ry="8" fill="#FFFFFF" />
                <Ellipse cx="62" cy="42" rx="3.8" ry="5.5" fill="#FFFFFF" transform="rotate(-15, 62, 42)" />
                <Ellipse cx="88" cy="40" rx="3.5" ry="5" fill="#FFFFFF" transform="rotate(15, 88, 40)" />

                {/* Tear Stripes */}
                <Path d="M 60 56 C 58 62, 57 69, 53 72" stroke="#9A3412" strokeWidth={2.6} strokeLinecap="round" fill="none" />
                <Path d="M 92 55 C 94 61, 95 68, 98 71" stroke="#9A3412" strokeWidth={2.6} strokeLinecap="round" fill="none" />

                {/* Big Shiny Anime / Duolingo Eyes */}
                {/* Left Eye (Near) */}
                <Circle cx="66" cy="53" r="5.8" fill="#1E1B4B" />
                <Circle cx="68.2" cy="50.8" r="2.2" fill="#FFFFFF" />
                <Circle cx="65" cy="55" r="1.0" fill="#FFFFFF" />

                {/* Right Eye (Far) */}
                <Circle cx="88" cy="52" r="5.4" fill="#1E1B4B" />
                <Circle cx="90.2" cy="49.8" r="2.0" fill="#FFFFFF" />
                <Circle cx="87" cy="54" r="0.9" fill="#FFFFFF" />

                {/* Equipped Glasses */}
                {equippedGlasses === 'shades' && (
                  <G id="glasses-shades">
                    <Path d="M 54 50 Q 66 48 76 52 L 75 59 Q 65 61 55 57 Z" fill="#090D16" />
                    <Path d="M 80 52 Q 91 48 100 50 L 99 57 Q 90 61 81 59 Z" fill="#090D16" />
                    <Line x1="75" y1="52" x2="81" y2="52" stroke="#090D16" strokeWidth={2.5} />
                  </G>
                )}
                {equippedGlasses === 'nerd' && (
                  <G id="glasses-nerd">
                    <Circle cx="66" cy="53" r="7.5" stroke="#000000" strokeWidth={2} fill="none" />
                    <Circle cx="88" cy="52" r="7.2" stroke="#000000" strokeWidth={2} fill="none" />
                    <Line x1="73.5" y1="53" x2="81" y2="52.5" stroke="#000000" strokeWidth={2.2} />
                  </G>
                )}

                {/* Snout & Nose */}
                <Ellipse cx="78" cy="64" rx="11" ry="7.5" fill="#FFFFFF" />
                <Path d="M 75 61 C 75 59, 81 59, 81 61 C 81 63, 78 65, 78 65 C 78 65, 75 63, 75 61 Z" fill="#1F2937" />
                <Circle cx="76.8" cy="60.5" r="0.6" fill="#FFFFFF" />

                {/* Happy Big Smile */}
                <Path d="M 73 66 Q 78 72 83 66" stroke="#991B1B" strokeWidth={2.4} fill="#EF4444" strokeLinecap="round" />

                {/* Whiskers */}
                <Line x1="46" y1="62" x2="32" y2="60" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.85} />
                <Line x1="46" y1="66" x2="33" y2="69" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.85} />
                <Line x1="104" y1="60" x2="116" y2="58" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.85} />
                <Line x1="104" y1="64" x2="115" y2="67" stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.85} />
              </Svg>

              {/* SEPARATE ANIMATED WAVING LEFT FRONT PAW ("Hi! 👋") */}
              <Animated.View
                style={[
                  styles.wavingPawWrapper,
                  {
                    transform: [{ rotate: waveRotation }],
                    transformOrigin: '25% 75%' as any,
                  },
                ]}
              >
                <Svg width={46} height={46} viewBox="0 0 46 46">
                  {/* Waving Near Left Arm & Paw */}
                  <Path d="M 12 36 C 10 24, 20 12, 32 8 C 38 12, 40 20, 32 28 C 24 34, 18 38, 12 36 Z" fill="#EA580C" />
                  <Circle cx="32" cy="12" r="7.5" fill="#38180C" />
                  {/* Pink Paw Pads */}
                  <Circle cx="31" cy="12" r="3.2" fill="#F472B6" />
                  <Circle cx="26" cy="10" r="1.4" fill="#F472B6" />
                  <Circle cx="29" cy="6" r="1.4" fill="#F472B6" />
                  <Circle cx="34" cy="6" r="1.4" fill="#F472B6" />
                </Svg>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Floating Rewards Grid (Glassmorphic) */}
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
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : '#86EFAC',
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
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D',
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

          {/* Floating Duolingo-style Action Dismiss Button */}
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
              <Check size={22} color="#FFFFFF" strokeWidth={3} />
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
    backgroundColor: 'rgba(5, 10, 20, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  screenContentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadgeRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  speechBubbleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 20,
  },
  speechBubble: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    maxWidth: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  speechBubbleText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  speechArrow: {
    position: 'absolute',
    bottom: -11,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bambooStage: {
    position: 'relative',
    width: 240,
    height: 205,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginVertical: 6,
  },
  auraCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
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
    left: 2,
    bottom: 24,
    zIndex: 1,
  },
  wavingPawWrapper: {
    position: 'absolute',
    left: 42,
    top: 38,
    zIndex: 10,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginVertical: 16,
  },
  rewardCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  rewardSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  awesomeBtn: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  awesomeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  awesomeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
