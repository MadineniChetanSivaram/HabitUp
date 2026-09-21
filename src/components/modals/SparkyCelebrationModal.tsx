import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
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
  Rect,
  Line,
} from 'react-native-svg';
import { useHabit } from '../../context/HabitContext';
import { soundService } from '../../services/soundService';
import { LottieAnimation } from '../common/LottieAnimation';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedView = Animated.View;

export const SparkyCelebrationModal: React.FC = () => {
  const {
    isCelebrationModalOpen,
    setIsCelebrationModalOpen,
    overallStats,
    user,
    soundEnabled,
    hapticsEnabled,
    equippedHat,
    equippedGlasses,
    t,
  } = useHabit();

  const streak = overallStats.plantStreak?.currentStreak ?? overallStats.currentBestStreak ?? 1;
  const userName = user?.name ? user.name.split(' ')[0] : 'Friend';
  const useNative = Platform.OS !== 'web';

  // =========================================================================
  // ANIMATION REFS
  // =========================================================================
  // Step 1: Backdrop & Bamboo Entrance
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const bambooShootAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.75)).current;

  // Step 2: Panda Climb from Bottom
  const pandaClimbAnim = useRef(new Animated.Value(360)).current;
  const pandaWobbleAnim = useRef(new Animated.Value(0)).current;
  const pawLeftAnim = useRef(new Animated.Value(0)).current;
  const pawRightAnim = useRef(new Animated.Value(0)).current;

  // Step 3: Sparky Wave & Speech Bubble
  const waveAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;

  // Step 4: Reward Cards & Continue Button
  const rewardCardSlideAnim = useRef(new Animated.Value(100)).current;
  const rewardCardOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonBounceAnim = useRef(new Animated.Value(0)).current;
  const sunburstRotateAnim = useRef(new Animated.Value(0)).current;

  const [hasReachedTop, setHasReachedTop] = useState(false);

  useEffect(() => {
    if (isCelebrationModalOpen) {
      setHasReachedTop(false);

      // 0. Reset all animation values
      backdropAnim.setValue(0);
      bambooShootAnim.setValue(SCREEN_HEIGHT * 0.75);
      pandaClimbAnim.setValue(360);
      pandaWobbleAnim.setValue(0);
      pawLeftAnim.setValue(0);
      pawRightAnim.setValue(0);
      waveAnim.setValue(0);
      tailAnim.setValue(0);
      speechBubbleAnim.setValue(0);
      rewardCardSlideAnim.setValue(100);
      rewardCardOpacityAnim.setValue(0);
      buttonBounceAnim.setValue(0);

      // Ambient sunburst rotation
      Animated.loop(
        Animated.timing(sunburstRotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: useNative,
        })
      ).start();

      // Continuous fluffy tail wag
      Animated.loop(
        Animated.sequence([
          Animated.timing(tailAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: useNative,
          }),
          Animated.timing(tailAnim, {
            toValue: -1,
            duration: 400,
            useNativeDriver: useNative,
          }),
        ])
      ).start();

      // -------------------------------------------------------------
      // PHASE 1: BAMBOO SHOOTS UP FIRST (0ms - 450ms)
      // -------------------------------------------------------------
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: useNative,
      }).start();

      if (soundEnabled) {
        soundService.playBambooSlideSound();
      }

      Animated.spring(bambooShootAnim, {
        toValue: 0,
        tension: 48,
        friction: 6.5,
        useNativeDriver: useNative,
      }).start(() => {
        // -----------------------------------------------------------
        // PHASE 2: PANDA CLIMBS UP THE BAMBOO (Starts after bamboo is up!)
        // -----------------------------------------------------------
        // Wobbly climbing motion
        const climbWobbleLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pandaWobbleAnim, {
              toValue: 1,
              duration: 160,
              useNativeDriver: useNative,
            }),
            Animated.timing(pandaWobbleAnim, {
              toValue: -1,
              duration: 160,
              useNativeDriver: useNative,
            }),
          ])
        );
        climbWobbleLoop.start();

        // Alternating paw steps
        const pawStepLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pawLeftAnim, {
              toValue: -12,
              duration: 160,
              useNativeDriver: useNative,
            }),
            Animated.timing(pawLeftAnim, {
              toValue: 0,
              duration: 160,
              useNativeDriver: useNative,
            }),
          ])
        );
        pawStepLoop.start();

        if (soundEnabled) {
          soundService.playMascotCuteSound('happy');
        }

        // Climb translation from bottom to target perched height
        Animated.timing(pandaClimbAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useNative,
        }).start(() => {
          climbWobbleLoop.stop();
          pawStepLoop.stop();
          pandaWobbleAnim.setValue(0);
          pawLeftAnim.setValue(0);
          setHasReachedTop(true);

          // ---------------------------------------------------------
          // PHASE 3: PANDA REACHES TOP, WAVES & SAYS HI! (Fanfare + Speech)
          // ---------------------------------------------------------
          if (soundEnabled) {
            soundService.playDuolingoCelebrationFanfare();
            setTimeout(() => {
              soundService.playMascotCuteSound('happy_bleat');
            }, 300);
          }

          if (hapticsEnabled) {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            } catch {}
          }

          // Enthusiastic hand waving loop
          Animated.loop(
            Animated.sequence([
              Animated.timing(waveAnim, {
                toValue: 1,
                duration: 260,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: useNative,
              }),
              Animated.timing(waveAnim, {
                toValue: -1,
                duration: 260,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: useNative,
              }),
            ])
          ).start();

          // Pop in speech bubble
          Animated.spring(speechBubbleAnim, {
            toValue: 1,
            tension: 65,
            friction: 5,
            useNativeDriver: useNative,
          }).start();

          // Slide in reward cards
          Animated.parallel([
            Animated.spring(rewardCardSlideAnim, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: useNative,
            }),
            Animated.timing(rewardCardOpacityAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: useNative,
            }),
          ]).start();

          // Pop in Continue Button
          Animated.spring(buttonBounceAnim, {
            toValue: 1,
            tension: 70,
            friction: 5.5,
            useNativeDriver: useNative,
          }).start();
        });
      });
    }
  }, [isCelebrationModalOpen]);

  const handleDismiss = () => {
    if (soundEnabled) {
      soundService.playClickSound();
    }
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }

    Animated.parallel([
      Animated.timing(pandaClimbAnim, {
        toValue: 400,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: useNative,
      }),
      Animated.timing(bambooShootAnim, {
        toValue: SCREEN_HEIGHT * 0.75,
        duration: 350,
        useNativeDriver: useNative,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      setIsCelebrationModalOpen(false);
    });
  };

  if (!isCelebrationModalOpen) return null;

  const sunburstRotate = sunburstRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const wobbleDeg = pandaWobbleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  const handWaveDeg = waveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-24deg', '24deg'],
  });

  const tailWagDeg = tailAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-14deg', '14deg'],
  });

  return (
    <Modal visible={isCelebrationModalOpen} transparent animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.container}>
        {/* Semi-transparent dark overlay */}
        <AnimatedView style={[styles.backdrop, { opacity: backdropAnim }]} />

        {/* Ambient Golden Sunburst Rotating Effect */}
        <AnimatedView
          style={[
            styles.sunburstContainer,
            {
              transform: [{ rotate: sunburstRotate }],
              opacity: backdropAnim,
            },
          ]}
        >
          <Svg width={SCREEN_WIDTH * 1.5} height={SCREEN_WIDTH * 1.5} viewBox="0 0 500 500">
            <Defs>
              <RadialGradient id="sunburstGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
                <Stop offset="50%" stopColor="#10B981" stopOpacity="0.14" />
                <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="250" cy="250" r="240" fill="url(#sunburstGlow)" />
          </Svg>
        </AnimatedView>

        {/* Main Interactive Celebration Body */}
        <View style={styles.celebrationContent}>
          {/* ========================================================= */}
          {/* 1. DUOLINGO SPEECH BUBBLE (Tells Hi & Congratulations!)   */}
          {/* ========================================================= */}
          <AnimatedView
            style={[
              styles.speechBubbleWrapper,
              {
                transform: [{ scale: speechBubbleAnim }],
                opacity: speechBubbleAnim,
              },
            ]}
          >
            <View style={styles.speechBubble}>
              <Text style={styles.speechGreeting}>Hi {userName}! 👋 🐼</Text>
              <Text style={styles.speechTitle}>UNSTOPPABLE! 100% COMPLETE 🔥</Text>
              <Text style={styles.speechBody}>
                You crushed every habit today! Time to celebrate on the bamboo! 🎋
              </Text>
            </View>
            <View style={styles.bubbleTail} />
          </AnimatedView>

          {/* ========================================================= */}
          {/* 2. THE STAGE: BAMBOO STALK + CLIMBING SPARKY PANDA       */}
          {/* ========================================================= */}
          <View style={styles.stageWrapper}>
            {/* LAYER A: THE TALL BAMBOO STALK (Shoots Up FIRST!) */}
            <AnimatedView
              style={[
                styles.bambooStalkWrapper,
                {
                  transform: [{ translateY: bambooShootAnim }],
                },
              ]}
            >
              <Svg width={200} height={340} viewBox="0 0 200 340">
                <Defs>
                  <LinearGradient id="bambooStalkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#047857" />
                    <Stop offset="30%" stopColor="#10B981" />
                    <Stop offset="65%" stopColor="#34D399" />
                    <Stop offset="100%" stopColor="#065F46" />
                  </LinearGradient>
                  <LinearGradient id="bambooNodeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#064E3B" />
                    <Stop offset="50%" stopColor="#6EE7B7" />
                    <Stop offset="100%" stopColor="#064E3B" />
                  </LinearGradient>
                  <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#6EE7B7" />
                    <Stop offset="60%" stopColor="#10B981" />
                    <Stop offset="100%" stopColor="#047857" />
                  </LinearGradient>
                </Defs>

                {/* Stalk Segment 1 (Bottom) */}
                <Rect x="88" y="240" width="24" height="100" rx="4" fill="url(#bambooStalkGrad)" />
                <Rect x="84" y="240" width="32" height="6" rx="3" fill="url(#bambooNodeGrad)" />

                {/* Stalk Segment 2 (Middle) */}
                <Rect x="88" y="140" width="24" height="100" rx="4" fill="url(#bambooStalkGrad)" />
                <Rect x="84" y="140" width="32" height="6" rx="3" fill="url(#bambooNodeGrad)" />

                {/* Stalk Segment 3 (Upper) */}
                <Rect x="89" y="40" width="22" height="100" rx="4" fill="url(#bambooStalkGrad)" />
                <Rect x="85" y="40" width="30" height="6" rx="3" fill="url(#bambooNodeGrad)" />

                {/* Stalk Segment 4 (Top Shoot) */}
                <Rect x="90" y="0" width="20" height="40" rx="3" fill="url(#bambooStalkGrad)" />

                {/* Lush Bamboo Leaves sprouting along the stalk */}
                {/* Left side branches */}
                <Path d="M88,50 Q45,30 20,55 Q55,70 88,56 Z" fill="url(#leafGrad)" />
                <Path d="M88,48 Q35,20 10,40 Q45,55 88,52 Z" fill="url(#leafGrad)" />
                <Path d="M88,150 Q40,135 15,160 Q55,175 88,158 Z" fill="url(#leafGrad)" />

                {/* Right side branches */}
                <Path d="M112,90 Q155,70 185,95 Q150,110 112,98 Z" fill="url(#leafGrad)" />
                <Path d="M112,88 Q165,60 195,80 Q160,95 112,92 Z" fill="url(#leafGrad)" />
                <Path d="M112,200 Q160,185 190,210 Q150,225 112,208 Z" fill="url(#leafGrad)" />
              </Svg>
            </AnimatedView>

            {/* LAYER B: SPARKY THE PANDA (Climbs up the bamboo stalk!) */}
            <AnimatedView
              style={[
                styles.pandaClimberWrapper,
                {
                  transform: [
                    { translateY: pandaClimbAnim },
                    { rotate: wobbleDeg },
                  ],
                },
              ]}
            >
              <Svg width={180} height={180} viewBox="0 0 160 160">
                <Defs>
                  <RadialGradient id="rpFurGradFull" cx="50%" cy="35%" r="65%">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="60%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#C2410C" />
                  </RadialGradient>
                  <LinearGradient id="rpDarkFurFull" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3F1D0B" />
                    <Stop offset="100%" stopColor="#240F05" />
                  </LinearGradient>
                  <LinearGradient id="goldCrownFull" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="60%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </LinearGradient>
                </Defs>

                {/* 1. Fluffy Striped Red Panda Tail attached smoothly to body */}
                <G transform="translate(10, 0)">
                  <Path
                    d="M 94 104 C 122 114, 150 100, 146 72 C 142 50, 120 54, 108 76 Z"
                    fill="url(#rpFurGradFull)"
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
                </G>

                {/* 2. Teddy Bear Ears */}
                <G id="rp-ears-climbing">
                  {/* Left Ear */}
                  <Path d="M 36 48 C 26 28, 40 16, 56 28 C 60 34, 56 44, 48 50 Z" fill="url(#rpFurGradFull)" />
                  <Path d="M 38 46 C 30 32, 42 24, 52 32 Z" fill="#FFFFFF" />

                  {/* Right Ear */}
                  <Path d="M 124 48 C 134 28, 120 16, 104 28 C 100 34, 104 44, 112 50 Z" fill="url(#rpFurGradFull)" />
                  <Path d="M 122 46 C 130 32, 118 24, 108 32 Z" fill="#FFFFFF" />
                </G>

                {/* 3. Equipped Hats */}
                {equippedHat === 'hat-crown' && (
                  <G transform="translate(56, 12)">
                    <Path d="M0,18 L10,6 L24,16 L38,6 L48,18 Z" fill="url(#goldCrownFull)" />
                    <Circle cx="10" cy="6" r="2.5" fill="#EF4444" />
                    <Circle cx="24" cy="16" r="2.5" fill="#3B82F6" />
                    <Circle cx="38" cy="6" r="2.5" fill="#10B981" />
                  </G>
                )}
                {equippedHat === 'hat-grad' && (
                  <G transform="translate(54, 14)">
                    <Path d="M0,14 L26,4 L52,14 L26,24 Z" fill="#1E293B" />
                    <Rect x="19" y="20" width="14" height="8" fill="#0F172A" rx="2" />
                    <Path d="M44,16 L50,26" stroke="#F59E0B" strokeWidth={2.5} />
                    <Circle cx="50" cy="27" r="2" fill="#F59E0B" />
                  </G>
                )}
                {equippedHat === 'hat-top' && (
                  <G transform="translate(58, 2)">
                    <Rect x="8" y="0" width="28" height="24" rx="3" fill="#0F172A" />
                    <Rect x="8" y="16" width="28" height="5" fill="#DC2626" />
                    <Ellipse cx="22" cy="24" rx="24" ry="5" fill="#0F172A" />
                  </G>
                )}

                {/* 4. Chubby Body & Belly */}
                <Ellipse cx="80" cy="98" rx="34" ry="26" fill="url(#rpFurGradFull)" />
                <Ellipse cx="80" cy="103" rx="21" ry="15" fill="url(#rpDarkFurFull)" />
                <Path d="M 72 86 Q 80 93 88 86 Q 80 90 72 86 Z" fill="#FFFFFF" opacity={0.9} />

                {/* 5. Bottom Hind Climbing Feet */}
                <Ellipse cx="48" cy="122" rx="11" ry="8" fill="url(#rpDarkFurFull)" transform="rotate(-10 48 122)" />
                <Ellipse cx="48" cy="122" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(-10 48 122)" />
                <Circle cx="41" cy="118" r="1.6" fill="#FEF08A" opacity={0.95} />
                <Circle cx="46" cy="115" r="1.6" fill="#FEF08A" opacity={0.95} />
                <Circle cx="52" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />

                <Ellipse cx="112" cy="122" rx="11" ry="8" fill="url(#rpDarkFurFull)" transform="rotate(10 112 122)" />
                <Ellipse cx="112" cy="122" rx="4.5" ry="3.5" fill="#FEF08A" opacity={0.95} transform="rotate(10 112 122)" />
                <Circle cx="108" cy="116" r="1.6" fill="#FEF08A" opacity={0.95} />
                <Circle cx="114" cy="115" r="1.6" fill="#FEF08A" opacity={0.95} />
                <Circle cx="119" cy="118" r="1.6" fill="#FEF08A" opacity={0.95} />

                {/* 6. Front Left Paw (Grasps bamboo firmly) */}
                <Ellipse cx="54" cy="95" rx="8" ry="7" fill="url(#rpDarkFurFull)" transform="rotate(-15 54 95)" />
                <Ellipse cx="54" cy="95" rx="3.2" ry="2.4" fill="#FEF08A" opacity={0.9} />

                {/* 7. Front Right Paw (Waving Hi when at top, or climbing when rising!) */}
                <G transform={hasReachedTop ? "translate(106, 75)" : "translate(104, 94)"}>
                  <Ellipse cx="0" cy="0" rx="8" ry="7" fill="url(#rpDarkFurFull)" transform={hasReachedTop ? "rotate(-25 0 0)" : "rotate(15 0 0)"} />
                  <Ellipse cx="0" cy="0" rx="3.2" ry="2.4" fill="#FEF08A" opacity={0.9} />
                </G>

                {/* 8. Round Chubby Head & Markings */}
                <Ellipse cx="80" cy="60" rx="36" ry="29" fill="url(#rpFurGradFull)" />
                <Ellipse cx="80" cy="67" rx="15" ry="11" fill="#FFFFFF" />
                <Circle cx="63" cy="47" r="4.2" fill="#FFFFFF" />
                <Circle cx="97" cy="47" r="4.2" fill="#FFFFFF" />
                <Path d="M 48 62 C 45 70, 52 75, 57 71 C 55 65, 51 62, 48 62 Z" fill="#FFFFFF" />
                <Path d="M 112 62 C 115 70, 108 75, 103 71 C 105 65, 109 62, 112 62 Z" fill="#FFFFFF" />

                {/* Cute Button Nose */}
                <Path d="M 76 63 Q 80 61 84 63 Q 80 68 76 63 Z" fill="#1C1917" />
                <Circle cx="78.5" cy="63.5" r="0.7" fill="#FFFFFF" />

                {/* Big Happy Starry Celebration Eyes */}
                <G>
                  <Circle cx="64" cy="56" r="6" fill="#1C1917" />
                  <Circle cx="62.5" cy="53.5" r="2.4" fill="#FFFFFF" />
                  <Circle cx="66" cy="58" r="1.1" fill="#93C5FD" />

                  <Circle cx="96" cy="56" r="6" fill="#1C1917" />
                  <Circle cx="94.5" cy="53.5" r="2.4" fill="#FFFFFF" />
                  <Circle cx="98" cy="58" r="1.1" fill="#93C5FD" />
                </G>

                {/* Rosy Cheeks */}
                <Ellipse cx="52" cy="65" rx="5" ry="3.5" fill="#FB7185" opacity={0.65} />
                <Ellipse cx="108" cy="65" rx="5" ry="3.5" fill="#FB7185" opacity={0.65} />

                {/* Big Cheerful Smile */}
                <Path d="M 74 69 Q 80 77 86 69 Z" fill="#E11D48" />
                <Path d="M 76 73 Q 80 77 84 73 Z" fill="#FB7185" />

                {/* Equipped Glasses */}
                {equippedGlasses === 'glass-sunglasses' && (
                  <G transform="translate(54, 48)">
                    <Rect x="0" y="0" width="22" height="13" rx="4" fill="#0F172A" />
                    <Rect x="30" y="0" width="22" height="13" rx="4" fill="#0F172A" />
                    <Line x1="22" y1="5" x2="30" y2="5" stroke="#0F172A" strokeWidth={2.5} />
                  </G>
                )}
                {equippedGlasses === 'glass-geek' && (
                  <G transform="translate(52, 46)">
                    <Circle cx="12" cy="10" r="10" fill="none" stroke="#0284C7" strokeWidth={2.5} />
                    <Circle cx="44" cy="10" r="10" fill="none" stroke="#0284C7" strokeWidth={2.5} />
                    <Line x1="22" y1="10" x2="34" y2="10" stroke="#0284C7" strokeWidth={2.5} />
                  </G>
                )}
              </Svg>
            </AnimatedView>
          </View>

          {/* ========================================================= */}
          {/* 3. REWARD & STREAK CARDS                                 */}
          {/* ========================================================= */}
          <AnimatedView
            style={[
              styles.rewardCardsContainer,
              {
                opacity: rewardCardOpacityAnim,
                transform: [{ translateY: rewardCardSlideAnim }],
              },
            ]}
          >
            {/* Streak Flame Card */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.16)' }]}>
                <LottieAnimation source="streakFlame" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardLabel}>DAILY STREAK</Text>
                <Text style={styles.rewardValue}>{streak} Days Extended! 🔥</Text>
              </View>
            </View>

            {/* Bamboo Coins Bonus */}
            <View style={styles.rewardCard}>
              <View style={[styles.rewardIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.16)' }]}>
                <Text style={{ fontSize: 20 }}>🎋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardLabel}>REWARD EARNED</Text>
                <Text style={[styles.rewardValue, { color: '#10B981' }]}>+25 Bamboo Coins</Text>
              </View>
            </View>
          </AnimatedView>

          {/* ========================================================= */}
          {/* 4. DUOLINGO 3D TACTILE GREEN CONTINUE BUTTON             */}
          {/* ========================================================= */}
          <AnimatedView
            style={[
              styles.buttonWrapper,
              {
                transform: [{ scale: buttonBounceAnim }],
                opacity: buttonBounceAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>
                {t('common.continue', 'AWESOME! CONTINUE')} 🚀
              </Text>
            </TouchableOpacity>
          </AnimatedView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 11, 22, 0.88)',
  },
  sunburstContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationContent: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 26,
  },
  speechBubbleWrapper: {
    alignItems: 'center',
    marginBottom: -16,
    zIndex: 20,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: '#7C5CFF',
  },
  speechGreeting: {
    color: '#7C5CFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  speechTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  speechBody: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 17,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    alignSelf: 'center',
    marginTop: -1,
  },
  stageWrapper: {
    width: 240,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    marginVertical: 4,
  },
  bambooStalkWrapper: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pandaClimberWrapper: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rewardCardsContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 10,
  },
  rewardCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  rewardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rewardValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 4,
  },
  continueBtn: {
    backgroundColor: '#10B981',
    borderBottomWidth: 5,
    borderBottomColor: '#059669',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
