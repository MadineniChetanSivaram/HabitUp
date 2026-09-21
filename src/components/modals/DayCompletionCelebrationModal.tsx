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
  const pandaSlideDownAnim = useRef(new Animated.Value(-320)).current;
  const pandaBounceAnim = useRef(new Animated.Value(1)).current;

  // Waving Paw Animation
  const waveAnim = useRef(new Animated.Value(0)).current;
  // Tail Wag Animation
  const tailAnim = useRef(new Animated.Value(0)).current;
  // Rewards & Speech bubble pop
  const rewardsPopAnim = useRef(new Animated.Value(0)).current;
  const speechBubblePopAnim = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isDayCompletionModalOpen) {
      sheetSlideAnim.setValue(450);
      sheetScaleAnim.setValue(0.8);
      pandaSlideDownAnim.setValue(-320);
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
      // Panda slides smoothly down the bamboo pole from high above (-320 -> 0) and lands firmly on the table
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(pandaSlideDownAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: useNative,
        }),
        // Landing squish bounce directly on table
        Animated.sequence([
          Animated.timing(pandaBounceAnim, {
            toValue: 1.09,
            duration: 80,
            useNativeDriver: useNative,
          }),
          Animated.spring(pandaBounceAnim, {
            toValue: 1,
            friction: 4.5,
            tension: 65,
            useNativeDriver: useNative,
          }),
        ]),
      ]),
      // Speech bubble pop in after landing on table
      Animated.sequence([
        Animated.delay(720),
        Animated.spring(speechBubblePopAnim, {
          toValue: 1,
          friction: 4.5,
          tension: 65,
          useNativeDriver: useNative,
        }),
      ]),
      // Rewards card pop in
      Animated.sequence([
        Animated.delay(860),
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

    // 4. Forest Aura Glow Pulse
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

          {/* BAMBOO FOREST & STOOL CELEBRATION STAGE */}
          <View
            style={[
              styles.bambooStage,
              {
                borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(167, 243, 208, 0.6)',
                backgroundColor: isDark ? 'rgba(6, 78, 59, 0.2)' : 'rgba(236, 253, 245, 0.6)',
              },
            ]}
          >
            {/* Aura Forest Glow */}
            <Animated.View
              style={[
                styles.auraCircle,
                {
                  transform: [{ scale: auraPulse }],
                },
              ]}
            />

            {/* Lush Bamboo Forest Environment + Crafted Bamboo Stool */}
            <Svg width="100%" height={215} viewBox="0 0 320 215" style={styles.bambooSvg}>
              <Defs>
                {/* Forest Atmosphere Gradient */}
                <LinearGradient id="forestAtmosphere" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={isDark ? '#064E3B' : '#DCFCE7'} stopOpacity={0.45} />
                  <Stop offset="60%" stopColor={isDark ? '#022C22' : '#F0FDF4'} stopOpacity={0.7} />
                  <Stop offset="100%" stopColor={isDark ? '#064E3B' : '#BBF7D0'} stopOpacity={0.9} />
                </LinearGradient>

                {/* Distant Bamboo Trunk Gradient */}
                <LinearGradient id="deepBambooGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#047857" />
                  <Stop offset="50%" stopColor="#059669" />
                  <Stop offset="100%" stopColor="#065F46" />
                </LinearGradient>

                {/* Mid-ground Bamboo Stalk Gradient */}
                <LinearGradient id="midBambooGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#15803D" />
                  <Stop offset="40%" stopColor="#22C55E" />
                  <Stop offset="100%" stopColor="#166534" />
                </LinearGradient>

                {/* Main Slide Bamboo Trunk Gradient */}
                <LinearGradient id="slideBambooGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#166534" />
                  <Stop offset="30%" stopColor="#22C55E" />
                  <Stop offset="70%" stopColor="#4ADE80" />
                  <Stop offset="100%" stopColor="#15803D" />
                </LinearGradient>

                {/* Leaf Foliage Gradient */}
                <LinearGradient id="forestLeafGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#86EFAC" />
                  <Stop offset="100%" stopColor="#16A34A" />
                </LinearGradient>

                {/* Distant Foliage Gradient */}
                <LinearGradient id="distantLeafGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#6EE7B7" />
                  <Stop offset="100%" stopColor="#047857" />
                </LinearGradient>

                {/* Forest Moss Ground Gradient */}
                <LinearGradient id="mossGroundGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#16A34A" />
                  <Stop offset="35%" stopColor="#15803D" />
                  <Stop offset="100%" stopColor="#14532D" />
                </LinearGradient>

                {/* Bamboo Stool Timber Log Gradient */}
                <LinearGradient id="bambooStoolLogGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FDE68A" />
                  <Stop offset="40%" stopColor="#F59E0B" />
                  <Stop offset="80%" stopColor="#D97706" />
                  <Stop offset="100%" stopColor="#92400E" />
                </LinearGradient>

                {/* Bamboo Stool Green Tone Gradient for Legs */}
                <LinearGradient id="bambooStoolFreshGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#4D7C0F" />
                  <Stop offset="40%" stopColor="#84CC16" />
                  <Stop offset="80%" stopColor="#65A30D" />
                  <Stop offset="100%" stopColor="#3F6212" />
                </LinearGradient>

                {/* Log End Cap Radial Gradient */}
                <RadialGradient id="logCapGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FEF3C7" />
                  <Stop offset="70%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#B45309" />
                </RadialGradient>
              </Defs>

              {/* 1. Atmospheric Forest Background Tint */}
              <Rect x="0" y="0" width="320" height="215" rx="24" fill="url(#forestAtmosphere)" />

              {/* 2. Distant Forest Bamboo Grove */}
              {/* Stalk 1 (Far Left) */}
              <Rect x="20" y="0" width="9" height="185" rx="2" fill="url(#deepBambooGrad)" opacity={0.45} />
              <Line x1="19" y1="35" x2="30" y2="35" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Line x1="19" y1="80" x2="30" y2="80" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Line x1="19" y1="130" x2="30" y2="130" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Path d="M 28 35 Q 50 20 60 28 Q 45 38 28 36 Z" fill="url(#distantLeafGrad)" opacity={0.5} />
              <Path d="M 28 37 Q 48 45 55 60 Q 38 55 28 40 Z" fill="url(#distantLeafGrad)" opacity={0.5} />

              {/* Stalk 2 (Mid-Left Background) */}
              <Rect x="58" y="0" width="12" height="185" rx="2.5" fill="url(#midBambooGrad)" opacity={0.65} />
              <Line x1="57" y1="45" x2="71" y2="45" stroke="#14532D" strokeWidth={2.2} opacity={0.65} />
              <Line x1="57" y1="95" x2="71" y2="95" stroke="#14532D" strokeWidth={2.2} opacity={0.65} />
              <Line x1="57" y1="145" x2="71" y2="145" stroke="#14532D" strokeWidth={2.2} opacity={0.65} />
              <Path d="M 58 45 Q 35 30 22 38 Q 40 48 58 46 Z" fill="url(#forestLeafGrad)" opacity={0.7} />
              <Path d="M 70 95 Q 95 82 108 92 Q 90 102 70 97 Z" fill="url(#forestLeafGrad)" opacity={0.7} />

              {/* Stalk 3 (Far Right Background) */}
              <Rect x="290" y="0" width="8" height="185" rx="2" fill="url(#deepBambooGrad)" opacity={0.45} />
              <Line x1="289" y1="40" x2="299" y2="40" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Line x1="289" y1="90" x2="299" y2="90" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Line x1="289" y1="140" x2="299" y2="140" stroke="#065F46" strokeWidth={2} opacity={0.45} />
              <Path d="M 290 40 Q 268 25 258 35 Q 275 44 290 42 Z" fill="url(#distantLeafGrad)" opacity={0.5} />

              {/* Stalk 4 (Mid-Right Background) */}
              <Rect x="252" y="0" width="13" height="185" rx="3" fill="url(#midBambooGrad)" opacity={0.7} />
              <Line x1="251" y1="50" x2="266" y2="50" stroke="#14532D" strokeWidth={2.5} opacity={0.7} />
              <Line x1="251" y1="105" x2="266" y2="105" stroke="#14532D" strokeWidth={2.5} opacity={0.7} />
              <Line x1="251" y1="155" x2="266" y2="155" stroke="#14532D" strokeWidth={2.5} opacity={0.7} />
              <Path d="M 265 50 Q 290 35 305 45 Q 288 56 265 52 Z" fill="url(#forestLeafGrad)" opacity={0.75} />
              <Path d="M 252 105 Q 228 92 215 102 Q 235 112 252 107 Z" fill="url(#forestLeafGrad)" opacity={0.75} />

              {/* Floating Forest Sparkles / Fireflies */}
              <Circle cx="45" cy="70" r="2.2" fill="#FDE047" opacity={0.8} />
              <Circle cx="85" cy="35" r="1.8" fill="#FDE047" opacity={0.7} />
              <Circle cx="240" cy="65" r="2" fill="#FDE047" opacity={0.85} />
              <Circle cx="280" cy="115" r="2.5" fill="#FDE047" opacity={0.75} />
              <Circle cx="100" cy="130" r="1.6" fill="#FDE047" opacity={0.7} />
              <Path d="M 275 35 L 277 40 L 282 41 L 278 44 L 279 49 L 275 46 L 271 49 L 272 44 L 268 41 L 273 40 Z" fill="#FDE047" opacity={0.85} />
              <Path d="M 50 110 L 51.5 114 L 55.5 115 L 52.5 117 L 53.5 121 L 50 119 L 46.5 121 L 47.5 117 L 44.5 115 L 48.5 114 Z" fill="#FDE047" opacity={0.8} />

              {/* 3. The Slide Bamboo Stalk (Foreground Slide Pole) */}
              <Rect x="194" y="0" width="18" height="190" rx="3.5" fill="url(#slideBambooGrad)" />
              <Line x1="192" y1="30" x2="214" y2="30" stroke="#14532D" strokeWidth={3} strokeLinecap="round" />
              <Line x1="192" y1="75" x2="214" y2="75" stroke="#14532D" strokeWidth={3} strokeLinecap="round" />
              <Line x1="192" y1="120" x2="214" y2="120" stroke="#14532D" strokeWidth={3} strokeLinecap="round" />
              <Line x1="192" y1="165" x2="214" y2="165" stroke="#14532D" strokeWidth={3} strokeLinecap="round" />

              {/* Canopy Branches & Leaves on Slide Stalk */}
              <Path d="M 212 30 Q 240 15 255 25 Q 235 37 212 33 Z" fill="url(#forestLeafGrad)" />
              <Path d="M 212 32 Q 235 40 248 55 Q 225 53 212 36 Z" fill="url(#forestLeafGrad)" />
              <Path d="M 194 75 Q 168 60 155 70 Q 175 80 194 77 Z" fill="url(#forestLeafGrad)" />
              <Path d="M 212 120 Q 238 108 250 120 Q 230 130 212 123 Z" fill="url(#forestLeafGrad)" />

              {/* 4. Mossy Forest Floor Ground */}
              <Path d="M -10 182 Q 70 168 160 172 Q 250 176 330 168 L 330 220 L -10 220 Z" fill="url(#mossGroundGrad)" />

              {/* Sprouting Young Bamboo Shoots on Ground */}
              <Path d="M 38 184 L 38 170 Q 42 165 44 170 L 44 184 Z" fill="#84CC16" />
              <Path d="M 41 168 Q 32 162 30 168 Q 36 172 41 168 Z" fill="#4ADE80" />
              <Path d="M 41 168 Q 48 160 52 165 Q 46 171 41 168 Z" fill="#22C55E" />

              <Path d="M 280 180 L 280 166 Q 284 161 286 166 L 286 180 Z" fill="#84CC16" />
              <Path d="M 283 164 Q 275 158 273 164 Q 279 168 283 164 Z" fill="#4ADE80" />
              <Path d="M 283 164 Q 290 156 294 161 Q 288 167 283 164 Z" fill="#22C55E" />

              {/* 5. 🎋 THE CRAFTED BAMBOO TABLE (Panda sits solidly on top) */}
              <G id="bamboo-table">
                {/* Table Soft Ground Shadow */}
                <Ellipse cx="160" cy="202" rx="58" ry="8" fill="rgba(6, 78, 59, 0.45)" />

                {/* Table Back Legs */}
                <Path d="M 118 156 L 110 198 L 117 198 L 125 156 Z" fill="url(#bambooStoolFreshGrad)" />
                <Line x1="113" y1="178" x2="122" y2="178" stroke="#14532D" strokeWidth={2} strokeLinecap="round" />

                <Path d="M 195 156 L 203 198 L 210 198 L 202 156 Z" fill="url(#bambooStoolFreshGrad)" />
                <Line x1="198" y1="178" x2="207" y2="178" stroke="#14532D" strokeWidth={2} strokeLinecap="round" />

                {/* Table Stretcher Crossbar */}
                <Rect x="112" y="179" width="96" height="7" rx="3.5" fill="url(#bambooStoolLogGrad)" stroke="#B45309" strokeWidth={0.8} />
                <Line x1="140" y1="179" x2="140" y2="186" stroke="#92400E" strokeWidth={1.5} />
                <Line x1="180" y1="179" x2="180" y2="186" stroke="#92400E" strokeWidth={1.5} />

                {/* Table Front Left Leg */}
                <Path d="M 124 158 L 116 202 L 124 202 L 132 158 Z" fill="url(#bambooStoolFreshGrad)" stroke="#14532D" strokeWidth={0.8} />
                <Line x1="119" y1="180" x2="128" y2="180" stroke="#14532D" strokeWidth={2.2} strokeLinecap="round" />
                <Line x1="117" y1="196" x2="125" y2="196" stroke="#14532D" strokeWidth={2.2} strokeLinecap="round" />

                {/* Table Front Right Leg */}
                <Path d="M 188 158 L 196 202 L 204 202 L 196 158 Z" fill="url(#bambooStoolFreshGrad)" stroke="#14532D" strokeWidth={0.8} />
                <Line x1="192" y1="180" x2="201" y2="180" stroke="#14532D" strokeWidth={2.2} strokeLinecap="round" />
                <Line x1="195" y1="196" x2="203" y2="196" stroke="#14532D" strokeWidth={2.2} strokeLinecap="round" />

                {/* Bamboo Table Top Logs (Polished Canes) */}
                <Rect x="100" y="152" width="120" height="9" rx="4.5" fill="url(#bambooStoolLogGrad)" stroke="#B45309" strokeWidth={0.8} />
                <Rect x="96" y="157" width="128" height="9" rx="4.5" fill="url(#bambooStoolLogGrad)" stroke="#B45309" strokeWidth={0.8} />
                <Rect x="100" y="162" width="120" height="9" rx="4.5" fill="url(#bambooStoolLogGrad)" stroke="#B45309" strokeWidth={0.8} />

                {/* Node Rings across the table */}
                <Line x1="135" y1="152" x2="135" y2="171" stroke="#92400E" strokeWidth={1.8} strokeLinecap="round" />
                <Line x1="185" y1="152" x2="185" y2="171" stroke="#92400E" strokeWidth={1.8} strokeLinecap="round" />

                {/* Round Cut Ends of Bamboo Table Logs */}
                <Ellipse cx="102" cy="157" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="102" cy="157" r="1.5" fill="#78350F" />
                <Ellipse cx="98" cy="162" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="98" cy="162" r="1.5" fill="#78350F" />
                <Ellipse cx="102" cy="167" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="102" cy="167" r="1.5" fill="#78350F" />

                <Ellipse cx="218" cy="157" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="218" cy="157" r="1.5" fill="#78350F" />
                <Ellipse cx="222" cy="162" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="222" cy="162" r="1.5" fill="#78350F" />
                <Ellipse cx="218" cy="167" rx="3.5" ry="4" fill="url(#logCapGrad)" stroke="#92400E" strokeWidth={0.8} />
                <Circle cx="218" cy="167" r="1.5" fill="#78350F" />

                {/* Twine Rope Cross-Ties on Joints */}
                <Path d="M 118 159 L 126 171 M 126 159 L 118 171" stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
                <Path d="M 194 159 L 202 171 M 202 159 L 194 171" stroke="#78350F" strokeWidth={2} strokeLinecap="round" />

                {/* Woven Green Leaf Runner on Table */}
                <Path d="M 125 154 Q 160 151 195 154 Q 192 160 190 162 Q 160 159 130 162 Z" fill="#15803D" opacity={0.9} />
                <Path d="M 127 155 Q 160 153 193 155" stroke="#86EFAC" strokeWidth={1} strokeDasharray="3,2" fill="none" />
              </G>
            </Svg>

            {/* SLIDING PANDA (Slides Down Bamboo & Sits Solidly on Bamboo Table) */}
            <Animated.View
              style={[
                styles.slidingPandaWrapper,
                {
                  transform: [
                    { translateY: pandaSlideDownAnim },
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
    width: '100%',
    maxWidth: 360,
    height: 215,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginVertical: 4,
  },
  auraCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  bambooSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  slidingPandaWrapper: {
    position: 'absolute',
    width: 160,
    height: 160,
    top: 40,
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
