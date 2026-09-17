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
    // 1. Floating / Breathing loop
    const isSleep = mood === 'sleeping';
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
          toValue: isSleep ? 1.5 : mood === 'celebrating' || mood === 'hyped' ? 7 : 4,
          duration: isSleep ? 2000 : mood === 'celebrating' ? 380 : 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(tailWag, {
          toValue: isSleep ? -1.5 : mood === 'celebrating' || mood === 'hyped' ? -7 : -4,
          duration: isSleep ? 2000 : mood === 'celebrating' ? 380 : 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    tailLoop.start();

    // 3. Hand Wave Greeting Loop (active when awake / celebrating / greeting)
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(handWave, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(handWave, {
          toValue: -1,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
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
    // If sleeping, wake up!
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
      Animated.timing(earWiggle, { toValue: 6, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: -6, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 4, duration: 75, useNativeDriver: useNative }),
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
      return t('mascot.mood_awake_hi', "Hi there! 👋 I'm Sparky! Let's crush our first habit today! 🐾");
    }

    if (quoteIndex === 1) return t('mascot.tap_1', 'Consistency is your superpower! ⚡');
    if (quoteIndex === 2) return t('mascot.tap_2', "One habit at a time, you're building a great future! 🚀");
    if (quoteIndex === 3) return t('mascot.tap_3', 'High five! I believe in you! ✋');
    if (quoteIndex === 4) return t('mascot.tap_4', 'Keep showing up! You got this! 🌟');

    switch (mood) {
      case 'awake':
        return t('mascot.mood_awake_hi', "Hi there! 👋 I'm Sparky! Let's crush our first habit today! 🐾");
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

  // Waving rotation
  const pawWaveRotation = handWave.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-24deg', '32deg'],
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
              {/* Warm Red Panda Rust/Chestnut Fur Gradient */}
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

              {/* Crisp White Muzzle & Markings */}
              <LinearGradient id="rpWhite" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#F8FAFC" />
              </LinearGradient>

              {/* Dark Espresso Paws/Ears */}
              <LinearGradient id="rpDarkBrown" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#451A03" />
                <Stop offset="100%" stopColor="#290E02" />
              </LinearGradient>

              {/* Crown Gradient */}
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
                d="M102 96 C 125 105, 145 92, 142 68 C 140 50, 122 52, 110 70 Z"
                fill="url(#rpTailGrad)"
              />
              <Path
                d="M142 68 C 141 54, 130 51, 124 58 C 132 64, 138 72, 142 68 Z"
                fill="#FEF3C7"
              />
              <Path
                d="M136 78 C 130 75, 124 78, 120 84 C 124 88, 131 86, 136 78 Z"
                fill="#451A03"
                opacity={0.85}
              />
              <Path
                d="M126 89 C 120 87, 114 90, 111 96 C 115 99, 121 97, 126 89 Z"
                fill="#451A03"
                opacity={0.85}
              />
            </G>

            {/* --- 2. RED PANDA FLUFFY BODY --- */}
            <Ellipse cx="80" cy="98" rx="36" ry="28" fill="url(#rpFurMain)" />
            <Ellipse cx="80" cy="104" rx="22" ry="16" fill="url(#rpDarkBrown)" />
            <Path d="M72 94 Q 80 102 88 94 Q 80 98 72 94 Z" fill="#FFFFFF" opacity={0.9} />

            {/* --- 3. RED PANDA EARS --- */}
            {/* Left Ear */}
            <Path
              d={mood === 'sleeping' ? "M48 48 L28 42 Q 22 52 38 60 Z" : "M46 52 L30 22 Q 24 32 44 58 Z"}
              fill="url(#rpFurMain)"
            />
            <Path
              d={mood === 'sleeping' ? "M44 50 L32 44 Q 28 50 38 56 Z" : "M42 50 L32 28 Q 28 36 40 54 Z"}
              fill="#FFFFFF"
            />
            <Path
              d={mood === 'sleeping' ? "M38 52 L30 46 L36 56 Z" : "M38 48 L30 32 L38 52 Z"}
              fill="#FDE68A"
              opacity={0.6}
            />

            {/* Right Ear */}
            <Path
              d={mood === 'sleeping' ? "M112 48 L132 42 Q 138 52 122 60 Z" : "M114 52 L130 22 Q 136 32 116 58 Z"}
              fill="url(#rpFurMain)"
            />
            <Path
              d={mood === 'sleeping' ? "M116 50 L128 44 Q 132 50 122 56 Z" : "M118 50 L128 28 Q 132 36 120 54 Z"}
              fill="#FFFFFF"
            />
            <Path
              d={mood === 'sleeping' ? "M122 52 L130 46 L124 56 Z" : "M122 48 L130 32 L122 52 Z"}
              fill="#FDE68A"
              opacity={0.6}
            />

            {/* --- 4. RED PANDA ROUND FLUFFY HEAD --- */}
            <Ellipse cx="80" cy="64" rx="37" ry="31" fill="url(#rpFurMain)" />

            {/* --- 5. RED PANDA WHITE FACIAL MARKINGS --- */}
            <Ellipse cx="80" cy="74" rx="16" ry="12" fill="url(#rpWhite)" />
            <Ellipse cx="64" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(-15 64 52)" />
            <Ellipse cx="96" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(15 96 52)" />
            <Path d="M48 68 Q 58 74 54 82 Q 46 76 48 68 Z" fill="#FFFFFF" />
            <Path d="M112 68 Q 102 74 106 82 Q 114 76 112 68 Z" fill="#FFFFFF" />
            <Path d="M76 69 L84 69 L80 74 Z" fill="#1C1917" />
            <Circle cx="78.5" cy="70" r="0.9" fill="#FFFFFF" />

            {/* --- 6. MOOD SPECIFIC ACCESSORIES --- */}
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

            {/* --- 7. FACIAL EXPRESSIONS & EYES --- */}

            {/* 😴 SLEEPING: Peaceful Closed Eyes ( ˘ω˘ ) */}
            {mood === 'sleeping' && (
              <G id="rp-face-sleeping">
                {/* Left Closed Eyelid */}
                <Path d="M63 65 Q 69 70 75 65" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Line x1="69" y1="68" x2="69" y2="72" stroke="#1C1917" strokeWidth={1.8} strokeLinecap="round" />
                {/* Right Closed Eyelid */}
                <Path d="M85 65 Q 91 70 97 65" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Line x1="91" y1="68" x2="91" y2="72" stroke="#1C1917" strokeWidth={1.8} strokeLinecap="round" />

                {/* Gentle Sleeping Smile */}
                <Path d="M77 76 Q 80 79 83 76" stroke="#1C1917" strokeWidth={2} strokeLinecap="round" fill="none" />

                {/* Soft Sleeping Cheeks */}
                <Ellipse cx="57" cy="71" rx="4" ry="2.2" fill="#F43F5E" opacity={0.4} />
                <Ellipse cx="103" cy="71" rx="4" ry="2.2" fill="#F43F5E" opacity={0.4} />
              </G>
            )}

            {/* 👋 AWAKE / GREETING / HOPEFUL: Wide Bright Glossy Eyes */}
            {(mood === 'awake' || mood === 'hopeful') && (
              <G id="rp-face-awake">
                {/* Big Glossy Eyes */}
                <Circle cx="68" cy="62" r="5" fill="#1C1917" />
                <Circle cx="69.8" cy="60" r="1.8" fill="#FFFFFF" />
                <Circle cx="66.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                <Circle cx="92" cy="62" r="5" fill="#1C1917" />
                <Circle cx="93.8" cy="60" r="1.8" fill="#FFFFFF" />
                <Circle cx="90.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                {/* Rosy Cheeks */}
                <Ellipse cx="56" cy="70" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />
                <Ellipse cx="104" cy="70" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />

                {/* Cheerful Smile */}
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

            {/* 🎋 HOPEFUL: Bamboo Stalk */}
            {mood === 'hopeful' && (
              <G id="rp-bamboo-snack">
                <Path d="M102 128 L108 96" stroke="#16A34A" strokeWidth={4.5} strokeLinecap="round" />
                <Line x1="102.5" y1="116" x2="107.5" y2="114" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                <Line x1="104.5" y1="105" x2="109.5" y2="103" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M108 96 Q 120 90 126 95 Q 117 101 108 96 Z" fill="#22C55E" />
                <Path d="M106 103 Q 120 98 123 107 Q 114 109 106 103 Z" fill="#4ADE80" />
                <Path d="M107 92 Q 106 80 98 78 Q 101 87 107 92 Z" fill="#15803D" />
              </G>
            )}

            {/* --- 8. DARK CHOCOLATE FRONT PAWS --- */}
            {/* Left Paw (Resting) */}
            <Ellipse cx="62" cy="116" rx="9" ry="7" fill="url(#rpDarkBrown)" />

            {/* Right Paw: Waving when awake/greeting, or resting when sleeping */}
            {!isWavingMood ? (
              <Ellipse
                cx={mood === 'hopeful' ? 104 : mood === 'sleeping' ? 94 : 98}
                cy={mood === 'hopeful' ? 112 : mood === 'sleeping' ? 116 : 116}
                rx="9"
                ry="7"
                fill="url(#rpDarkBrown)"
              />
            ) : null}
          </Svg>

          {/* 👋 Waving Right Hand / Paw when Awake & Greeting */}
          {isWavingMood && (
            <AnimatedView
              style={[
                styles.wavingPawContainer,
                {
                  right: size * 0.12,
                  top: size * 0.42,
                  transform: [{ rotate: pawWaveRotation }],
                },
              ]}
              pointerEvents="none"
            >
              <Svg width={size * 0.32} height={size * 0.32} viewBox="0 0 32 32">
                <Ellipse cx="16" cy="16" rx="10" ry="7.5" fill="#451A03" />
                {/* White paw pad glint */}
                <Circle cx="14" cy="14" r="2.2" fill="#FEF08A" opacity={0.8} />
              </Svg>
            </AnimatedView>
          )}
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
    overflow: 'visible',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  auraDisk: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    top: 15,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
    shadowOpacity: 0.55,
    elevation: 7,
    zIndex: 0,
  },
  speechBubble: {
    position: 'absolute',
    top: -48,
    right: -10,
    zIndex: 99,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    maxWidth: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 8,
  },
  speechText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
  },
  speechArrow: {
    position: 'absolute',
    bottom: -6,
    right: 42,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  zzzContainer: {
    position: 'absolute',
    top: 0,
    right: '25%',
    width: 40,
    height: 60,
    zIndex: 50,
  },
  zzzLetter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  zzzText: {
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  wavingPawContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
