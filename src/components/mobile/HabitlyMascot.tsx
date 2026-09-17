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

export type MascotMood = 'sad' | 'hopeful' | 'hyped' | 'celebrating' | 'rest';

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
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // 1. Calculate active daily mood based on completion progress
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

  let mood: MascotMood = 'sad';
  if (forcedMood) {
    mood = forcedMood;
  } else if (totalCount === 0) {
    mood = 'rest';
  } else if (completedCount === 0) {
    mood = 'sad';
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
  const tearAnim = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(0.4)).current;
  const auraPulse = useRef(new Animated.Value(0.8)).current;

  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    // 1. Floating breathing animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: mood === 'sad' ? 2 : -5,
          duration: mood === 'hyped' || mood === 'celebrating' ? 1200 : 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: mood === 'sad' ? 6 : 4,
          duration: mood === 'hyped' || mood === 'celebrating' ? 1200 : 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 2. Tail wagging animation
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: mood === 'celebrating' || mood === 'hyped' ? 6 : 3,
          duration: mood === 'celebrating' ? 400 : 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(tailWag, {
          toValue: mood === 'celebrating' || mood === 'hyped' ? -6 : -3,
          duration: mood === 'celebrating' ? 400 : 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    tailLoop.start();

    // 3. Tear drop loop for sad mood
    const tearLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tearAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(tearAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: useNative,
        }),
      ])
    );
    tearLoop.start();

    // 4. Star pulse
    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
        Animated.timing(starPulse, {
          toValue: 0.3,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
      ])
    );
    starLoop.start();

    // 5. Aura pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.12,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(auraPulse, {
          toValue: 0.88,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    auraLoop.start();

    return () => {
      floatLoop.stop();
      tailLoop.stop();
      tearLoop.stop();
      starLoop.stop();
      auraLoop.stop();
    };
  }, [mood]);

  // Tap handler with squash, stretch & ear wiggle
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceScale, {
        toValue: 0.86,
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

    // Ear wiggle
    Animated.sequence([
      Animated.timing(earWiggle, { toValue: 5, duration: 80, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: -5, duration: 80, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 3, duration: 80, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 0, duration: 80, useNativeDriver: useNative }),
    ]).start();

    setShowSpeechBubble(true);
    setQuoteIndex((prev) => (prev + 1) % 4);

    if (onClick) {
      onClick();
    }
  };

  const getMoodMessage = () => {
    if (quoteIndex === 1) return t('mascot.tap_1', 'Consistency is your superpower! ⚡');
    if (quoteIndex === 2) return t('mascot.tap_2', "One habit at a time, you're building a great future! 🚀");
    if (quoteIndex === 3) return t('mascot.tap_3', 'High five! I believe in you! ✋');

    switch (mood) {
      case 'sad':
        return t('mascot.mood_sad', "No habits done yet... Let's wake up and crush habit #1! 😴");
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
      case 'sad':
        return 'rgba(56, 189, 248, 0.16)';
      case 'hopeful':
        return 'rgba(251, 146, 60, 0.28)';
      case 'hyped':
        return 'rgba(245, 158, 11, 0.38)';
      case 'celebrating':
        return 'rgba(168, 85, 247, 0.42)';
      case 'rest':
      default:
        return 'rgba(56, 189, 248, 0.24)';
    }
  };

  const auraColor = getAuraColor();

  return (
    <View style={styles.outerWrapper}>
      {/* Speech Bubble on Tap */}
      {showSpeechBubble && (
        <TouchableOpacity
          style={[
            styles.speechBubble,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: mood === 'celebrating' ? '#A855F7' : mood === 'sad' ? '#64748B' : '#FB923C',
            },
          ]}
          onPress={() => setQuoteIndex((prev) => (prev + 1) % 4)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.speechText,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}
          >
            {getMoodMessage()}
          </Text>
          <View
            style={[
              styles.speechArrow,
              {
                borderTopColor: isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.88}
        style={[styles.container, { width: size + 20, height: size }]}
      >
        {/* Radiant Ambient Aura */}
        <AnimatedView
          style={[
            styles.auraDisk,
            {
              backgroundColor: auraColor,
              transform: [{ scale: auraPulse }],
            },
          ]}
        />

        {/* Twinkling Stars in Dark mode or Hyped/Celebrating */}
        {(isDark || mood === 'celebrating' || mood === 'hyped') && (
          <>
            <AnimatedView style={[styles.star, { top: 4, left: 8, opacity: starPulse }]}>
              <Text style={{ color: mood === 'celebrating' ? '#FDE047' : '#FB923C', fontSize: 13, fontWeight: '900' }}>✦</Text>
            </AnimatedView>
            <AnimatedView style={[styles.star, { top: 10, right: 10, opacity: starPulse }]}>
              <Text style={{ color: mood === 'celebrating' ? '#F472B6' : '#FDE047', fontSize: 12, fontWeight: '900' }}>★</Text>
            </AnimatedView>
          </>
        )}

        {/* Floating & Bouncing Red Panda Mascot */}
        <AnimatedView
          style={{
            transform: [{ translateY: floatAnim }, { scale: bounceScale }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={size + 10} height={size} viewBox="0 0 160 140">
            <Defs>
              {/* Red Panda Body Gradient */}
              <LinearGradient id="rpFurMain" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FB923C" />
                <Stop offset="45%" stopColor="#EA580C" />
                <Stop offset="100%" stopColor="#C2410C" />
              </LinearGradient>

              {/* Red Panda Tail Gradient */}
              <LinearGradient id="rpTailGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#F97316" />
                <Stop offset="50%" stopColor="#EA580C" />
                <Stop offset="100%" stopColor="#9A3412" />
              </LinearGradient>

              {/* Red Panda Muzzle / White Patches */}
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
              {/* Tail Base Shape */}
              <Path
                d="M102 96 C 125 105, 145 92, 142 68 C 140 50, 122 52, 110 70 Z"
                fill="url(#rpTailGrad)"
              />
              {/* Tail Tip (Creamy White) */}
              <Path
                d="M142 68 C 141 54, 130 51, 124 58 C 132 64, 138 72, 142 68 Z"
                fill="#FEF3C7"
              />
              {/* Tail Dark Rings (Red Panda Signature Rings) */}
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
            {/* Dark Belly / Chest Fluff */}
            <Ellipse cx="80" cy="104" rx="22" ry="16" fill="url(#rpDarkBrown)" />
            {/* Chest White Accent */}
            <Path d="M72 94 Q 80 102 88 94 Q 80 98 72 94 Z" fill="#FFFFFF" opacity={0.9} />

            {/* --- 3. RED PANDA EARS (Large, Fluffy, Triangular with White Tufts) --- */}
            {/* Left Ear */}
            <Path
              d={mood === 'sad' ? "M48 48 L28 42 Q 22 52 38 60 Z" : "M46 52 L30 22 Q 24 32 44 58 Z"}
              fill="url(#rpFurMain)"
            />
            {/* Left Inner White Tuft */}
            <Path
              d={mood === 'sad' ? "M44 50 L32 44 Q 28 50 38 56 Z" : "M42 50 L32 28 Q 28 36 40 54 Z"}
              fill="#FFFFFF"
            />
            <Path
              d={mood === 'sad' ? "M38 52 L30 46 L36 56 Z" : "M38 48 L30 32 L38 52 Z"}
              fill="#FDE68A"
              opacity={0.6}
            />

            {/* Right Ear */}
            <Path
              d={mood === 'sad' ? "M112 48 L132 42 Q 138 52 122 60 Z" : "M114 52 L130 22 Q 136 32 116 58 Z"}
              fill="url(#rpFurMain)"
            />
            {/* Right Inner White Tuft */}
            <Path
              d={mood === 'sad' ? "M116 50 L128 44 Q 132 50 122 56 Z" : "M118 50 L128 28 Q 132 36 120 54 Z"}
              fill="#FFFFFF"
            />
            <Path
              d={mood === 'sad' ? "M122 52 L130 46 L124 56 Z" : "M122 48 L130 32 L122 52 Z"}
              fill="#FDE68A"
              opacity={0.6}
            />

            {/* --- 4. RED PANDA ROUND FLUFFY HEAD --- */}
            <Ellipse cx="80" cy="64" rx="37" ry="31" fill="url(#rpFurMain)" />

            {/* --- 5. RED PANDA WHITE FACIAL MARKINGS --- */}
            {/* White Muzzle */}
            <Ellipse cx="80" cy="74" rx="16" ry="12" fill="url(#rpWhite)" />

            {/* White Eyebrow Patches (Cute Red Panda Spots) */}
            <Ellipse cx="64" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(-15 64 52)" />
            <Ellipse cx="96" cy="52" rx="5.5" ry="4" fill="#FFFFFF" transform="rotate(15 96 52)" />

            {/* White Cheek Stripe Markings */}
            <Path d="M48 68 Q 58 74 54 82 Q 46 76 48 68 Z" fill="#FFFFFF" />
            <Path d="M112 68 Q 102 74 106 82 Q 114 76 112 68 Z" fill="#FFFFFF" />

            {/* Cute Black Triangle Nose */}
            <Path d="M76 69 L84 69 L80 74 Z" fill="#1C1917" />
            <Circle cx="78.5" cy="70" r="0.9" fill="#FFFFFF" />

            {/* --- 6. MOOD SPECIFIC HEAD ACCESSORIES --- */}

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

            {/* 😴 SAD: Tear Drop & Floating Zzz */}
            {mood === 'sad' && (
              <G id="rp-sad-tear">
                <Circle cx="94" cy="74" r="2.8" fill="#38BDF8" opacity={0.9} />
                <Path d="M94 69 Q 92 72 94 74 Q 96 72 94 69 Z" fill="#38BDF8" opacity={0.9} />
              </G>
            )}

            {/* --- 7. FACIAL EXPRESSIONS & EYES (MOOD REACTIVE) --- */}

            {/* 😴 SAD: Droopy Sleepy Eyes & Downturned Mouth */}
            {mood === 'sad' && (
              <G id="rp-face-sad">
                {/* Droopy Left Eyelid */}
                <Path d="M63 64 Q 69 68 75 64" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M63 64 Q 69 66 75 64" stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" fill="none" />
                {/* Droopy Right Eyelid */}
                <Path d="M85 64 Q 91 68 97 64" stroke="#1C1917" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M85 64 Q 91 66 97 64" stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" fill="none" />

                {/* Soft Cheeks */}
                <Ellipse cx="57" cy="71" rx="3.5" ry="2" fill="#F43F5E" opacity={0.3} />
                <Ellipse cx="103" cy="71" rx="3.5" ry="2" fill="#F43F5E" opacity={0.3} />

                {/* Sad Downturned Mouth */}
                <Path d="M76 79 Q 80 75 84 79" stroke="#1C1917" strokeWidth={2.2} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* 🌱 HOPEFUL: Big Glossy Eyes & Sweet Smile */}
            {mood === 'hopeful' && (
              <G id="rp-face-hopeful">
                {/* Big Glossy Eyes */}
                <Circle cx="68" cy="62" r="4.8" fill="#1C1917" />
                <Circle cx="69.8" cy="60.2" r="1.8" fill="#FFFFFF" />
                <Circle cx="66.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                <Circle cx="92" cy="62" r="4.8" fill="#1C1917" />
                <Circle cx="93.8" cy="60.2" r="1.8" fill="#FFFFFF" />
                <Circle cx="90.5" cy="63.5" r="0.9" fill="#FFFFFF" />

                {/* Rosy Blushing Cheeks */}
                <Ellipse cx="56" cy="70" rx="4.2" ry="2.5" fill="#F43F5E" opacity={0.65} />
                <Ellipse cx="104" cy="70" rx="4.2" ry="2.5" fill="#F43F5E" opacity={0.65} />

                {/* Sweet Smile */}
                <Path d="M76 76 Q 80 81 84 76" stroke="#1C1917" strokeWidth={2.2} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* 🔥 HYPED: Starry Anime Eyes & Open Excited Mouth */}
            {mood === 'hyped' && (
              <G id="rp-face-hyped">
                {/* Left Star Eye */}
                <Path d="M68 57 L69.5 61 L73 62 L69.5 63 L68 67 L66.5 63 L63 62 L66.5 61 Z" fill="#78350F" />
                <Circle cx="69" cy="60" r="1.2" fill="#FFFFFF" />

                {/* Right Star Eye */}
                <Path d="M92 57 L93.5 61 L97 62 L93.5 63 L92 67 L90.5 63 L87 62 L90.5 61 Z" fill="#78350F" />
                <Circle cx="93" cy="60" r="1.2" fill="#FFFFFF" />

                {/* Rosy Radiant Cheeks */}
                <Ellipse cx="55" cy="69" rx="5" ry="3" fill="#EF4444" opacity={0.75} />
                <Ellipse cx="105" cy="69" rx="5" ry="3" fill="#EF4444" opacity={0.75} />

                {/* Open Excited Smile */}
                <Path d="M75 75 Q 80 84 85 75 Q 80 78 75 75 Z" fill="#991B1B" />
                <Path d="M77 78 Q 80 82 83 78 Z" fill="#F87171" />
              </G>
            )}

            {/* 👑 CELEBRATING: Laughing Joyful Arcs & Victory Open Smile */}
            {mood === 'celebrating' && (
              <G id="rp-face-celebrating">
                {/* Joyful laughing eye arcs */}
                <Path d="M62 62 Q 68 56 74 62" stroke="#451A03" strokeWidth={3.2} strokeLinecap="round" fill="none" />
                <Path d="M86 62 Q 92 56 98 62" stroke="#451A03" strokeWidth={3.2} strokeLinecap="round" fill="none" />

                {/* Glowing cheeks */}
                <Ellipse cx="55" cy="69" rx="5" ry="3" fill="#EC4899" opacity={0.8} />
                <Ellipse cx="105" cy="69" rx="5" ry="3" fill="#EC4899" opacity={0.8} />

                {/* Big Victory Laugh with Pink Tongue */}
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

            {/* 🎋 HOPEFUL: Bamboo Stalk held in Paw */}
            {mood === 'hopeful' && (
              <G id="rp-bamboo-snack">
                {/* Bamboo Stalk */}
                <Path d="M102 128 L108 96" stroke="#16A34A" strokeWidth={4.5} strokeLinecap="round" />
                <Line x1="102.5" y1="116" x2="107.5" y2="114" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                <Line x1="104.5" y1="105" x2="109.5" y2="103" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                {/* Bamboo Leaf 1 */}
                <Path d="M108 96 Q 120 90 126 95 Q 117 101 108 96 Z" fill="#22C55E" />
                {/* Bamboo Leaf 2 */}
                <Path d="M106 103 Q 120 98 123 107 Q 114 109 106 103 Z" fill="#4ADE80" />
                {/* Bamboo Leaf 3 */}
                <Path d="M107 92 Q 106 80 98 78 Q 101 87 107 92 Z" fill="#15803D" />
              </G>
            )}

            {/* --- 8. DARK CHOCOLATE FRONT PAWS --- */}
            {/* Left Paw */}
            <Ellipse cx="62" cy="116" rx="9" ry="7" fill="url(#rpDarkBrown)" />
            {/* Right Paw (Holding bamboo or waving) */}
            <Ellipse
              cx={mood === 'hopeful' ? 104 : mood === 'celebrating' || mood === 'hyped' ? 104 : 98}
              cy={mood === 'hopeful' ? 112 : mood === 'celebrating' || mood === 'hyped' ? 108 : 116}
              rx="9"
              ry="7"
              fill="url(#rpDarkBrown)"
            />
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
    overflow: 'visible',
  },
  auraDisk: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    top: 15,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
    shadowOpacity: 0.55,
    elevation: 7,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    zIndex: 3,
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
    textAlign: 'center',
    lineHeight: 15,
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
});
