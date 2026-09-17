import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
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
} from 'react-native-svg';
import { useHabit } from '../../context/HabitContext';
import { isHabitScheduledOnDate } from '../../utils/streakCalculator';

export type MascotMood = 'sleeping' | 'awake' | 'hopeful' | 'hyped' | 'celebrating' | 'rest';

interface HabitlyMascotProps {
  onClick?: () => void;
  size?: number;
  forcedMood?: MascotMood;
}

const AnimatedG = Animated.createAnimatedComponent(G);

export const HabitlyMascot: React.FC<HabitlyMascotProps> = ({
  onClick,
  size = 120,
  forcedMood,
}) => {
  const { habits, completions, selectedDate, theme, t } = useHabit();
  const isDark = theme === 'dark';

  // 1. Calculate active daily completion progress
  const activeHabits = habits.filter((h) => !h.archived_at && !h.deleted_at && !h.paused_at);
  const selectedDateTime = new Date(selectedDate + 'T12:00:00');
  const scheduledToday = activeHabits.filter((h) => isHabitScheduledOnDate(h, selectedDateTime));
  const completedToday = scheduledToday.filter((h) =>
    completions.some(
      (c) => c.habit_id === h.id && (c.completion_date || '').split('T')[0] === selectedDate
    )
  );

  const totalCount = scheduledToday.length;
  const completedCount = completedToday.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Awake state: Mascot starts asleep if 0 habits done, wakes up on user tap or habit completion
  const [isAwake, setIsAwake] = useState<boolean>(completedCount > 0);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Auto-wake up whenever user completes a habit
  useEffect(() => {
    if (completedCount > 0 && !isAwake) {
      setIsAwake(true);
      setShowSpeechBubble(true);
    }
  }, [completedCount]);

  // Determine active mood
  let mood: MascotMood = 'sleeping';
  if (forcedMood) {
    mood = forcedMood;
  } else if (totalCount === 0) {
    mood = 'rest';
  } else if (!isAwake && completedCount === 0) {
    mood = 'sleeping';
  } else if (completedCount === 0) {
    mood = 'awake'; // User woke up mascot before starting habits
  } else if (progressPercent === 100) {
    mood = 'celebrating';
  } else if (progressPercent >= 50) {
    mood = 'hyped';
  } else {
    mood = 'hopeful';
  }

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const handWave = useRef(new Animated.Value(0)).current;
  const zzzAnim1 = useRef(new Animated.Value(0)).current;
  const zzzAnim2 = useRef(new Animated.Value(0)).current;
  const zzzAnim3 = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(0.85)).current;

  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    const isSleep = mood === 'sleeping';

    // 1. Floating / Breathing loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: isSleep ? 2 : mood === 'hyped' || mood === 'celebrating' ? -6 : -4,
          duration: isSleep ? 2200 : mood === 'hyped' ? 1100 : 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: isSleep ? 5 : mood === 'hyped' || mood === 'celebrating' ? 4 : 3,
          duration: isSleep ? 2200 : mood === 'hyped' ? 1100 : 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 2. Tail Wagging Loop
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: isSleep ? 1.5 : mood === 'celebrating' || mood === 'hyped' ? 5 : 3,
          duration: isSleep ? 2000 : mood === 'celebrating' ? 380 : 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(tailWag, {
          toValue: isSleep ? -1.5 : mood === 'celebrating' || mood === 'hyped' ? -5 : -3,
          duration: isSleep ? 2000 : mood === 'celebrating' ? 380 : 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    tailLoop.start();

    // 3. Hand Wave Greeting Loop (active when awake / celebrating / hyped)
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(handWave, {
          toValue: 1,
          duration: 360,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false, // SVG rotation attribute requires JS driver on web
        }),
        Animated.timing(handWave, {
          toValue: -1,
          duration: 360,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    waveLoop.start();

    // 4. Floating Zzz Animation Loop (when sleeping)
    const zzz1 = Animated.loop(
      Animated.timing(zzzAnim1, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );
    const zzz2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(zzzAnim2, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );
    const zzz3 = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(zzzAnim3, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );

    if (isSleep) {
      zzz1.start();
      zzz2.start();
      zzz3.start();
    }

    // 5. Aura glow pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.15,
          duration: isSleep ? 2400 : 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(auraPulse, {
          toValue: 0.85,
          duration: isSleep ? 2400 : 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    auraLoop.start();

    return () => {
      floatLoop.stop();
      tailLoop.stop();
      waveLoop.stop();
      zzz1.stop();
      zzz2.stop();
      zzz3.stop();
      auraLoop.stop();
    };
  }, [mood]);

  // Tap handler: Wakes up if sleeping, waves hello and plays spring bounce
  const handlePress = () => {
    if (!isAwake) {
      setIsAwake(true);
      setShowSpeechBubble(true);
      setQuoteIndex(0);
    } else {
      setShowSpeechBubble(true);
      setQuoteIndex((prev) => (prev + 1) % 5);
    }

    // Spring squash & stretch
    Animated.sequence([
      Animated.timing(bounceScale, {
        toValue: 0.84,
        duration: 90,
        easing: Easing.out(Easing.ease),
        useNativeDriver: useNative,
      }),
      Animated.spring(bounceScale, {
        toValue: 1,
        friction: 3.5,
        tension: 45,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Ear wiggle animation
    Animated.sequence([
      Animated.timing(earWiggle, { toValue: 5, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: -5, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 3, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 0, duration: 75, useNativeDriver: useNative }),
    ]).start();

    if (onClick) {
      onClick();
    }
  };

  // Messages in speech bubble
  const getMoodMessage = () => {
    if (mood === 'sleeping') {
      return t('mascot.mood_sleeping', 'Zzz... 😴 Tap me to wake up!');
    }

    if (quoteIndex === 0 && mood === 'awake') {
      return t('mascot.mood_awake_hi', "Hi there! 👋 I'm Sparky! Ready to crush your first habit today? 🐾");
    }

    if (quoteIndex === 1) return t('mascot.tap_1', 'Consistency is your superpower! ⚡');
    if (quoteIndex === 2) return t('mascot.tap_2', "One habit at a time, you're building a great future! 🚀");
    if (quoteIndex === 3) return t('mascot.tap_3', 'High five! I believe in you! ✋');
    if (quoteIndex === 4) return t('mascot.tap_4', 'Keep showing up! You got this! 🌟');

    switch (mood) {
      case 'awake':
        return t('mascot.mood_awake_hi', "Hi there! 👋 I'm Sparky! Ready to crush your first habit today? 🐾");
      case 'hopeful':
        return t('mascot.mood_hopeful', 'Great start! Keep the momentum going! 🌱');
      case 'hyped':
        return t('mascot.mood_hyped', "Over halfway there! You're unstoppable today! 🔥");
      case 'celebrating':
        return t('mascot.mood_celebrating', 'PERFECT DAY! 🏆 All habits crushed! You are a legend! 🌟');
      case 'rest':
      default:
        return t('mascot.mood_rest', 'Rest & recharge! You earned it today! 🧘');
    }
  };

  const AnimatedView = Animated.View as any;

  // Aura colors based on mood
  const getAuraColor = () => {
    switch (mood) {
      case 'sleeping':
        return 'rgba(99, 102, 241, 0.22)';
      case 'awake':
        return 'rgba(251, 146, 60, 0.30)';
      case 'hopeful':
        return 'rgba(16, 185, 129, 0.28)';
      case 'hyped':
        return 'rgba(245, 158, 11, 0.38)';
      case 'celebrating':
        return 'rgba(236, 72, 153, 0.45)';
      case 'rest':
      default:
        return 'rgba(56, 189, 248, 0.25)';
    }
  };

  const auraColor = getAuraColor();

  // Waving rotation (numbers for SVG rotation)
  const pawWaveAngle = handWave.interpolate({
    inputRange: [-1, 1],
    outputRange: [-14, 18],
  });

  // Zzz Interpolations
  const z1Y = zzzAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -38] });
  const z1X = zzzAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 10, 18] });
  const z1Op = zzzAnim1.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.8, 0] });
  const z1Scale = zzzAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });

  const z2Y = zzzAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -44] });
  const z2X = zzzAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 12, 22] });
  const z2Op = zzzAnim2.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.8, 0] });
  const z2Scale = zzzAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] });

  const z3Y = zzzAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
  const z3X = zzzAnim3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, 26] });
  const z3Op = zzzAnim3.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.8, 0] });
  const z3Scale = zzzAnim3.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });

  const isWavingMood = mood === 'awake' || mood === 'celebrating' || mood === 'hyped';

  return (
    <View style={[styles.outerWrapper, { width: size * 1.3, height: size * 1.25 }]}>
      {/* 💬 Interactive Multilingual Speech Bubble */}
      {showSpeechBubble && (
        <TouchableOpacity
          style={[
            styles.speechBubble,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: mood === 'celebrating' ? '#F59E0B' : mood === 'sleeping' ? '#818CF8' : '#7C5CFF',
            },
          ]}
          onPress={() => setShowSpeechBubble(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.speechText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            {getMoodMessage()}
          </Text>
          <View
            style={[
              styles.speechArrow,
              { borderTopColor: mood === 'celebrating' ? '#F59E0B' : mood === 'sleeping' ? '#818CF8' : '#7C5CFF' },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* 💤 Floating Zzz Particles when Sleeping */}
      {mood === 'sleeping' && (
        <View style={styles.zzzContainer} pointerEvents="none">
          <AnimatedView
            style={[
              styles.zzzLetter,
              {
                opacity: z1Op,
                transform: [{ translateY: z1Y }, { translateX: z1X }, { scale: z1Scale }],
              },
            ]}
          >
            <Text style={[styles.zzzText, { fontSize: 13, color: isDark ? '#A5B4FC' : '#6366F1' }]}>z</Text>
          </AnimatedView>

          <AnimatedView
            style={[
              styles.zzzLetter,
              {
                opacity: z2Op,
                transform: [{ translateY: z2Y }, { translateX: z2X }, { scale: z2Scale }],
              },
            ]}
          >
            <Text style={[styles.zzzText, { fontSize: 16, color: isDark ? '#C7D2FE' : '#818CF8' }]}>Z</Text>
          </AnimatedView>

          <AnimatedView
            style={[
              styles.zzzLetter,
              {
                opacity: z3Op,
                transform: [{ translateY: z3Y }, { translateX: z3X }, { scale: z3Scale }],
              },
            ]}
          >
            <Text style={[styles.zzzText, { fontSize: 20, color: isDark ? '#E0E7FF' : '#4F46E5', fontWeight: '900' }]}>Z</Text>
          </AnimatedView>
        </View>
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={[styles.container, { width: size * 1.3, height: size * 1.25 }]}
      >
        {/* Mood Reactive Glow Aura Disk */}
        <AnimatedView
          style={[
            styles.auraDisk,
            {
              backgroundColor: auraColor,
              transform: [{ scale: auraPulse }],
            },
          ]}
        />

        {/* Master Red Panda Body with Breathing & Spring Bounce */}
        <AnimatedView
          style={{
            transform: [
              { translateY: floatAnim },
              { scale: bounceScale },
            ],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={size * 1.25} height={size * 1.2} viewBox="0 0 160 150">
            <Defs>
              {/* Warm Red Panda Fur Gradient */}
              <RadialGradient id="rpFurMain" cx="50%" cy="38%" r="62%">
                <Stop offset="0%" stopColor="#FB923C" />
                <Stop offset="65%" stopColor="#EA580C" />
                <Stop offset="100%" stopColor="#C2410C" />
              </RadialGradient>

              {/* Bushy Striped Tail Gradient */}
              <LinearGradient id="rpTailGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FB923C" />
                <Stop offset="50%" stopColor="#EA580C" />
                <Stop offset="100%" stopColor="#9A3412" />
              </LinearGradient>

              {/* Crisp White Markings */}
              <LinearGradient id="rpWhite" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#F8FAFC" />
              </LinearGradient>

              {/* Dark Espresso Fur for Paws/Limbs */}
              <LinearGradient id="rpDarkBrown" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#451A03" />
                <Stop offset="100%" stopColor="#290E02" />
              </LinearGradient>

              {/* Royal Crown Gradient */}
              <LinearGradient id="rpCrown" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="60%" stopColor="#F59E0B" />
                <Stop offset="100%" stopColor="#D97706" />
              </LinearGradient>

              {/* Fire Headband Gradient */}
              <LinearGradient id="rpFire" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFA07A" />
                <Stop offset="50%" stopColor="#FF4500" />
                <Stop offset="100%" stopColor="#DC2626" />
              </LinearGradient>
            </Defs>

            {/* --- 1. BUSHY STRIPED RED PANDA TAIL --- */}
            <G id="red-panda-tail">
              <Path
                d="M102 96 C 128 108, 148 94, 144 68 C 140 48, 120 52, 108 72 Z"
                fill="url(#rpTailGrad)"
              />
              <Path
                d="M144 68 C 142 52, 128 50, 122 58 C 132 64, 140 72, 144 68 Z"
                fill="#FEF3C7"
              />
              <Path
                d="M138 78 C 130 75, 124 78, 118 85 C 123 89, 132 87, 138 78 Z"
                fill="#451A03"
                opacity={0.85}
              />
              <Path
                d="M128 89 C 120 87, 114 90, 111 96 C 115 99, 121 97, 128 89 Z"
                fill="#451A03"
                opacity={0.85}
              />
            </G>

            {/* --- 2. RED PANDA FLUFFY BODY --- */}
            <Ellipse cx="80" cy="100" rx="36" ry="29" fill="url(#rpFurMain)" />
            {/* Dark Espresso Belly/Chest */}
            <Ellipse cx="80" cy="106" rx="23" ry="17" fill="url(#rpDarkBrown)" />
            <Path d="M72 95 Q 80 102 88 95 Q 80 99 72 95 Z" fill="#FFFFFF" opacity={0.9} />

            {/* --- 3. BOTTOM HIND PAWS / FEET (Paws 3 & 4 of 4 Paws) --- */}
            {/* Left Hind Paw / Foot */}
            <G id="rp-hind-paw-left">
              <Ellipse cx="50" cy="126" rx="12" ry="9" fill="url(#rpDarkBrown)" />
              {/* Main Golden Sole Pad */}
              <Ellipse cx="50" cy="126" rx="5" ry="3.8" fill="#FEF08A" opacity={0.9} />
              {/* Toe Beans */}
              <Circle cx="43" cy="122" r="1.8" fill="#FEF08A" opacity={0.9} />
              <Circle cx="48" cy="119" r="1.8" fill="#FEF08A" opacity={0.9} />
              <Circle cx="54" cy="120" r="1.8" fill="#FEF08A" opacity={0.9} />
            </G>

            {/* Right Hind Paw / Foot */}
            <G id="rp-hind-paw-right">
              <Ellipse cx="110" cy="126" rx="12" ry="9" fill="url(#rpDarkBrown)" />
              {/* Main Golden Sole Pad */}
              <Ellipse cx="110" cy="126" rx="5" ry="3.8" fill="#FEF08A" opacity={0.9} />
              {/* Toe Beans */}
              <Circle cx="106" cy="120" r="1.8" fill="#FEF08A" opacity={0.9} />
              <Circle cx="112" cy="119" r="1.8" fill="#FEF08A" opacity={0.9} />
              <Circle cx="117" cy="122" r="1.8" fill="#FEF08A" opacity={0.9} />
            </G>

            {/* --- 4. FLUFFY CUTE RED PANDA EARS (Rounded, Natural Panda Shape) --- */}
            {/* Left Ear */}
            <G id="rp-ear-left">
              <Path
                d="M 52 48 C 36 28, 26 38, 42 58 Z"
                fill="url(#rpFurMain)"
              />
              <Path
                d="M 50 49 C 38 34, 30 42, 42 54 Z"
                fill="#FFFFFF"
              />
              <Path
                d="M 46 48 C 38 38, 32 44, 40 52 Z"
                fill="#FEF3C7"
                opacity={0.7}
              />
            </G>

            {/* Right Ear */}
            <G id="rp-ear-right">
              <Path
                d="M 108 48 C 124 28, 134 38, 118 58 Z"
                fill="url(#rpFurMain)"
              />
              <Path
                d="M 110 49 C 122 34, 130 42, 118 54 Z"
                fill="#FFFFFF"
              />
              <Path
                d="M 114 48 C 122 38, 128 44, 120 52 Z"
                fill="#FEF3C7"
                opacity={0.7}
              />
            </G>

            {/* --- 5. RED PANDA ROUND FLUFFY HEAD --- */}
            <Ellipse cx="80" cy="65" rx="37" ry="31" fill="url(#rpFurMain)" />

            {/* --- 6. RED PANDA WHITE FACIAL MARKINGS --- */}
            <Ellipse cx="80" cy="74" rx="16" ry="12" fill="url(#rpWhite)" />
            {/* Brow spots */}
            <Ellipse cx="64" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(-15 64 52)" />
            <Ellipse cx="96" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(15 96 52)" />
            {/* Cheek white patches */}
            <Path d="M48 68 Q 58 74 54 82 Q 46 76 48 68 Z" fill="#FFFFFF" />
            <Path d="M112 68 Q 102 74 106 82 Q 114 76 112 68 Z" fill="#FFFFFF" />
            {/* Cute black nose & sparkle */}
            <Path d="M76 69 L84 69 L80 74 Z" fill="#1C1917" />
            <Circle cx="78.5" cy="70" r="0.9" fill="#FFFFFF" />

            {/* --- 7. MOOD SPECIFIC ACCESSORIES --- */}
            {/* 👑 CELEBRATING: Golden Royal Crown */}
            {mood === 'celebrating' && (
              <G id="rp-crown">
                <Path d="M66 32 L70 16 L76 24 L80 12 L84 24 L90 16 L94 32 Z" fill="url(#rpCrown)" stroke="#B45309" strokeWidth={1} />
                <Circle cx="80" cy="20" r="2.5" fill="#EF4444" />
                <Circle cx="72" cy="24" r="1.8" fill="#3B82F6" />
                <Circle cx="88" cy="24" r="1.8" fill="#10B981" />
              </G>
            )}

            {/* 🔥 HYPED: Blazing Flame Headband */}
            {mood === 'hyped' && (
              <G id="rp-fire-band">
                <Path d="M80 14 C 84 20 90 22 86 30 C 84 28 82 30 80 28 C 78 30 76 28 74 30 C 70 22 76 20 80 14 Z" fill="url(#rpFire)" />
                <Circle cx="80" cy="24" r="2.2" fill="#FEF08A" />
              </G>
            )}

            {/* --- 8. FACIAL EXPRESSIONS & EYES --- */}

            {/* 😴 SLEEPING: Peaceful Closed Eyes ( ˘ω˘ ) */}
            {mood === 'sleeping' && (
              <G id="rp-face-sleeping">
                <Path d="M63 65 Q 69 70 75 65" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Line x1="69" y1="68" x2="69" y2="72" stroke="#1C1917" strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M85 65 Q 91 70 97 65" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Line x1="91" y1="68" x2="91" y2="72" stroke="#1C1917" strokeWidth={1.8} strokeLinecap="round" />

                <Path d="M77 76 Q 80 79 83 76" stroke="#1C1917" strokeWidth={2} strokeLinecap="round" fill="none" />

                <Ellipse cx="57" cy="71" rx="4" ry="2.2" fill="#F43F5E" opacity={0.4} />
                <Ellipse cx="103" cy="71" rx="4" ry="2.2" fill="#F43F5E" opacity={0.4} />
              </G>
            )}

            {/* 👋 AWAKE / GREETING / HOPEFUL: Wide Bright Glossy Eyes */}
            {(mood === 'awake' || mood === 'hopeful') && (
              <G id="rp-face-awake">
                <Circle cx="68" cy="62" r="5" fill="#1C1917" />
                <Circle cx="69.8" cy="60" r="1.8" fill="#FFFFFF" />
                <Circle cx="66.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                <Circle cx="92" cy="62" r="5" fill="#1C1917" />
                <Circle cx="93.8" cy="60" r="1.8" fill="#FFFFFF" />
                <Circle cx="90.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                <Ellipse cx="56" cy="70" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />
                <Ellipse cx="104" cy="70" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />

                <Path d="M76 76 Q 80 82 84 76" stroke="#1C1917" strokeWidth={2.4} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* 🔥 HYPED: Starry Anime Eyes */}
            {mood === 'hyped' && (
              <G id="rp-face-hyped">
                <Path d="M68 57 L69.5 61 L73 62 L69.5 63 L68 67 L66.5 63 L63 62 L66.5 61 Z" fill="#78350F" />
                <Circle cx="69" cy="60" r="1.2" fill="#FFFFFF" />
                <Path d="M92 57 L93.5 61 L97 62 L93.5 63 L92 67 L90.5 63 L87 62 L90.5 61 Z" fill="#78350F" />
                <Circle cx="93" cy="60" r="1.2" fill="#FFFFFF" />

                <Ellipse cx="55" cy="69" rx="5" ry="3" fill="#EF4444" opacity={0.75} />
                <Ellipse cx="105" cy="69" rx="5" ry="3" fill="#EF4444" opacity={0.75} />

                <Path d="M75 75 Q 80 84 85 75 Q 80 78 75 75 Z" fill="#991B1B" />
                <Path d="M77 78 Q 80 82 83 78 Z" fill="#F87171" />
              </G>
            )}

            {/* 👑 CELEBRATING: Laughing Joyful Arcs */}
            {mood === 'celebrating' && (
              <G id="rp-face-celebrating">
                <Path d="M62 62 Q 68 56 74 62" stroke="#451A03" strokeWidth={3.2} strokeLinecap="round" fill="none" />
                <Path d="M86 62 Q 92 56 98 62" stroke="#451A03" strokeWidth={3.2} strokeLinecap="round" fill="none" />

                <Ellipse cx="55" cy="69" rx="5" ry="3" fill="#EC4899" opacity={0.8} />
                <Ellipse cx="105" cy="69" rx="5" ry="3" fill="#EC4899" opacity={0.8} />

                <Path d="M74 74 Q 80 86 86 74 Z" fill="#451A03" />
                <Path d="M77 79 Q 80 84 83 79 Z" fill="#F472B6" />
                <Path d="M76 75 L84 75" stroke="#FFFFFF" strokeWidth={1.5} />
              </G>
            )}

            {/* 🧘 REST: Peaceful Closed Eyes */}
            {mood === 'rest' && (
              <G id="rp-face-rest">
                <Path d="M63 63 Q 68 67 73 63" stroke="#451A03" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <Path d="M87 63 Q 92 67 97 63" stroke="#451A03" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <Ellipse cx="56" cy="70" rx="3.8" ry="2.2" fill="#FB923C" opacity={0.5} />
                <Ellipse cx="104" cy="70" rx="3.8" ry="2.2" fill="#FB923C" opacity={0.5} />
                <Path d="M77 76 Q 80 80 83 76" stroke="#451A03" strokeWidth={2} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* 🎋 HOPEFUL: Bamboo Stalk in hand */}
            {mood === 'hopeful' && (
              <G id="rp-bamboo-snack">
                <Path d="M104 124 L110 90" stroke="#16A34A" strokeWidth={4.5} strokeLinecap="round" />
                <Line x1="104.5" y1="112" x2="109.5" y2="110" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                <Line x1="106.5" y1="101" x2="111.5" y2="99" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M110 90 Q 122 84 128 89 Q 119 95 110 90 Z" fill="#22C55E" />
                <Path d="M108 97 Q 122 92 125 101 Q 116 103 108 97 Z" fill="#4ADE80" />
                <Path d="M109 86 Q 108 74 100 72 Q 103 81 109 86 Z" fill="#15803D" />
              </G>
            )}

            {/* --- 9. FRONT PAWS / ARMS (Paws 1 & 2 of 4 Paws) --- */}
            {/* Front Left Arm & Paw (Paw 1) */}
            <G id="rp-front-left-paw">
              <Path
                d="M 64 96 C 56 98, 54 106, 60 110 C 66 112, 72 108, 68 100 Z"
                fill="url(#rpDarkBrown)"
              />
              <Ellipse cx="62" cy="106" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.85} />
              <Circle cx="57" cy="103" r="1.3" fill="#FEF08A" opacity={0.85} />
              <Circle cx="61" cy="100" r="1.3" fill="#FEF08A" opacity={0.85} />
              <Circle cx="66" cy="102" r="1.3" fill="#FEF08A" opacity={0.85} />
            </G>

            {/* Front Right Arm (Paw 2) - Sleeping / Rest Mood */}
            {(mood === 'sleeping' || mood === 'rest') && (
              <G id="rp-front-right-paw-resting">
                <Path
                  d="M 96 96 C 104 98, 106 106, 100 110 C 94 112, 88 108, 92 100 Z"
                  fill="url(#rpDarkBrown)"
                />
                <Ellipse cx="98" cy="106" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.85} />
                <Circle cx="94" cy="102" r="1.3" fill="#FEF08A" opacity={0.85} />
                <Circle cx="99" cy="100" r="1.3" fill="#FEF08A" opacity={0.85} />
                <Circle cx="103" cy="103" r="1.3" fill="#FEF08A" opacity={0.85} />
              </G>
            )}

            {/* Front Right Arm - Hopeful Mood (Holding Bamboo) */}
            {mood === 'hopeful' && (
              <G id="rp-front-right-paw-hopeful">
                <Path
                  d="M 96 94 C 102 92, 108 96, 104 104 C 100 108, 92 104, 94 96 Z"
                  fill="url(#rpDarkBrown)"
                />
                <Ellipse cx="101" cy="100" rx="4" ry="3" fill="#FEF08A" opacity={0.85} />
              </G>
            )}

            {/* 👋 FRONT RIGHT WAVING ARM (Paw 2) - Natural Shoulder Curve & Paw Pads (Awake / Hyped / Celebrating) */}
            {isWavingMood && (
              <AnimatedG
                origin="98, 96"
                rotation={pawWaveAngle}
              >
                {/* Natural, plump, curved arm from the right shoulder up to hand */}
                <Path
                  d="M 96 98 C 104 90, 112 80, 116 66 C 118 62, 122 56, 126 52"
                  stroke="url(#rpDarkBrown)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Rounded Palm */}
                <Ellipse cx="126" cy="50" rx="9.5" ry="8.5" fill="url(#rpDarkBrown)" />
                {/* 🐾 Paw Pads: Central pad + 4 toe beans */}
                <Ellipse cx="125" cy="51" rx="4.5" ry="3.8" fill="#FEF08A" opacity={0.95} />
                <Circle cx="118" cy="45" r="1.7" fill="#FEF08A" opacity={0.95} />
                <Circle cx="123" cy="41" r="1.7" fill="#FEF08A" opacity={0.95} />
                <Circle cx="129" cy="42" r="1.7" fill="#FEF08A" opacity={0.95} />
                <Circle cx="133" cy="46" r="1.7" fill="#FEF08A" opacity={0.95} />
              </AnimatedG>
            )}
          </Svg>
        </AnimatedView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer' as any,
  },
  auraDisk: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 9999,
    filter: 'blur(16px)' as any,
  },
  zzzContainer: {
    position: 'absolute',
    top: 4,
    right: 18,
    width: 60,
    height: 70,
    zIndex: 20,
  },
  zzzLetter: {
    position: 'absolute',
    right: 12,
    top: 36,
  },
  zzzText: {
    fontFamily: 'System',
    fontWeight: '800',
  },
  speechBubble: {
    position: 'absolute',
    top: -52,
    zIndex: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    maxWidth: 240,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  speechText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  speechArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
