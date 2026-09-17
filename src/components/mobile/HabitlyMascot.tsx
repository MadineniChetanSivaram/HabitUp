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
  const { habits, completions, selectedDate, theme, t, showToast } = useHabit();
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

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;
  const tearAnim = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(0.4)).current;
  const auraPulse = useRef(new Animated.Value(0.8)).current;

  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    // 1. Floating breathing animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: mood === 'sad' ? 2 : -6,
          duration: mood === 'hyped' || mood === 'celebrating' ? 1200 : 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: mood === 'sad' ? 7 : 4,
          duration: mood === 'hyped' || mood === 'celebrating' ? 1200 : 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 2. Tear / Sleepy Droplet loop for sad mood
    const tearLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tearAnim, {
          toValue: 1,
          duration: 1600,
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

    // 3. Star pulse
    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
        Animated.timing(starPulse, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
      ])
    );
    starLoop.start();

    // 4. Aura pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(auraPulse, {
          toValue: 0.85,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    auraLoop.start();

    return () => {
      floatLoop.stop();
      tearLoop.stop();
      starLoop.stop();
      auraLoop.stop();
    };
  }, [mood]);

  // Tap handler with squash & stretch bounce
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceScale, {
        toValue: 0.85,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: useNative,
      }),
      Animated.spring(bounceScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Toggle speech bubble or cycle quote
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

  // Colors & Themes based on mood
  const getBodyGradient = () => {
    switch (mood) {
      case 'sad':
        return {
          c1: '#64748B',
          c2: '#475569',
          c3: '#334155',
          snow1: '#94A3B8',
          snow2: '#64748B',
          aura: 'rgba(56, 189, 248, 0.15)',
        };
      case 'hopeful':
        return {
          c1: '#34D399',
          c2: '#10B981',
          c3: '#059669',
          snow1: '#FFFFFF',
          snow2: '#E2E8F0',
          aura: 'rgba(52, 211, 153, 0.25)',
        };
      case 'hyped':
        return {
          c1: '#FB923C',
          c2: '#F59E0B',
          c3: '#D97706',
          snow1: '#FEF08A',
          snow2: '#FDE047',
          aura: 'rgba(245, 158, 11, 0.35)',
        };
      case 'celebrating':
        return {
          c1: '#A855F7',
          c2: '#7C3AED',
          c3: '#4C1D95',
          snow1: '#FDE047',
          snow2: '#F59E0B',
          aura: 'rgba(168, 85, 247, 0.4)',
        };
      case 'rest':
      default:
        return {
          c1: '#38BDF8',
          c2: '#0284C7',
          c3: '#0369A1',
          snow1: '#E0F2FE',
          snow2: '#BAE6FD',
          aura: 'rgba(56, 189, 248, 0.25)',
        };
    }
  };

  const colors = getBodyGradient();

  return (
    <View style={styles.outerWrapper}>
      {/* Speech Bubble on Tap or State Change */}
      {showSpeechBubble && (
        <TouchableOpacity
          style={[
            styles.speechBubble,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: mood === 'celebrating' ? '#A855F7' : mood === 'sad' ? '#64748B' : '#10B981',
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
        {/* Radiant Ambient Aura Disk */}
        <AnimatedView
          style={[
            styles.auraDisk,
            {
              backgroundColor: colors.aura,
              transform: [{ scale: auraPulse }],
            },
          ]}
        />

        {/* Twinkling Stars in Dark mode or Hyped/Celebrating */}
        {(isDark || mood === 'celebrating' || mood === 'hyped') && (
          <>
            <AnimatedView style={[styles.star, { top: 6, left: 10, opacity: starPulse }]}>
              <Text style={{ color: mood === 'celebrating' ? '#FDE047' : '#67E8F9', fontSize: 13, fontWeight: '900' }}>✦</Text>
            </AnimatedView>
            <AnimatedView style={[styles.star, { top: 12, right: 14, opacity: starPulse }]}>
              <Text style={{ color: mood === 'celebrating' ? '#F472B6' : '#FDE047', fontSize: 12, fontWeight: '900' }}>★</Text>
            </AnimatedView>
          </>
        )}

        {/* Floating & Bouncing Mascot Vector Body */}
        <AnimatedView
          style={{
            transform: [{ translateY: floatAnim }, { scale: bounceScale }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={size + 10} height={size} viewBox="0 0 160 140">
            <Defs>
              <LinearGradient id="mascotBodyGrad" x1="80" y1="20" x2="80" y2="135">
                <Stop offset="0%" stopColor={colors.c1} />
                <Stop offset="50%" stopColor={colors.c2} />
                <Stop offset="100%" stopColor={colors.c3} />
              </LinearGradient>
              <LinearGradient id="snowGrad" x1="80" y1="18" x2="80" y2="60">
                <Stop offset="0%" stopColor={colors.snow1} />
                <Stop offset="100%" stopColor={colors.snow2} />
              </LinearGradient>
              <LinearGradient id="crownGrad" x1="80" y1="5" x2="80" y2="30">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="60%" stopColor="#F59E0B" />
                <Stop offset="100%" stopColor="#D97706" />
              </LinearGradient>
              <LinearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFA07A" />
                <Stop offset="50%" stopColor="#FF4500" />
                <Stop offset="100%" stopColor="#DC2626" />
              </LinearGradient>
            </Defs>

            {/* Background Hill Silhouette */}
            <Path d="M20 135L55 65 Q 60 60 65 65L100 135H20Z" fill={isDark ? '#1E293B' : '#E2E8F0'} opacity={0.6} />
            <Path d="M75 135L110 50 Q 115 45 120 50L145 135H75Z" fill={isDark ? '#0F172A' : '#CBD5E1'} opacity={0.5} />

            {/* Main Mountain Apex Mascot Body */}
            <Path
              d="M35 135L74 28 Q 80 20 86 28L125 135 Q 126 138 122 138H38 Q 34 138 35 135Z"
              fill="url(#mascotBodyGrad)"
            />

            {/* Snow Cap / Crown Cap */}
            <Path
              d="M74 28 Q 80 20 86 28L100 56 C 94 60 86 60 80 61 C 74 60 66 60 60 56L74 28Z"
              fill="url(#snowGrad)"
            />

            {/* --- MOOD SPECIFIC HEAD ACCESSORIES --- */}

            {/* 1. CELEBRATING: Golden Champion Crown */}
            {mood === 'celebrating' && (
              <G id="champion-crown">
                <Path d="M68 22L70 8L76 16L80 5L84 16L90 8L92 22Z" fill="url(#crownGrad)" stroke="#B45309" strokeWidth={1} />
                <Circle cx="80" cy="14" r="2.5" fill="#EF4444" />
                <Circle cx="72" cy="17" r="1.5" fill="#3B82F6" />
                <Circle cx="88" cy="17" r="1.5" fill="#10B981" />
              </G>
            )}

            {/* 2. HYPED: Blazing Flame Headband */}
            {mood === 'hyped' && (
              <G id="flame-headband">
                <Path d="M80 6 C84 12 90 14 86 22 C84 20 82 22 80 20 C78 22 76 20 74 22 C70 14 76 12 80 6Z" fill="url(#flameGrad)" />
                <Circle cx="80" cy="16" r="2" fill="#FEF08A" />
              </G>
            )}

            {/* 3. SAD: Floating Sleepy Zzz / Droplet */}
            {mood === 'sad' && (
              <G id="sleepy-droplet">
                <Circle cx="98" cy="80" r="3.2" fill="#38BDF8" opacity={0.85} />
                <Path d="M98 74 Q 96 77 98 80 Q 100 77 98 74Z" fill="#38BDF8" opacity={0.85} />
                {/* Floating Zzz */}
                <Text
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 20,
                    fontSize: 11,
                    fontWeight: '900',
                    color: '#94A3B8',
                  }}
                >
                  Zzz...
                </Text>
              </G>
            )}

            {/* 4. HOPEFUL / REST: Sprout Leaf */}
            {(mood === 'hopeful' || mood === 'rest') && (
              <G id="sprout-leaf">
                <Line x1="80" y1="20" x2="80" y2="8" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" />
                <Path d="M80 12 C 86 6 92 10 90 16 C 85 16 80 14 80 12 Z" fill="#34D399" />
                <Circle cx="80" cy="8" r="2" fill="#FDE047" />
              </G>
            )}

            {/* --- MOOD SPECIFIC EYES & FACIAL EXPRESSIONS --- */}

            {/* SAD EXPRESSION: Droopy Sleepy Eyes & Downward Mouth */}
            {mood === 'sad' && (
              <G id="face-sad">
                {/* Left droopy eyelid */}
                <Path d="M68 76 Q 73 80 78 76" stroke="#1E293B" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M68 76 Q 73 78 78 76" stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" fill="none" />
                {/* Right droopy eyelid */}
                <Path d="M84 76 Q 89 80 94 76" stroke="#1E293B" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M84 76 Q 89 78 94 76" stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" fill="none" />

                {/* Subtle soft cheeks */}
                <Ellipse cx="66" cy="84" rx="3.5" ry="2" fill="#64748B" opacity={0.4} />
                <Ellipse cx="96" cy="84" rx="3.5" ry="2" fill="#64748B" opacity={0.4} />

                {/* Sad downturned cute mouth */}
                <Path d="M77 87 Q 81 83 85 87" stroke="#1E293B" strokeWidth={2.5} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* HOPEFUL EXPRESSION: Wide Glossy Eyes & Cute Upturned Smile */}
            {mood === 'hopeful' && (
              <G id="face-hopeful">
                {/* Big cute round eyes */}
                <Circle cx="73" cy="74" r="4.2" fill="#064E3B" />
                <Circle cx="74.5" cy="72.5" r="1.6" fill="#FFFFFF" />
                <Circle cx="89" cy="74" r="4.2" fill="#064E3B" />
                <Circle cx="90.5" cy="72.5" r="1.6" fill="#FFFFFF" />

                {/* Rosy Blushing Cheeks */}
                <Ellipse cx="67" cy="80" rx="4" ry="2.2" fill="#F43F5E" opacity={0.6} />
                <Ellipse cx="95" cy="80" rx="4" ry="2.2" fill="#F43F5E" opacity={0.6} />

                {/* Happy cute smile */}
                <Path d="M77 81 Q 81 86 85 81" stroke="#064E3B" strokeWidth={2.2} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* HYPED EXPRESSION: Sparkling Starry Eyes & High Energy Smile */}
            {mood === 'hyped' && (
              <G id="face-hyped">
                {/* Left star eye */}
                <Path d="M73 69 L74.5 73 L78 74 L74.5 75 L73 79 L71.5 75 L68 74 L71.5 73 Z" fill="#78350F" />
                <Circle cx="74" cy="72" r="1" fill="#FFFFFF" />
                {/* Right star eye */}
                <Path d="M89 69 L90.5 73 L94 74 L90.5 75 L89 79 L87.5 75 L84 74 L87.5 73 Z" fill="#78350F" />
                <Circle cx="90" cy="72" r="1" fill="#FFFFFF" />

                {/* Radiant Rosy Cheeks */}
                <Ellipse cx="66" cy="79" rx="4.5" ry="2.5" fill="#EF4444" opacity={0.7} />
                <Ellipse cx="96" cy="79" rx="4.5" ry="2.5" fill="#EF4444" opacity={0.7} />

                {/* Open Excited Mouth */}
                <Path d="M76 81 Q 81 89 86 81 Q 81 84 76 81 Z" fill="#991B1B" />
                <Path d="M78 84 Q 81 87 84 84 Z" fill="#F87171" />
              </G>
            )}

            {/* CELEBRATING EXPRESSION: Laughing Victory Arcs & Wide Smile */}
            {mood === 'celebrating' && (
              <G id="face-celebrating">
                {/* Joyful squinted happy eye arcs */}
                <Path d="M68 74 Q 73 68 78 74" stroke="#4C1D95" strokeWidth={3} strokeLinecap="round" fill="none" />
                <Path d="M84 74 Q 89 68 94 74" stroke="#4C1D95" strokeWidth={3} strokeLinecap="round" fill="none" />

                {/* Glowing cheeks */}
                <Ellipse cx="66" cy="79" rx="4.5" ry="2.5" fill="#EC4899" opacity={0.8} />
                <Ellipse cx="96" cy="79" rx="4.5" ry="2.5" fill="#EC4899" opacity={0.8} />

                {/* Huge Victory Laugh */}
                <Path d="M75 80 Q 81 91 87 80 Z" fill="#581C87" />
                <Path d="M78 85 Q 81 89 84 85 Z" fill="#F472B6" />
                {/* Sparkling tooth reflection */}
                <Path d="M77 81 L85 81" stroke="#FFFFFF" strokeWidth={1.5} />
              </G>
            )}

            {/* REST / ZEN EXPRESSION: Peaceful Closed Eyes & Serene Smile */}
            {mood === 'rest' && (
              <G id="face-rest">
                <Path d="M69 74 Q 73 78 77 74" stroke="#0C4A6E" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                <Path d="M85 74 Q 89 78 93 74" stroke="#0C4A6E" strokeWidth={2.5} strokeLinecap="round" fill="none" />

                <Ellipse cx="67" cy="79" rx="3.5" ry="2" fill="#38BDF8" opacity={0.5} />
                <Ellipse cx="95" cy="79" rx="3.5" ry="2" fill="#38BDF8" opacity={0.5} />

                <Path d="M78 81 Q 81 85 84 81" stroke="#0C4A6E" strokeWidth={2} strokeLinecap="round" fill="none" />
              </G>
            )}

            {/* Fluffy Front Base Clouds */}
            <Path
              d="M25 135 C 25 122 38 118 48 122 C 54 114 68 114 74 122 C 82 118 96 122 96 135 Z"
              fill={isDark ? '#1E293B' : '#FFFFFF'}
              opacity={0.95}
            />
            <Path
              d="M85 135 C 85 120 98 116 108 120 C 115 112 130 112 138 122 C 146 118 158 122 158 135 Z"
              fill={isDark ? '#1E293B' : '#FFFFFF'}
              opacity={0.95}
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
    width: 90,
    height: 90,
    borderRadius: 45,
    top: 15,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.5,
    elevation: 6,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    zIndex: 3,
  },
  speechBubble: {
    position: 'absolute',
    top: -46,
    right: 0,
    zIndex: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    right: 40,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
