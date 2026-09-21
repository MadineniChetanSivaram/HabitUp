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

  // Step 2: Panda Holding Bamboo & 3-Step Scamper Climbing
  const pandaYAnim = useRef(new Animated.Value(340)).current;
  const pandaScaleYAnim = useRef(new Animated.Value(1)).current;
  const pandaScaleXAnim = useRef(new Animated.Value(1)).current;
  const pandaTiltAnim = useRef(new Animated.Value(0)).current;
  const pawClimbAnim = useRef(new Animated.Value(0)).current;

  // Step 3: Sparky Perched Celebration, Waving & Speech Bubble
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
      pandaYAnim.setValue(340);
      pandaScaleYAnim.setValue(1);
      pandaScaleXAnim.setValue(1);
      pandaTiltAnim.setValue(0);
      pawClimbAnim.setValue(0);
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
          duration: 22000,
          easing: Easing.linear,
          useNativeDriver: useNative,
        })
      ).start();

      // Continuous energetic tail wagging
      Animated.loop(
        Animated.sequence([
          Animated.timing(tailAnim, {
            toValue: 1,
            duration: 360,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(tailAnim, {
            toValue: -1,
            duration: 360,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ])
      ).start();

      // -------------------------------------------------------------
      // PHASE 1: BAMBOO SHOOTS UP FIRST (0ms - 400ms)
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
        tension: 50,
        friction: 6.5,
        useNativeDriver: useNative,
      }).start(() => {
        // -----------------------------------------------------------
        // PHASE 2: PANDA HOLDS THE BAMBOO & CLIMBS UP IN 3 SCAMPER HOPS
        // -----------------------------------------------------------
        if (soundEnabled) {
          soundService.playMascotCuteSound('happy');
        }

        // Alternating paw reach while climbing
        const pawLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pawClimbAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: useNative,
            }),
            Animated.timing(pawClimbAnim, {
              toValue: -1,
              duration: 180,
              useNativeDriver: useNative,
            }),
          ])
        );
        pawLoop.start();

        // 3-Step Scamper Climbing Sequence with Real Tree-Hugging Physics
        Animated.sequence([
          // === HOP 1: Bottom to Lower Stalk (340 -> 220) ===
          Animated.parallel([
            Animated.sequence([
              // Windup / Crouch squash
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 0.84,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.16,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
              ]),
              // Spring upward stretch along bamboo
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 1.18,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 0.86,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: -1,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
              ]),
              // Grip land on lower node
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 0.92,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.08,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: 0,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
              ]),
              // Settle
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 1.0,
                  duration: 60,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.0,
                  duration: 60,
                  useNativeDriver: useNative,
                }),
              ]),
            ]),
            Animated.timing(pandaYAnim, {
              toValue: 220,
              duration: 390,
              easing: Easing.out(Easing.quad),
              useNativeDriver: useNative,
            }),
          ]),

          // === HOP 2: Lower Stalk to Upper Stalk (220 -> 100) ===
          Animated.parallel([
            Animated.sequence([
              // Windup / Crouch squash
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 0.85,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.15,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
              ]),
              // Spring upward stretch along bamboo
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 1.18,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 0.86,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: 1,
                  duration: 160,
                  useNativeDriver: useNative,
                }),
              ]),
              // Grip land on upper node
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 0.92,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.08,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: 0,
                  duration: 90,
                  useNativeDriver: useNative,
                }),
              ]),
              // Settle
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 1.0,
                  duration: 60,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.0,
                  duration: 60,
                  useNativeDriver: useNative,
                }),
              ]),
            ]),
            Animated.timing(pandaYAnim, {
              toValue: 100,
              duration: 390,
              easing: Easing.out(Easing.quad),
              useNativeDriver: useNative,
            }),
          ]),

          // === HOP 3: Final Scramble to Perch Top (100 -> 0) ===
          Animated.parallel([
            Animated.sequence([
              // Windup
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 0.84,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 1.16,
                  duration: 80,
                  useNativeDriver: useNative,
                }),
              ]),
              // Big victory leap
              Animated.parallel([
                Animated.timing(pandaScaleYAnim, {
                  toValue: 1.2,
                  duration: 170,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaScaleXAnim, {
                  toValue: 0.85,
                  duration: 170,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: -1,
                  duration: 170,
                  useNativeDriver: useNative,
                }),
              ]),
              // Bouncy settle onto the perch
              Animated.parallel([
                Animated.spring(pandaScaleYAnim, {
                  toValue: 1.0,
                  tension: 70,
                  friction: 5,
                  useNativeDriver: useNative,
                }),
                Animated.spring(pandaScaleXAnim, {
                  toValue: 1.0,
                  tension: 70,
                  friction: 5,
                  useNativeDriver: useNative,
                }),
                Animated.timing(pandaTiltAnim, {
                  toValue: 0,
                  duration: 120,
                  useNativeDriver: useNative,
                }),
              ]),
            ]),
            Animated.sequence([
              Animated.timing(pandaYAnim, {
                toValue: -10,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: useNative,
              }),
              Animated.spring(pandaYAnim, {
                toValue: 0,
                tension: 65,
                friction: 6,
                useNativeDriver: useNative,
              }),
            ]),
          ]),
        ]).start(() => {
          pawLoop.stop();
          pawClimbAnim.setValue(0);
          setHasReachedTop(true);

          // ---------------------------------------------------------
          // PHASE 3: PERCHED AT TOP, SPARKY WAVES & CELEBRATES!
          // ---------------------------------------------------------
          if (soundEnabled) {
            soundService.playDuolingoCelebrationFanfare();
            setTimeout(() => {
              soundService.playMascotCuteSound('happy_bleat');
            }, 280);
          }

          if (hapticsEnabled) {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            } catch {}
          }

          // Enthusiastic Hand Waving loop
          Animated.loop(
            Animated.sequence([
              Animated.timing(waveAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: useNative,
              }),
              Animated.timing(waveAnim, {
                toValue: -1,
                duration: 250,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: useNative,
              }),
            ])
          ).start();

          // Pop in Speech Bubble with bouncy spring
          Animated.spring(speechBubbleAnim, {
            toValue: 1,
            tension: 65,
            friction: 5,
            useNativeDriver: useNative,
          }).start();

          // Slide in Reward Cards
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

          // Pop in 3D tactile Continue Button
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
      Animated.timing(pandaYAnim, {
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

  const tiltDeg = pandaTiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const handWaveDeg = waveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-22deg', '22deg'],
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

        {/* Main Interactive Celebration Content */}
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
          {/* 2. THE STAGE: BAMBOO STALK + RED PANDA HOLDING & CLIMBING */}
          {/* ========================================================= */}
          <View style={styles.stageWrapper}>
            {/* LAYER A: TALL BAMBOO STALK (Shoots Up FIRST!) */}
            <AnimatedView
              style={[
                styles.bambooStalkWrapper,
                {
                  transform: [{ translateY: bambooShootAnim }],
                },
              ]}
            >
              <Svg width={220} height={340} viewBox="0 0 220 340">
                <Defs>
                  <LinearGradient id="bambooCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#047857" />
                    <Stop offset="25%" stopColor="#10B981" />
                    <Stop offset="55%" stopColor="#34D399" />
                    <Stop offset="80%" stopColor="#10B981" />
                    <Stop offset="100%" stopColor="#064E3B" />
                  </LinearGradient>
                  <LinearGradient id="bambooNodeRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#064E3B" />
                    <Stop offset="45%" stopColor="#6EE7B7" />
                    <Stop offset="100%" stopColor="#022C22" />
                  </LinearGradient>
                  <LinearGradient id="bambooLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#6EE7B7" />
                    <Stop offset="60%" stopColor="#10B981" />
                    <Stop offset="100%" stopColor="#047857" />
                  </LinearGradient>
                </Defs>

                {/* Stalk Segment 1 (Bottom) */}
                <Rect x="75" y="230" width="28" height="110" rx="4" fill="url(#bambooCylinderGrad)" />
                <Rect x="70" y="230" width="38" height="7" rx="3.5" fill="url(#bambooNodeRingGrad)" />

                {/* Stalk Segment 2 (Middle) */}
                <Rect x="75" y="130" width="28" height="100" rx="4" fill="url(#bambooCylinderGrad)" />
                <Rect x="70" y="130" width="38" height="7" rx="3.5" fill="url(#bambooNodeRingGrad)" />

                {/* Stalk Segment 3 (Upper Perch Node) */}
                <Rect x="76" y="35" width="26" height="95" rx="4" fill="url(#bambooCylinderGrad)" />
                <Rect x="71" y="35" width="36" height="7" rx="3.5" fill="url(#bambooNodeRingGrad)" />

                {/* Stalk Segment 4 (Top Shoot Tip) */}
                <Rect x="77" y="0" width="24" height="35" rx="3" fill="url(#bambooCylinderGrad)" />

                {/* Lush Bamboo Leaves sprouting along the stalk */}
                {/* Left side branches */}
                <Path d="M75,45 Q35,25 5,50 Q45,66 75,52 Z" fill="url(#bambooLeafGrad)" />
                <Path d="M75,43 Q25,15 0,35 Q35,50 75,47 Z" fill="url(#bambooLeafGrad)" />
                <Path d="M75,135 Q30,120 5,145 Q45,160 75,142 Z" fill="url(#bambooLeafGrad)" />

                {/* Right side branches */}
                <Path d="M103,80 Q145,60 175,85 Q140,100 103,88 Z" fill="url(#bambooLeafGrad)" />
                <Path d="M103,170 Q150,155 180,180 Q140,195 103,178 Z" fill="url(#bambooLeafGrad)" />
              </Svg>
            </AnimatedView>

            {/* LAYER B: RED PANDA SPARKY (Holding the bamboo tree & climbing up!) */}
            <AnimatedView
              style={[
                styles.pandaClimberWrapper,
                {
                  transform: [
                    { translateY: pandaYAnim },
                    { scaleY: pandaScaleYAnim },
                    { scaleX: pandaScaleXAnim },
                    { rotate: tiltDeg },
                  ],
                },
              ]}
            >
              <Svg width={220} height={190} viewBox="0 0 220 190">
                <Defs>
                  {/* Warm Red Panda Fur Radial Gradient */}
                  <RadialGradient id="rpFurGradClimb" cx="50%" cy="35%" r="65%">
                    <Stop offset="0%" stopColor="#FB923C" />
                    <Stop offset="55%" stopColor="#EA580C" />
                    <Stop offset="100%" stopColor="#C2410C" />
                  </RadialGradient>
                  {/* Dark Chocolate Fur Gradient */}
                  <LinearGradient id="rpDarkFurClimb" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#451A03" />
                    <Stop offset="100%" stopColor="#1C0D05" />
                  </LinearGradient>
                  {/* Gold Crown Gradient */}
                  <LinearGradient id="goldCrownClimb" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FDE047" />
                    <Stop offset="60%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#D97706" />
                  </LinearGradient>
                </Defs>

                {/* ------------------------------------------------------------- */}
                {/* 1. FLUFFY STRIPED TAIL (Trails dynamically behind body)      */}
                {/* ------------------------------------------------------------- */}
                <G transform="translate(10, 0)">
                  <Path
                    d="M 142 110 C 176 120, 208 102, 202 72 C 196 48, 170 52, 156 76 Z"
                    fill="url(#rpFurGradClimb)"
                  />
                  {/* Cream tip */}
                  <Path
                    d="M 202 72 C 200 52, 182 50, 174 62 C 188 68, 198 76, 202 72 Z"
                    fill="#FEF3C7"
                  />
                  {/* Dark stripe 1 */}
                  <Path
                    d="M 193 80 C 182 77, 172 80, 166 88 C 174 92, 185 90, 193 80 Z"
                    fill="#240F05"
                    opacity={0.85}
                  />
                  {/* Dark stripe 2 */}
                  <Path
                    d="M 180 92 C 170 90, 162 93, 158 100 C 164 103, 173 101, 180 92 Z"
                    fill="#240F05"
                    opacity={0.85}
                  />
                </G>

                {/* ------------------------------------------------------------- */}
                {/* 2. BACK LIMBS REACHING AROUND BAMBOO (Behind stalk)          */}
                {/* ------------------------------------------------------------- */}
                {/* Left Hind Leg reaching around bamboo from behind */}
                <Path
                  d="M 112 116 C 96 116, 76 122, 68 128 C 62 134, 72 142, 88 138 C 104 134, 116 126, 120 118 Z"
                  fill="url(#rpDarkFurClimb)"
                />
                {/* Left Front Arm reaching around bamboo from behind */}
                <Path
                  d="M 108 84 C 92 82, 74 80, 66 82 C 58 86, 64 96, 78 94 C 92 92, 106 88, 112 85 Z"
                  fill="url(#rpDarkFurClimb)"
                />

                {/* ------------------------------------------------------------- */}
                {/* 3. CHUBBY TORSO & BELLY (Hugs against the bamboo cylinder)   */}
                {/* ------------------------------------------------------------- */}
                <Ellipse cx="120" cy="106" rx="34" ry="26" fill="url(#rpFurGradClimb)" />
                {/* Dark Chocolate underbelly patch */}
                <Ellipse cx="120" cy="110" rx="20" ry="16" fill="url(#rpDarkFurClimb)" />
                {/* White fluffy chest collar */}
                <Path d="M 110 92 Q 120 100 130 92 Q 120 96 110 92 Z" fill="#FFFFFF" opacity={0.95} />

                {/* ------------------------------------------------------------- */}
                {/* 4. FRONT CLAWS & PAWS CLASPING THE BAMBOO STALK (In Front!)  */}
                {/* ------------------------------------------------------------- */}
                {/* Left Front Paw: Visibly WRAPS around the front of the bamboo stalk! */}
                <G id="paw-front-left">
                  <Ellipse cx="68" cy="85" rx="8" ry="7" fill="url(#rpDarkFurClimb)" transform="rotate(20 68 85)" />
                  <Ellipse cx="68" cy="85" rx="3.5" ry="2.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="63" cy="81" r="1.5" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="67" cy="78" r="1.5" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="73" cy="79" r="1.5" fill="#FEF08A" opacity={0.95} />
                </G>

                {/* Left Hind Foot: Visibly CLAMPS around the front-left of bamboo! */}
                <G id="paw-hind-left">
                  <Ellipse cx="70" cy="130" rx="9" ry="7" fill="url(#rpDarkFurClimb)" transform="rotate(25 70 130)" />
                  <Ellipse cx="70" cy="130" rx="4.2" ry="3" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="64" cy="126" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="69" cy="123" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="75" cy="124" r="1.6" fill="#FEF08A" opacity={0.95} />
                </G>

                {/* Right Hind Foot: Visibly CLAMPS against the right side of bamboo! */}
                <G id="paw-hind-right">
                  <Path
                    d="M 126 116 C 138 118, 142 128, 134 136 C 122 138, 108 132, 100 126 Z"
                    fill="url(#rpDarkFurClimb)"
                  />
                  <Ellipse cx="98" cy="126" rx="9" ry="7" fill="url(#rpDarkFurClimb)" transform="rotate(-20 98 126)" />
                  <Ellipse cx="98" cy="126" rx="4.2" ry="3" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="94" cy="121" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="99" cy="120" r="1.6" fill="#FEF08A" opacity={0.95} />
                  <Circle cx="104" cy="122" r="1.6" fill="#FEF08A" opacity={0.95} />
                </G>

                {/* Right Front Arm & Paw: Climbing Grip OR Victory Waving Hand! */}
                {hasReachedTop ? (
                  /* Perched at Top: Waving enthusiastically to the user! */
                  <G id="front-arm-right-waving">
                    {/* Upper arm raised high */}
                    <Path
                      d="M 128 78 C 142 66, 154 50, 162 36 C 170 42, 162 58, 146 80 Z"
                      fill="url(#rpDarkFurClimb)"
                    />
                    {/* Waving Paw Hand */}
                    <G transform="translate(164, 34)">
                      <Ellipse cx="0" cy="0" rx="9.5" ry="8" fill="url(#rpDarkFurClimb)" transform="rotate(-20 0 0)" />
                      <Ellipse cx="0" cy="0" rx="4.2" ry="3.2" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="-5" cy="-5" r="1.7" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="0" cy="-7" r="1.7" fill="#FEF08A" opacity={0.95} />
                      <Circle cx="5" cy="-5" r="1.7" fill="#FEF08A" opacity={0.95} />
                    </G>
                  </G>
                ) : (
                  /* Climbing: Right paw firmly gripping the front of the bamboo trunk! */
                  <G id="front-arm-right-climbing">
                    <Path
                      d="M 126 84 C 114 80, 98 76, 90 74 C 82 74, 84 84, 96 88 C 108 92, 122 90, 128 86 Z"
                      fill="url(#rpDarkFurClimb)"
                    />
                    <Ellipse cx="88" cy="74" rx="8" ry="7" fill="url(#rpDarkFurClimb)" transform="rotate(-15 88 74)" />
                    <Ellipse cx="88" cy="74" rx="3.5" ry="2.6" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="84" cy="70" r="1.5" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="88" cy="68" r="1.5" fill="#FEF08A" opacity={0.95} />
                    <Circle cx="93" cy="70" r="1.5" fill="#FEF08A" opacity={0.95} />
                  </G>
                )}

                {/* ------------------------------------------------------------- */}
                {/* 5. ROUND CHUBBY HEAD, EARS, FACE & EXPRESSIONS               */}
                {/* ------------------------------------------------------------- */}
                {/* Rounded Ears */}
                <G id="rp-ears-group">
                  {/* Left Ear */}
                  <Path d="M 88 38 C 76 18, 90 6, 108 18 C 112 24, 108 34, 100 40 Z" fill="url(#rpFurGradClimb)" />
                  <Path d="M 90 36 C 82 22, 94 14, 104 22 Z" fill="#FFFFFF" />

                  {/* Right Ear */}
                  <Path d="M 152 38 C 164 18, 150 6, 132 18 C 128 24, 132 34, 140 40 Z" fill="url(#rpFurGradClimb)" />
                  <Path d="M 150 36 C 158 22, 146 14, 136 22 Z" fill="#FFFFFF" />
                </G>

                {/* Equipped Hats & Headgear */}
                {equippedHat === 'crown' && (
                  <G transform="translate(96, 4)">
                    <Path d="M0,20 L10,6 L24,18 L38,6 L48,20 Z" fill="url(#goldCrownClimb)" stroke="#B45309" strokeWidth={1} />
                    <Circle cx="10" cy="6" r="2.5" fill="#EF4444" />
                    <Circle cx="24" cy="18" r="2.5" fill="#3B82F6" />
                    <Circle cx="38" cy="6" r="2.5" fill="#10B981" />
                  </G>
                )}
                {equippedHat === 'wizard' && (
                  <G transform="translate(94, -4)">
                    <Path d="M 0,38 C 11,22, 18,6, 28,2 C 34,8, 38,22, 52,38 Z" fill="#312E81" stroke="#4338CA" strokeWidth={1} />
                    <Ellipse cx="26" cy="38" rx="28" ry="6" fill="#1E1B4B" />
                    <Path d="M 22,20 L 23.5,23 L 27,23.5 L 24.5,26 L 25,29 L 22,27.5 L 19,29 L 19.5,26 L 17,23.5 L 20.5,23 Z" fill="#FDE047" />
                  </G>
                )}
                {equippedHat === 'chef' && (
                  <G transform="translate(96, 2)">
                    <Path d="M 4,30 C -2,18, 8,6, 16,8 C 20,2, 32,2, 36,8 C 44,6, 54,18, 48,30 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1} />
                    <Rect x="4" y="28" width="44" height="7" rx="2" fill="#E2E8F0" />
                  </G>
                )}
                {equippedHat === 'santa' && (
                  <G transform="translate(92, 6)">
                    <Path d="M 4,28 C 8,12, 24,2, 44,4 C 54,8, 58,16, 64,24 Z" fill="#DC2626" />
                    <Circle cx="66" cy="26" r="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
                    <Rect x="0" y="24" width="58" height="9" rx="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
                  </G>
                )}
                {equippedHat === 'detective' && (
                  <G transform="translate(92, 10)">
                    <Path d="M 6,22 C 4,6, 16,0, 34,0 C 52,0, 64,6, 62,22 Z" fill="#78350F" />
                    <Path d="M 0,22 Q 34,30 68,22 Q 34,18 0,22 Z" fill="#451A03" />
                  </G>
                )}
                {equippedHat === 'party_hat' && (
                  <G transform="translate(104, 0)">
                    <Path d="M 0,30 L 16,4 L 32,30 Z" fill="#F43F5E" />
                    <Path d="M 4,24 L 16,4 L 28,24 Z" fill="#F59E0B" />
                    <Circle cx="16" cy="3" r="3.5" fill="#FDE047" />
                  </G>
                )}
                {equippedHat === 'beanie' && (
                  <G transform="translate(92, 8)">
                    <Path d="M 6,24 C 4,8, 16,0, 34,0 C 52,0, 64,8, 62,24 Z" fill="#0D9488" />
                    <Rect x="2" y="18" width="64" height="9" rx="3" fill="#115E59" />
                    <Circle cx="34" cy="-2" r="4.5" fill="#F59E0B" />
                  </G>
                )}

                {/* Head Base & Muzzle */}
                <Ellipse cx="120" cy="54" rx="36" ry="29" fill="url(#rpFurGradClimb)" />
                <Ellipse cx="120" cy="62" rx="15" ry="11" fill="#FFFFFF" />

                {/* White Eyebrow Spots */}
                <Circle cx="104" cy="42" r="4.2" fill="#FFFFFF" />
                <Circle cx="136" cy="42" r="4.2" fill="#FFFFFF" />

                {/* Fluffy White Cheek Tuft Markings */}
                <Path d="M 88 56 C 84 66, 92 72, 98 67 C 96 60, 91 56, 88 56 Z" fill="#FFFFFF" />
                <Path d="M 152 56 C 156 66, 148 72, 142 67 C 144 60, 149 56, 152 56 Z" fill="#FFFFFF" />

                {/* Cute Button Nose */}
                <Path d="M 116 58 Q 120 56 124 58 Q 120 63 116 58 Z" fill="#1C1917" />
                <Circle cx="118.5" cy="58.5" r="0.7" fill="#FFFFFF" />

                {/* Sparkling Starry Celebration Eyes */}
                <G id="starry-eyes">
                  {/* Left Eye */}
                  <Circle cx="105" cy="50" r="6" fill="#1C1917" />
                  <Circle cx="103.5" cy="47.5" r="2.4" fill="#FFFFFF" />
                  <Circle cx="107.5" cy="52.5" r="1.2" fill="#93C5FD" />

                  {/* Right Eye */}
                  <Circle cx="135" cy="50" r="6" fill="#1C1917" />
                  <Circle cx="133.5" cy="47.5" r="2.4" fill="#FFFFFF" />
                  <Circle cx="137.5" cy="52.5" r="1.2" fill="#93C5FD" />
                </G>

                {/* Rosy Blushing Cheeks */}
                <Ellipse cx="92" cy="60" rx="5" ry="3.8" fill="#FB7185" opacity={0.7} />
                <Ellipse cx="148" cy="60" rx="5" ry="3.8" fill="#FB7185" opacity={0.7} />

                {/* Wide Cheerful Happy Open Smile with Tongue */}
                <Path d="M 113 64 Q 120 74 127 64 Z" fill="#E11D48" />
                <Path d="M 115 68 Q 120 74 125 68 Z" fill="#FB7185" />

                {/* Equipped Glasses & Eyewear */}
                {equippedGlasses === 'aviators' && (
                  <G transform="translate(94, 42)">
                    <Rect x="0" y="0" width="22" height="14" rx="5" fill="#0F172A" />
                    <Rect x="30" y="0" width="22" height="14" rx="5" fill="#0F172A" />
                    <Line x1="22" y1="5" x2="30" y2="5" stroke="#F59E0B" strokeWidth={2.5} />
                    <Path d="M 4 3 L 9 11" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.6} />
                    <Path d="M 34 3 L 39 11" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.6} />
                  </G>
                )}
                {equippedGlasses === 'round_specs' && (
                  <G transform="translate(92, 40)">
                    <Circle cx="12" cy="10" r="10" fill="none" stroke="#0284C7" strokeWidth={2.5} />
                    <Circle cx="44" cy="10" r="10" fill="none" stroke="#0284C7" strokeWidth={2.5} />
                    <Line x1="22" y1="10" x2="34" y2="10" stroke="#0284C7" strokeWidth={2.5} />
                  </G>
                )}
                {equippedGlasses === 'star_glasses' && (
                  <G transform="translate(94, 40)">
                    <Path d="M 12 0 L 15 8 L 24 9 L 17 15 L 19 24 L 12 19 L 5 24 L 7 15 L 0 9 L 9 8 Z" fill="#EAB308" />
                    <Path d="M 44 0 L 47 8 L 56 9 L 49 15 L 51 24 L 44 19 L 37 24 L 39 15 L 32 9 L 41 8 Z" fill="#EAB308" />
                    <Line x1="20" y1="12" x2="36" y2="12" stroke="#CA8A04" strokeWidth={2.5} />
                  </G>
                )}
                {equippedGlasses === 'pixel_shades' && (
                  <G transform="translate(92, 44)">
                    <Rect x="0" y="0" width="24" height="9" fill="#0F172A" />
                    <Rect x="28" y="0" width="24" height="9" fill="#0F172A" />
                    <Rect x="22" y="0" width="8" height="4" fill="#0F172A" />
                    <Rect x="3" y="2" width="4" height="3" fill="#FFFFFF" />
                    <Rect x="31" y="2" width="4" height="3" fill="#FFFFFF" />
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
