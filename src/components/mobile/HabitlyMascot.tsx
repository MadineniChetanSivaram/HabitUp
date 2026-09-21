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
  Rect,
} from 'react-native-svg';
import { useHabit } from '../../context/HabitContext';
import { isHabitScheduledOnDate } from '../../utils/streakCalculator';
import { soundService } from '../../services/soundService';

export type MascotMood = 'sleeping' | 'sad' | 'hopeful' | 'hyped' | 'celebrating' | 'rest' | 'awake';
export type MascotExpression = 'neutral' | 'wink' | 'starry' | 'love' | 'playful' | 'happy' | 'sad' | 'determined';

interface HabitlyMascotProps {
  onClick?: () => void;
  size?: number;
  forcedMood?: MascotMood;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
}

export const HabitlyMascot: React.FC<HabitlyMascotProps> = ({
  onClick,
  size = 120,
  forcedMood,
  equippedHat: propEquippedHat,
  equippedGlasses: propEquippedGlasses,
}) => {
  const {
    habits,
    completions,
    selectedDate,
    theme,
    soundEnabled,
    t,
    equippedHat: ctxHat,
    equippedGlasses: ctxGlasses,
  } = useHabit();

  const activeHat = propEquippedHat !== undefined ? propEquippedHat : ctxHat;
  const activeGlasses = propEquippedGlasses !== undefined ? propEquippedGlasses : ctxGlasses;
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
  const [activeExpression, setActiveExpression] = useState<MascotExpression>('neutral');
  const expressionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-wake up whenever user completes a habit
  useEffect(() => {
    if (completedCount > 0 && !isAwake) {
      setIsAwake(true);
      setShowSpeechBubble(true);
      setActiveExpression('happy');
    }
  }, [completedCount]);

  // Auto-dismiss speech bubble after 5 seconds so it doesn't linger
  useEffect(() => {
    if (showSpeechBubble) {
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSpeechBubble, quoteIndex]);

  // Bamboo growth stages:
  // 0: Sprout (0 habits done)
  // 1: Young stalk (1 - 50% habits done)
  // 2: Lush tall stalk (51 - 99% habits done)
  // 3: Eating feast! (100% all habits completed)
  let bambooStage = 0;
  if (progressPercent === 100 && totalCount > 0) {
    bambooStage = 3; // Eating feast!
  } else if (progressPercent > 50) {
    bambooStage = 2; // Lush tall stalk
  } else if (completedCount > 0) {
    bambooStage = 1; // Young stalk
  } else {
    bambooStage = 0; // Sprout
  }

  // Determine active mood:
  // - Sleeping initially if 0 completed and not yet tapped
  // - Sad / Pouting if awake and 0 completed
  // - Hopeful / Determined if 1 - 50% (halfway)
  // - Hyped / Starry if 51 - 99% (almost there)
  // - Celebrating / Feast if 100% done
  let mood: MascotMood = 'sleeping';
  if (forcedMood) {
    mood = forcedMood;
  } else if (totalCount === 0) {
    mood = 'rest';
  } else if (!isAwake && completedCount === 0) {
    mood = 'sleeping';
  } else if (completedCount === 0) {
    mood = 'sad'; // Awake with 0 habits done -> Sad / Pouting
  } else if (bambooStage === 3) {
    mood = 'celebrating'; // Munching bamboo feast!
  } else if (bambooStage === 2) {
    mood = 'hyped'; // 51 - 99%
  } else {
    mood = 'hopeful'; // 1 - 50% Halfway Done
  }

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const handWave = useRef(new Animated.Value(0)).current;
  const chewAnim = useRef(new Animated.Value(0)).current;
  const bambooScale = useRef(new Animated.Value(1)).current;
  const zzzAnim1 = useRef(new Animated.Value(0)).current;
  const zzzAnim2 = useRef(new Animated.Value(0)).current;
  const zzzAnim3 = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;

  const prevCompletedRef = useRef<number>(completedCount);
  const useNative = Platform.OS !== 'web';

  // Trigger bamboo growth pop animation whenever completedCount increases
  useEffect(() => {
    if (completedCount > prevCompletedRef.current) {
      Animated.sequence([
        Animated.spring(bambooScale, {
          toValue: 1.35,
          friction: 3,
          tension: 80,
          useNativeDriver: useNative,
        }),
        Animated.spring(bambooScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: useNative,
        }),
      ]).start();
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount]);

  useEffect(() => {
    const isSleep = mood === 'sleeping';
    const isMunching = bambooStage === 3;
    const isSad = mood === 'sad';

    // 1. Gentle floating / breathing idle animation loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: isSleep ? -2 : isSad ? 1 : -6,
          duration: isSleep ? 2200 : isMunching ? 700 : isSad ? 1800 : 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: isSleep ? 2 : isSad ? -1 : 4,
          duration: isSleep ? 2200 : isMunching ? 700 : isSad ? 1800 : 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    floatLoop.start();

    // 2. Continuous Tail wagging animation loop
    const tailDuration = isMunching ? 380 : isSleep ? 1800 : isSad ? 1400 : 650;
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: tailDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: tailDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    tailLoop.start();

    // 3. Cute Hand waving loop (when hopeful/hyped and awake)
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(handWave, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(handWave, {
          toValue: -1,
          duration: 480,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    if ((mood === 'hopeful' || mood === 'hyped' || mood === 'awake') && !isMunching) {
      waveLoop.start();
    }

    // 4. Munching & Chewing Animation (when eating at 100%)
    const chewLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chewAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(chewAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );
    if (isMunching) {
      chewLoop.start();
    }

    // 5. Floating Zzz Animation Loop (when sleeping)
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

    // 6. Aura glow pulse
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
      chewLoop.stop();
      zzz1.stop();
      zzz2.stop();
      zzz3.stop();
      auraLoop.stop();
    };
  }, [mood, bambooStage]);

  // Tap handler: Wakes up if sleeping, plays authentic animal sounds & expressions
  const handlePress = () => {
    let nextExpr: MascotExpression = 'happy';

    if (!isAwake) {
      // 😴 Waking up from sleep
      setIsAwake(true);
      setShowSpeechBubble(true);
      setQuoteIndex(0);
      nextExpr = 'happy';
      if (soundEnabled) {
        soundService.playMascotCuteSound('sleepy_yawn');
      }
    } else if (completedCount === 0) {
      // 🥺 Sad / Pleading tap (0 habits done)
      setShowSpeechBubble(true);
      setQuoteIndex(0);
      nextExpr = 'sad';
      if (soundEnabled) {
        soundService.playMascotCuteSound('sad_whimper');
      }
    } else if (bambooStage === 3) {
      // 🎋😋 100% Feast tap
      setShowSpeechBubble(true);
      nextExpr = 'happy';
      if (soundEnabled) {
        soundService.playMascotCuteSound('bamboo_crunch');
      }
    } else {
      // Active in-progress cycling
      setShowSpeechBubble(true);
      const nextIdx = (quoteIndex + 1) % 5;
      setQuoteIndex(nextIdx);

      if (progressPercent > 50) {
        // Hyped / Excited range
        switch (nextIdx) {
          case 0: nextExpr = 'starry'; break;
          case 1: nextExpr = 'wink'; break;
          case 2: nextExpr = 'happy'; break;
          case 3: nextExpr = 'love'; break;
          case 4: nextExpr = 'playful'; break;
          default: nextExpr = 'starry';
        }
        if (soundEnabled) {
          soundService.playMascotCuteSound('excited_twitter');
        }
      } else {
        // 1 - 50% Halfway / Determined range
        switch (nextIdx) {
          case 0: nextExpr = 'determined'; break;
          case 1: nextExpr = 'happy'; break;
          case 2: nextExpr = 'wink'; break;
          case 3: nextExpr = 'love'; break;
          case 4: nextExpr = 'playful'; break;
          default: nextExpr = 'determined';
        }
        if (soundEnabled) {
          soundService.playMascotCuteSound('half_done_chirp');
        }
      }
    }

    setActiveExpression(nextExpr);
    if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current);
    expressionTimerRef.current = setTimeout(() => {
      setActiveExpression('neutral');
    }, 4500);

    // Spring squash & stretch
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

    // Ear wiggle animation
    Animated.sequence([
      Animated.timing(earWiggle, { toValue: 4, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: -4, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 2, duration: 75, useNativeDriver: useNative }),
      Animated.timing(earWiggle, { toValue: 0, duration: 75, useNativeDriver: useNative }),
    ]).start();

    if (onClick) {
      onClick();
    }
  };

  // Messages in speech bubble across moods
  const getMoodMessage = () => {
    if (mood === 'sleeping') {
      return t('mascot.mood_sleeping', 'Zzz... 😴 Tap me to wake up!');
    }

    if (mood === 'sad') {
      return t('mascot.mood_sad', "I'm waiting for your habits... 🥺 Let's complete habit #1 to water my sprout! 🌱");
    }

    if (bambooStage === 3) {
      return t('mascot.bamboo_munch', 'Nom nom nom! 🎋😋 All habits crushed today! That bamboo was delicious! 🏆🌟');
    }

    if (quoteIndex === 0) {
      if (bambooStage === 1) {
        return t('mascot.bamboo_growing', 'Great start! Halfway there, keep the momentum going! 🎋💪');
      }
      if (bambooStage === 2) {
        return t('mascot.bamboo_almost', 'Almost fully grown! 🎋 Look how tall and juicy this bamboo is! 🔥✨');
      }
      return t('mascot.mood_hopeful', "Great start! Keep the momentum going! 🌱");
    }

    if (quoteIndex === 1) return t('mascot.tap_1', 'Consistency is your superpower! ⚡');
    if (quoteIndex === 2) return t('mascot.tap_2', "One habit at a time, you're building a great future! 🚀");
    if (quoteIndex === 3) return t('mascot.tap_3', 'High five! I believe in you! ✋');
    if (quoteIndex === 4) return t('mascot.tap_4', 'Keep showing up! You got this! 🌟');

    return t('mascot.mood_hopeful', "Great start! Keep the momentum going! 🌱");
  };

  const AnimatedView = Animated.View as any;

  // Aura colors based on mood
  const getAuraColor = () => {
    switch (mood) {
      case 'sleeping':
        return 'rgba(99, 102, 241, 0.22)';
      case 'sad':
        return 'rgba(148, 163, 184, 0.24)'; // Melancholic soft blue-gray aura
      case 'celebrating':
        return 'rgba(234, 179, 8, 0.45)'; // Golden feast aura
      case 'hyped':
        return 'rgba(34, 197, 94, 0.38)'; // Emerald lush aura
      case 'hopeful':
        return 'rgba(16, 185, 129, 0.28)'; // Fresh green growth aura
      case 'awake':
        return 'rgba(251, 146, 60, 0.30)';
      case 'rest':
      default:
        return 'rgba(56, 189, 248, 0.25)';
    }
  };

  const auraColor = getAuraColor();

  // Waving rotation (natural cute wrist/forearm tilt from shoulder joint)
  const pawWaveRotate = handWave.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '14deg'],
  });

  // Lively Tail wagging rotation
  const tailWagRotate = tailWag.interpolate({
    inputRange: [-1, 1],
    outputRange: bambooStage === 3 ? ['-12deg', '16deg'] : mood === 'sad' ? ['-4deg', '6deg'] : ['-8deg', '12deg'],
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

  const isWavingMood = (mood === 'hopeful' || mood === 'hyped' || mood === 'awake') && bambooStage !== 3;
  const isMunchingStage = bambooStage === 3;
  const mascotPixelSize = size * 1.25;

  return (
    <View style={[styles.outerWrapper, { width: size * 1.3, height: size * 1.25 }]}>
      {/* 💬 Interactive Multilingual Speech Bubble (Positioned safely to left of Sparky) */}
      {showSpeechBubble && (
        <TouchableOpacity
          style={[
            styles.speechBubble,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor:
                isMunchingStage ? '#F59E0B' : mood === 'sleeping' ? '#818CF8' : mood === 'sad' ? '#94A3B8' : '#22C55E',
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
              {
                borderLeftColor:
                  isMunchingStage ? '#F59E0B' : mood === 'sleeping' ? '#818CF8' : mood === 'sad' ? '#94A3B8' : '#22C55E',
              },
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
            <Text style={[styles.zzzText, { color: '#818CF8', fontSize: 13 }]}>z</Text>
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
            <Text style={[styles.zzzText, { color: '#6366F1', fontSize: 16 }]}>z</Text>
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
            <Text style={[styles.zzzText, { color: '#4F46E5', fontSize: 20 }]}>Z</Text>
          </AnimatedView>
        </View>
      )}

      {/* Main Touchable Mascot Container */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.92}
        style={[styles.touchable, { width: size * 1.3, height: size * 1.25 }]}
      >
        <AnimatedView
          style={[
            styles.animatedContainer,
            {
              width: size * 1.3,
              height: size * 1.25,
              transform: [
                { translateY: floatAnim },
                { scale: bounceScale },
                { rotate: earWiggle.interpolate({ inputRange: [-4, 4], outputRange: ['-4deg', '4deg'] }) },
              ],
            },
          ]}
        >
          {/* Radial Aura Glow */}
          <AnimatedView
            style={[
              styles.auraGlow,
              {
                width: size * 1.05,
                height: size * 1.05,
                borderRadius: size,
                top: (size * 1.25 - size * 1.05) / 2,
                left: (size * 1.3 - size * 1.05) / 2,
                backgroundColor: auraColor,
                transform: [{ scale: auraPulse }],
              },
            ]}
          />

          {/* ======================================================== */}
          {/* LAYER 1: ISOLATED HW-ACCELERATED TAIL (behind body)      */}
          {/* ======================================================== */}
          <AnimatedView
            style={[
              styles.layerAbsolute,
              {
                transform: [{ rotate: tailWagRotate }],
                transformOrigin: '58% 68%' as any,
                zIndex: 1,
              },
            ]}
            pointerEvents="none"
          >
            <Svg width={mascotPixelSize} height={mascotPixelSize} viewBox="0 0 160 160">
              <Defs>
                <LinearGradient id="tailGradFull" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FB923C" />
                  <Stop offset="50%" stopColor="#EA580C" />
                  <Stop offset="100%" stopColor="#9A3412" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 94 104 C 122 114, 150 100, 146 72 C 142 50, 120 54, 108 76 Z"
                fill="url(#tailGradFull)"
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
          </AnimatedView>

          {/* ======================================================== */}
          {/* LAYER 2: CHUBBY BODY, EARS, HEAD & BAMBOO STALKS         */}
          {/* ======================================================== */}
          <View style={[styles.layerAbsolute, { zIndex: 5 }]} pointerEvents="none">
            <Svg width={mascotPixelSize} height={mascotPixelSize} viewBox="0 0 160 160">
              <Defs>
                <RadialGradient id="rpFurGrad2" cx="50%" cy="35%" r="65%">
                  <Stop offset="0%" stopColor="#FB923C" />
                  <Stop offset="60%" stopColor="#EA580C" />
                  <Stop offset="100%" stopColor="#C2410C" />
                </RadialGradient>
                <LinearGradient id="rpDarkFur2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#3F1D0B" />
                  <Stop offset="100%" stopColor="#240F05" />
                </LinearGradient>
                <LinearGradient id="rpCrown2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FDE047" />
                  <Stop offset="60%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#D97706" />
                </LinearGradient>
              </Defs>

              {/* Teddy Bear Rounded Ears on top of head */}
              <G id="rp-ears" transform={mood === 'sad' ? 'translate(0, 3)' : undefined}>
                {/* Left Ear */}
                <Path
                  d={mood === 'sad' ? "M 36 54 C 24 38, 38 24, 54 34 C 58 40, 54 48, 46 54 Z" : "M 36 50 C 26 30, 40 18, 56 30 C 60 36, 56 46, 48 52 Z"}
                  fill="url(#rpFurGrad2)"
                />
                <Path
                  d={mood === 'sad' ? "M 38 52 C 28 40, 40 30, 50 38 Z" : "M 38 48 C 30 34, 42 26, 52 34 Z"}
                  fill="#FFFFFF"
                />

                {/* Right Ear */}
                <Path
                  d={mood === 'sad' ? "M 124 54 C 136 38, 122 24, 106 34 C 102 40, 106 48, 114 54 Z" : "M 124 50 C 134 30, 120 18, 104 30 C 100 36, 104 46, 112 52 Z"}
                  fill="url(#rpFurGrad2)"
                />
                <Path
                  d={mood === 'sad' ? "M 122 52 C 132 40, 120 30, 110 38 Z" : "M 122 48 C 130 34, 118 26, 108 34 Z"}
                  fill="#FFFFFF"
                />
              </G>

              {/* ======================================================== */}
              {/* 🎩 EQUIPPED HATS & HEADGEAR (Rendered on top of head)    */}
              {/* ======================================================== */}
              {/* 🕵️ Detective Cap */}
              {activeHat === 'detective' && (
                <G id="rp-hat-detective">
                  <Path d="M 52 40 C 50 24, 62 18, 80 18 C 98 18, 110 24, 108 40 Z" fill="#78350F" />
                  <Path d="M 54 34 Q 80 30 106 34" stroke="#92400E" strokeWidth={2.5} fill="none" />
                  <Path d="M 46 40 Q 80 48 114 40 Q 80 36 46 40 Z" fill="#451A03" />
                  <Circle cx="80" cy="26" r="4" stroke="#FDE047" strokeWidth={1.5} fill="#38BDF8" opacity={0.8} />
                  <Line x1="83" y1="29" x2="86" y2="33" stroke="#FDE047" strokeWidth={1.5} strokeLinecap="round" />
                </G>
              )}

              {/* 🧙 Wizard Star Hat */}
              {activeHat === 'wizard' && (
                <G id="rp-hat-wizard">
                  <Path d="M 54 40 C 65 24, 72 8, 82 4 C 88 10, 92 24, 106 40 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                  <Path d="M 82 4 Q 90 0 92 6 Q 85 7 82 4 Z" fill="#1E1B4B" />
                  <Ellipse cx="80" cy="40" rx="30" ry="6.5" fill="#1E1B4B" />
                  <Path d="M 58 37 Q 80 43 102 37" stroke="#F59E0B" strokeWidth={3} fill="none" />
                  <Path d="M 76 22 L 77.5 25 L 81 25.5 L 78.5 28 L 79 31 L 76 29.5 L 73 31 L 73.5 28 L 71 25.5 L 74.5 25 Z" fill="#FDE047" />
                </G>
              )}

              {/* 👨‍🍳 Chef Toque */}
              {activeHat === 'chef' && (
                <G id="rp-hat-chef">
                  <Path d="M 58 36 C 52 24, 62 12, 70 14 C 74 8, 86 8, 90 14 C 98 12, 108 24, 102 36 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
                  <Path d="M 70 16 Q 72 28 72 34 M 80 12 Q 80 26 80 34 M 90 16 Q 88 28 88 34" stroke="#E2E8F0" strokeWidth={1.2} />
                  <Rect x="58" y="34" width="44" height="7" rx="2" fill="#E2E8F0" />
                </G>
              )}

              {/* 👑 Royal Crown (Equipped Only) */}
              {activeHat === 'crown' && (
                <G id="rp-crown">
                  <Path d="M66 32 L70 14 L76 23 L80 10 L84 23 L90 14 L94 32 Z" fill="url(#rpCrown2)" stroke="#B45309" strokeWidth={1} />
                  <Circle cx="80" cy="18" r="2.5" fill="#EF4444" />
                  <Circle cx="72" cy="22" r="1.8" fill="#3B82F6" />
                  <Circle cx="88" cy="22" r="1.8" fill="#10B981" />
                </G>
              )}

              {/* 🎅 Santa Cap */}
              {activeHat === 'santa' && (
                <G id="rp-hat-santa">
                  <Path d="M 54 38 C 58 22, 74 12, 94 14 C 104 18, 108 26, 114 34 Z" fill="#DC2626" />
                  <Circle cx="116" cy="36" r="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
                  <Rect x="50" y="34" width="60" height="9" rx="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
                </G>
              )}

              {/* 🥋 Ninja Headband */}
              {activeHat === 'ninja_band' && (
                <G id="rp-hat-ninja">
                  <Path d="M 44 48 Q 80 43 116 48 L 115 54 Q 80 49 45 54 Z" fill="#DC2626" />
                  <Rect x="70" y="46" width="20" height="6" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth={0.8} />
                  <Path d="M 115 50 Q 124 54 128 64 Q 122 62 114 53 Z M 115 52 Q 126 60 124 72 Q 120 66 113 55 Z" fill="#B91C1C" />
                </G>
              )}

              {/* 🌸 Flower Crown */}
              {activeHat === 'flower_crown' && (
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
              {activeHat === 'party_hat' && (
                <G id="rp-hat-party">
                  <Path d="M 64 38 L 80 12 L 96 38 Z" fill="#F43F5E" />
                  <Path d="M 68 32 L 80 12 L 92 32 Z" fill="#F59E0B" />
                  <Path d="M 72 26 L 80 12 L 88 26 Z" fill="#10B981" />
                  <Path d="M 76 20 L 80 12 L 84 20 Z" fill="#3B82F6" />
                  <Circle cx="80" cy="11" r="3.5" fill="#FDE047" />
                </G>
              )}

              {/* 🧢 Beanie */}
              {activeHat === 'beanie' && (
                <G id="rp-hat-beanie">
                  <Path d="M 52 40 C 50 24, 62 16, 80 16 C 98 16, 110 24, 108 40 Z" fill="#0D9488" />
                  <Rect x="48" y="34" width="64" height="9" rx="3" fill="#115E59" />
                  <Circle cx="80" cy="14" r="4.5" fill="#F59E0B" />
                </G>
              )}

              {/* Chubby Seated Body & Belly */}
              <Ellipse cx="80" cy="100" rx="34" ry="26" fill="url(#rpFurGrad2)" />
              <Ellipse cx="80" cy="105" rx="21" ry="15" fill="url(#rpDarkFur2)" />
              <Path d="M 72 88 Q 80 95 88 88 Q 80 92 72 88 Z" fill="#FFFFFF" opacity={0.9} />

              {/* Bottom Hind Feet (Paws 3 & 4 of 4 Paws) */}
              {/* Left Foot */}
              <Ellipse cx="48" cy="123" rx="11" ry="8" fill="url(#rpDarkFur2)" transform="rotate(-10 48 123)" />
              <Ellipse cx="48" cy="123" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(-10 48 123)" />
              <Circle cx="41" cy="119" r="1.6" fill="#FEF08A" opacity={0.95} />
              <Circle cx="46" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />
              <Circle cx="52" cy="117" r="1.6" fill="#FEF08A" opacity={0.95} />

              {/* Right Foot */}
              <Ellipse cx="112" cy="123" rx="11" ry="8" fill="url(#rpDarkFur2)" transform="rotate(10 112 123)" />
              <Ellipse cx="112" cy="123" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(10 112 123)" />
              <Circle cx="108" cy="117" r="1.6" fill="#FEF08A" opacity={0.95} />
              <Circle cx="114" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />
              <Circle cx="119" cy="119" r="1.6" fill="#FEF08A" opacity={0.95} />

              {/* ==================================================== */}
              {/* 🎋 PROGRESSIVE BAMBOO GROWTH (Held in Left Paw 1)    */}
              {/* ==================================================== */}

              {/* Stage 0: Tiny Bamboo Sprout (0 habits done) */}
              {bambooStage === 0 && (
                <G id="bamboo-stage-0">
                  <Path d="M 58 102 L 54 84" stroke="#22C55E" strokeWidth={3.2} strokeLinecap="round" />
                  <Path d="M 54 84 Q 46 80 44 85 Q 50 87 54 84 Z" fill="#4ADE80" />
                  <Path d="M 54 84 Q 58 76 64 78 Q 59 84 54 84 Z" fill="#16A34A" />
                </G>
              )}

              {/* Stage 1: Young Growing Bamboo Stalk (1 - 50% habits done) */}
              {bambooStage === 1 && (
                <G id="bamboo-stage-1">
                  <Path d="M 60 114 L 52 70" stroke="#22C55E" strokeWidth={4.6} strokeLinecap="round" />
                  <Line x1="58.5" y1="102" x2="55.5" y2="101" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                  <Line x1="56" y1="88" x2="53" y2="87" stroke="#14532D" strokeWidth={1.8} strokeLinecap="round" />
                  <Path d="M 52 70 Q 40 64 36 70 Q 44 73 52 70 Z" fill="#22C55E" />
                  <Path d="M 52 70 Q 56 58 64 60 Q 58 68 52 70 Z" fill="#16A34A" />
                  <Path d="M 54 86 Q 42 82 39 88 Q 47 90 54 86 Z" fill="#4ADE80" />
                  <Path d="M 57 98 Q 66 94 69 100 Q 61 101 57 98 Z" fill="#22C55E" />
                </G>
              )}

              {/* Stage 2: Tall Lush Flourishing Bamboo (51 - 99% habits done) */}
              {bambooStage === 2 && (
                <G id="bamboo-stage-2">
                  <Path d="M 60 118 L 48 54" stroke="#22C55E" strokeWidth={5.5} strokeLinecap="round" />
                  <Line x1="58.5" y1="104" x2="55.5" y2="103" stroke="#14532D" strokeWidth={2} strokeLinecap="round" />
                  <Line x1="55" y1="88" x2="52" y2="87" stroke="#14532D" strokeWidth={2} strokeLinecap="round" />
                  <Line x1="51.5" y1="72" x2="48.5" y2="71" stroke="#14532D" strokeWidth={2} strokeLinecap="round" />
                  {/* Lush Foliage */}
                  <Path d="M 48 54 Q 34 46 28 54 Q 38 58 48 54 Z" fill="#22C55E" />
                  <Path d="M 48 54 Q 54 40 64 42 Q 56 52 48 54 Z" fill="#16A34A" />
                  <Path d="M 50 72 Q 36 66 32 74 Q 42 77 50 72 Z" fill="#4ADE80" />
                  <Path d="M 53 74 Q 64 68 68 76 Q 58 78 53 74 Z" fill="#22C55E" />
                  <Path d="M 55 90 Q 42 84 38 92 Q 48 95 55 90 Z" fill="#15803D" />
                  <Path d="M 57 104 Q 68 98 72 106 Q 62 108 57 104 Z" fill="#4ADE80" />
                  {/* Golden Sparkle */}
                  <Path d="M 44 48 L 46 51 L 49 51.5 L 46.5 54 L 47 57 L 44 55.5 L 41 57 L 41.5 54 L 39 51.5 L 42 51 Z" fill="#FDE047" />
                </G>
              )}

              {/* Left Front Paw (holding the growing stalk or handheld accessory) */}
              {!isMunchingStage && (
                <G id="rp-front-paw-left">
                  <Ellipse cx="58" cy="98" rx="7.5" ry="6.5" fill="url(#rpDarkFur2)" transform="rotate(-15 58 98)" />
                  <Ellipse cx="58" cy="98" rx="3" ry="2.2" fill="#FEF08A" opacity={0.9} />
                </G>
              )}

              {/* Right Front Paw Resting (when sleeping or sad) */}
              {(mood === 'sleeping' || mood === 'sad') && (
                <G id="rp-front-paw-right-sleeping">
                  <Ellipse cx="100" cy="94" rx="8" ry="7" fill="url(#rpDarkFur2)" transform="rotate(15 100 94)" />
                  <Ellipse cx="100" cy="94" rx="3" ry="2.2" fill="#FEF08A" opacity={0.9} />
                </G>
              )}

              {/* Round Chubby Head & Markings */}
              <Ellipse cx="80" cy="62" rx="36" ry="29" fill="url(#rpFurGrad2)" />
              <Ellipse cx="80" cy="69" rx="15" ry="11" fill="#FFFFFF" />
              <Circle cx="63" cy="49" r="4.2" fill="#FFFFFF" />
              <Circle cx="97" cy="49" r="4.2" fill="#FFFFFF" />
              <Path d="M 48 64 C 45 72, 52 77, 57 73 C 55 67, 51 64, 48 64 Z" fill="#FFFFFF" />
              <Path d="M 112 64 C 115 72, 108 77, 103 73 C 105 67, 109 64, 112 64 Z" fill="#FFFFFF" />

              {/* Cute Black Button Nose with Highlight */}
              <Path d="M 76 65 Q 80 63 84 65 Q 80 70 76 65 Z" fill="#1C1917" />
              <Circle cx="78.5" cy="65.5" r="0.7" fill="#FFFFFF" />

              {/* ==================================================== */}
              {/* DYNAMIC FACIAL EXPRESSIONS & INTERACTIVE EYE STATES  */}
              {/* ==================================================== */}

              {/* 😴 1. Sleeping Face (Initial / Uninteracted Morning) */}
              {mood === 'sleeping' && (
                <G id="rp-face-sleeping">
                  <Path d="M 64 61 Q 69 66 74 61" stroke="#1C1917" strokeWidth={2.6} strokeLinecap="round" fill="none" />
                  <Path d="M 86 61 Q 91 66 96 61" stroke="#1C1917" strokeWidth={2.6} strokeLinecap="round" fill="none" />
                  <Path d="M 77 71 Q 80 74 83 71" stroke="#1C1917" strokeWidth={1.8} strokeLinecap="round" fill="none" />
                  <Ellipse cx="55" cy="67" rx="4" ry="2.2" fill="#F43F5E" opacity={0.45} />
                  <Ellipse cx="105" cy="67" rx="4" ry="2.2" fill="#F43F5E" opacity={0.45} />
                </G>
              )}

              {/* 🥺 2. Sad / Pouting Face (Awake with 0 Habits Completed) */}
              {mood === 'sad' && activeExpression === 'neutral' && (
                <G id="rp-face-sad">
                  {/* Sad Drooping Eyebrows */}
                  <Path d="M 60 52 Q 65 50 70 54" stroke="#7C2D12" strokeWidth={2.2} strokeLinecap="round" fill="none" />
                  <Path d="M 100 52 Q 95 50 90 54" stroke="#7C2D12" strokeWidth={2.2} strokeLinecap="round" fill="none" />

                  {/* Sad Puppy Eyes with Glistening Teardrop Reflections */}
                  <Ellipse cx="65" cy="60" rx="4.8" ry="4.4" fill="#1C1917" />
                  <Circle cx="63.5" cy="58" r="2.2" fill="#FFFFFF" />
                  <Circle cx="67" cy="62" r="1" fill="#93C5FD" />
                  <Path d="M 59 62 Q 57 65 59 67 Q 61 65 59 62 Z" fill="#60A5FA" opacity={0.9} />

                  <Ellipse cx="95" cy="60" rx="4.8" ry="4.4" fill="#1C1917" />
                  <Circle cx="93.5" cy="58" r="2.2" fill="#FFFFFF" />
                  <Circle cx="97" cy="62" r="1" fill="#93C5FD" />
                  <Path d="M 101 62 Q 103 65 101 67 Q 99 65 101 62 Z" fill="#60A5FA" opacity={0.9} />

                  {/* Cute Downturned Pout Mouth */}
                  <Path d="M 76 72 Q 80 68 84 72" stroke="#1C1917" strokeWidth={2.4} strokeLinecap="round" fill="none" />

                  {/* Soft Pouting Blush */}
                  <Ellipse cx="54" cy="66" rx="4.2" ry="2.2" fill="#FB7185" opacity={0.5} />
                  <Ellipse cx="106" cy="66" rx="4.2" ry="2.2" fill="#FB7185" opacity={0.5} />
                </G>
              )}

              {/* 🎋💪 3. Halfway Done / Determined Face (1 - 50%) */}
              {mood === 'hopeful' && activeExpression === 'neutral' && (
                <G id="rp-face-half-done">
                  {/* Determined Eyebrows */}
                  <Path d="M 61 53 Q 66 51 71 52" stroke="#7C2D12" strokeWidth={2} strokeLinecap="round" fill="none" />
                  <Path d="M 99 53 Q 94 51 89 52" stroke="#7C2D12" strokeWidth={2} strokeLinecap="round" fill="none" />

                  {/* Bright Focused Eyes */}
                  <Circle cx="65" cy="59" r="4.8" fill="#1C1917" />
                  <Circle cx="63.5" cy="57" r="2.2" fill="#FFFFFF" />
                  <Circle cx="67" cy="60" r="1.1" fill="#4ADE80" />

                  <Circle cx="95" cy="59" r="4.8" fill="#1C1917" />
                  <Circle cx="93.5" cy="57" r="2.2" fill="#FFFFFF" />
                  <Circle cx="97" cy="60" r="1.1" fill="#4ADE80" />

                  {/* Confident Sweet Smile */}
                  <Path d="M 75 69.5 Q 80 74 85 69.5" stroke="#1C1917" strokeWidth={2.2} strokeLinecap="round" fill="none" />

                  {/* Rosy Cheeks */}
                  <Ellipse cx="54" cy="66" rx="4.8" ry="2.8" fill="#F43F5E" opacity={0.7} />
                  <Ellipse cx="106" cy="66" rx="4.8" ry="2.8" fill="#F43F5E" opacity={0.7} />
                </G>
              )}

              {/* 🔥✨ 4. Hyped / Starry Face (51 - 99%) */}
              {mood === 'hyped' && activeExpression === 'neutral' && (
                <G id="rp-face-hyped">
                  {/* Star Sparkle Left Eye */}
                  <Circle cx="65" cy="59" r="5.2" fill="#1C1917" />
                  <Path d="M 65 54.5 L 66.2 57.8 L 69.5 59 L 66.2 60.2 L 65 63.5 L 63.8 60.2 L 60.5 59 L 63.8 57.8 Z" fill="#FDE047" />
                  <Circle cx="65" cy="59" r="1.2" fill="#FFFFFF" />

                  {/* Star Sparkle Right Eye */}
                  <Circle cx="95" cy="59" r="5.2" fill="#1C1917" />
                  <Path d="M 95 54.5 L 96.2 57.8 L 99.5 59 L 96.2 60.2 L 95 63.5 L 93.8 60.2 L 90.5 59 L 93.8 57.8 Z" fill="#FDE047" />
                  <Circle cx="95" cy="59" r="1.2" fill="#FFFFFF" />

                  {/* Excited Open Smile */}
                  <Path d="M 75 69 Q 80 77 85 69 Z" fill="#1C1917" />
                  <Path d="M 77 73 Q 80 76 83 73 Z" fill="#F472B6" />

                  {/* Golden Glow Cheeks */}
                  <Ellipse cx="54" cy="66" rx="4.8" ry="2.8" fill="#F59E0B" opacity={0.75} />
                  <Ellipse cx="106" cy="66" rx="4.8" ry="2.8" fill="#F59E0B" opacity={0.75} />
                </G>
              )}

              {/* 😋 5. 100% FEAST: Laughing Joyful Eyes (^ω^) & Chewing Blush */}
              {isMunchingStage && (
                <G id="rp-face-munching">
                  <Path d="M 61 59 Q 66 53 71 59" stroke="#3F1D0B" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                  <Path d="M 89 59 Q 94 53 99 59" stroke="#3F1D0B" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                  <Ellipse cx="54" cy="66" rx="4.5" ry="2.6" fill="#EC4899" opacity={0.8} />
                  <Ellipse cx="106" cy="66" rx="4.5" ry="2.6" fill="#EC4899" opacity={0.8} />
                </G>
              )}

              {/* ✨ 6. Interactive Active Expression: WINK (^.~) */}
              {!isMunchingStage && mood !== 'sleeping' && activeExpression === 'wink' && (
                <G id="rp-face-wink">
                  <Circle cx="65" cy="59" r="5" fill="#1C1917" />
                  <Circle cx="63.5" cy="57.2" r="2" fill="#FFFFFF" />
                  <Circle cx="67" cy="60.5" r="0.9" fill="#FFFFFF" />

                  <Path d="M 90 59 Q 95 64 100 59" stroke="#1C1917" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <Path d="M 98 58 L 101 55" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />

                  <Path d="M 74 69.5 Q 77 73 80 70 Q 83 73 86 69.5" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                  <Ellipse cx="54" cy="66" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.75} />
                  <Ellipse cx="106" cy="66" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.75} />
                </G>
              )}

              {/* 🌟 7. Interactive Active Expression: STARRY (★ ★) */}
              {!isMunchingStage && mood !== 'sleeping' && activeExpression === 'starry' && (
                <G id="rp-face-starry">
                  <Circle cx="65" cy="59" r="5.2" fill="#1C1917" />
                  <Path d="M 65 54.5 L 66.2 57.8 L 69.5 59 L 66.2 60.2 L 65 63.5 L 63.8 60.2 L 60.5 59 L 63.8 57.8 Z" fill="#FDE047" />
                  <Circle cx="65" cy="59" r="1.2" fill="#FFFFFF" />

                  <Circle cx="95" cy="59" r="5.2" fill="#1C1917" />
                  <Path d="M 95 54.5 L 96.2 57.8 L 99.5 59 L 96.2 60.2 L 95 63.5 L 93.8 60.2 L 90.5 59 L 93.8 57.8 Z" fill="#FDE047" />
                  <Circle cx="95" cy="59" r="1.2" fill="#FFFFFF" />

                  <Path d="M 75 69 Q 80 77 85 69 Z" fill="#1C1917" />
                  <Path d="M 77 73 Q 80 76 83 73 Z" fill="#F472B6" />

                  <Ellipse cx="54" cy="66" rx="4.8" ry="2.8" fill="#F59E0B" opacity={0.7} />
                  <Ellipse cx="106" cy="66" rx="4.8" ry="2.8" fill="#F59E0B" opacity={0.7} />
                </G>
              )}

              {/* 💖 8. Interactive Active Expression: LOVE HEART EYES (♥ ♥) */}
              {!isMunchingStage && mood !== 'sleeping' && activeExpression === 'love' && (
                <G id="rp-face-love">
                  <Path d="M 65 63.5 C 60 59, 59 55, 62 53.5 C 64.5 52.2, 65 54.5, 65 54.5 C 65 54.5, 65.5 52.2, 68 53.5 C 71 55, 70 59, 65 63.5 Z" fill="#EC4899" />
                  <Circle cx="64" cy="55.5" r="0.8" fill="#FFFFFF" />

                  <Path d="M 95 63.5 C 90 59, 89 55, 92 53.5 C 94.5 52.2, 95 54.5, 95 54.5 C 95 54.5, 95.5 52.2, 98 53.5 C 101 55, 100 59, 95 63.5 Z" fill="#EC4899" />
                  <Circle cx="94" cy="55.5" r="0.8" fill="#FFFFFF" />

                  <Path d="M 76 70 Q 80 74 84 70" stroke="#1C1917" strokeWidth={2.2} strokeLinecap="round" fill="none" />

                  <Ellipse cx="54" cy="66" rx="5" ry="3" fill="#EC4899" opacity={0.8} />
                  <Ellipse cx="106" cy="66" rx="5" ry="3" fill="#EC4899" opacity={0.8} />
                </G>
              )}

              {/* 😜 9. Interactive Active Expression: PLAYFUL TONGUE-OUT (>.< :P) */}
              {!isMunchingStage && mood !== 'sleeping' && activeExpression === 'playful' && (
                <G id="rp-face-playful">
                  <Path d="M 61 56 L 68 59 L 61 62" stroke="#1C1917" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <Path d="M 99 56 L 92 59 L 99 62" stroke="#1C1917" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  <Path d="M 75 69 Q 80 73 85 69" stroke="#1C1917" strokeWidth={2.2} strokeLinecap="round" fill="none" />
                  <Path d="M 78 70 Q 80 76 82 70 Z" fill="#FB7185" stroke="#E11D48" strokeWidth={0.8} />

                  <Ellipse cx="54" cy="66" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />
                  <Ellipse cx="106" cy="66" rx="4.5" ry="2.6" fill="#F43F5E" opacity={0.7} />
                </G>
              )}

              {/* 😄 10. Interactive Active Expression: ULTRA CHEERFUL ANIME BEAM */}
              {!isMunchingStage && mood !== 'sleeping' && activeExpression === 'happy' && (
                <G id="rp-face-happy">
                  <Circle cx="65" cy="59" r="5" fill="#1C1917" />
                  <Circle cx="63.5" cy="57" r="2.2" fill="#FFFFFF" />
                  <Circle cx="67" cy="60.5" r="1.1" fill="#FFFFFF" />

                  <Circle cx="95" cy="59" r="5" fill="#1C1917" />
                  <Circle cx="93.5" cy="57" r="2.2" fill="#FFFFFF" />
                  <Circle cx="97" cy="60.5" r="1.1" fill="#FFFFFF" />

                  <Path d="M 75 69.5 Q 77.5 73.5 80 70.5 Q 82.5 73.5 85 69.5" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                  <Ellipse cx="54" cy="66" rx="4.6" ry="2.7" fill="#FB7185" opacity={0.75} />
                  <Ellipse cx="106" cy="66" rx="4.6" ry="2.7" fill="#FB7185" opacity={0.75} />
                </G>
              )}

              {/* ==================================================== */}
              {/* 🕶️ EQUIPPED GLASSES & EYEWEAR (Rendered over eyes)   */}
              {/* ==================================================== */}
              {/* 😎 Cool Aviators */}
              {activeGlasses === 'aviators' && (
                <G id="rp-glasses-aviators">
                  <Path d="M 52 54 L 108 54 M 74 58 Q 80 55 86 58" stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" />
                  <Path d="M 54 54 C 54 66, 62 70, 72 68 C 76 66, 76 56, 74 54 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth={1.5} />
                  <Line x1="58" y1="56" x2="68" y2="66" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.65} />
                  <Path d="M 86 54 C 84 56, 84 66, 88 68 C 98 70, 106 66, 106 54 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth={1.5} />
                  <Line x1="90" y1="56" x2="100" y2="66" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.65} />
                </G>
              )}

              {/* 👓 Scholar Round Specs */}
              {activeGlasses === 'round_specs' && (
                <G id="rp-glasses-round">
                  <Path d="M 73 59 Q 80 56 87 59" stroke="#334155" strokeWidth={2} strokeLinecap="round" fill="none" />
                  <Circle cx="63" cy="59" r="9" stroke="#334155" strokeWidth={2.2} fill="#38BDF8" opacity={0.2} />
                  <Circle cx="97" cy="59" r="9" stroke="#334155" strokeWidth={2.2} fill="#38BDF8" opacity={0.2} />
                </G>
              )}

              {/* 🧐 Golden Monocle */}
              {activeGlasses === 'monocle' && (
                <G id="rp-glasses-monocle">
                  <Circle cx="95" cy="59" r="8.5" stroke="#F59E0B" strokeWidth={2} fill="#38BDF8" opacity={0.25} />
                  <Path d="M 98 65 Q 106 75 102 88" stroke="#D97706" strokeWidth={1.2} strokeLinecap="round" fill="none" strokeDasharray="2,2" />
                </G>
              )}

              {/* 🤩 Star Rocker Glasses */}
              {activeGlasses === 'star_glasses' && (
                <G id="rp-glasses-star">
                  <Line x1="72" y1="58" x2="88" y2="58" stroke="#EAB308" strokeWidth={2} strokeLinecap="round" />
                  <Path d="M 64 50 L 66.5 56 L 73 57 L 68 62 L 69.5 68 L 64 65 L 58.5 68 L 60 62 L 55 57 L 61.5 56 Z" fill="#FDE047" stroke="#EAB308" strokeWidth={1.2} />
                  <Path d="M 96 50 L 98.5 56 L 105 57 L 100 62 L 101.5 68 L 96 65 L 90.5 68 L 92 62 L 87 57 L 93.5 56 Z" fill="#FDE047" stroke="#EAB308" strokeWidth={1.2} />
                </G>
              )}

              {/* 🕶️ 8-Bit Pixel Shades */}
              {activeGlasses === 'pixel_shades' && (
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
              {isMunchingStage && (
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
                    <Path d="M 52 94 C 54 88, 66 84, 76 86 C 80 87, 82 92, 78 96 C 70 99, 60 102, 52 94 Z" fill="url(#rpDarkFur2)" />
                    <Ellipse cx="76" cy="88" rx="5" ry="4.2" fill="url(#rpDarkFur2)" transform="rotate(-15 76 88)" />
                    <Ellipse cx="76" cy="88" rx="2.5" ry="2" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="72" cy="85.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="75.5" cy="83.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="79" cy="84.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                  </G>

                  {/* 🐾 PAW 2: Right Hand Holding Bamboo Snack */}
                  <G id="rp-feast-paw-right">
                    <Path d="M 108 94 C 106 88, 94 84, 86 88 C 82 90, 82 95, 86 98 C 94 100, 102 102, 108 94 Z" fill="url(#rpDarkFur2)" />
                    <Ellipse cx="88" cy="90" rx="5" ry="4.2" fill="url(#rpDarkFur2)" transform="rotate(15 88 90)" />
                    <Ellipse cx="88" cy="90" rx="2.5" ry="2" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="85" cy="86.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="88.5" cy="85.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="92" cy="87.5" r="1.1" fill="#FEF08A" opacity={0.95} />
                  </G>
                </G>
              )}

              {/* Chewing Animated Mouth (when eating at 100%) */}
              {isMunchingStage ? (
                <G id="rp-chewing-mouth">
                  <Path d="M 76 69 Q 80 74 84 69" stroke="#1C1917" strokeWidth={2.4} strokeLinecap="round" fill="none" />
                </G>
              ) : mood === 'sleeping' ? null : null}
            </Svg>
          </View>

          {/* ======================================================== */}
          {/* LAYER 3: WAVING RIGHT ARM (PAW 2)                         */}
          {/* ======================================================== */}
          {isWavingMood && (
            <AnimatedView
              style={[
                styles.layerAbsolute,
                {
                  transform: [{ rotate: pawWaveRotate }],
                  transformOrigin: '61.25% 57.5%' as any,
                  zIndex: 8,
                },
              ]}
              pointerEvents="none"
            >
              <Svg width={mascotPixelSize} height={mascotPixelSize} viewBox="0 0 160 160">
                <Defs>
                  <LinearGradient id="rpDarkFurArm" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3F1D0B" />
                    <Stop offset="100%" stopColor="#240F05" />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M 96 92 C 102 96, 114 91, 115 80 C 116 73, 113 66, 109 63 C 104 62, 100 68, 99 76 C 98 83, 94 88, 96 92 Z"
                  fill="url(#rpDarkFurArm)"
                />
                <Ellipse cx="109" cy="64" rx="4.8" ry="3.8" fill="#FEF08A" opacity={0.95} />
                <Circle cx="104" cy="61" r="1.3" fill="#FEF08A" opacity={0.95} />
                <Circle cx="108" cy="58.5" r="1.3" fill="#FEF08A" opacity={0.95} />
                <Circle cx="112" cy="59.5" r="1.3" fill="#FEF08A" opacity={0.95} />
                <Circle cx="115.5" cy="62" r="1.3" fill="#FEF08A" opacity={0.95} />
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
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auraGlow: {
    position: 'absolute',
    zIndex: 0,
    opacity: 0.9,
  },
  layerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zzzContainer: {
    position: 'absolute',
    top: -24,
    right: -10,
    zIndex: 25,
    width: 60,
    height: 60,
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
    right: 124,
    top: 10,
    zIndex: 25,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    maxWidth: 180,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  speechText: {
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  speechArrow: {
    position: 'absolute',
    right: -6,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
