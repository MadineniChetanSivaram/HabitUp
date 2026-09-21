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

const DUOLINGO_CELEBRATION_QUOTES = [
  {
    title: 'UNSTOPPABLE! 🐼🔥',
    body: 'You crushed every single habit scheduled for today!',
  },
  {
    title: 'STREAK EXTENDED! 🔥🎋',
    body: 'Look at that discipline! Even Duo would be proud of you.',
  },
  {
    title: 'PERFECT 100%! 🏆✨',
    body: 'Daily routine complete! Time to feast on fresh bamboo!',
  },
  {
    title: 'MOMENTUM MASTER! ⚡💪',
    body: 'Another day conquered. Keep this fire burning bright tomorrow!',
  },
];

export const SparkyCelebrationModal: React.FC = () => {
  const {
    isCelebrationModalOpen,
    setIsCelebrationModalOpen,
    overallStats,
    soundEnabled,
    hapticsEnabled,
    equippedHat,
    equippedGlasses,
    t,
  } = useHabit();

  const streak = overallStats.plantStreak?.currentStreak ?? overallStats.currentBestStreak ?? 1;
  const [quote] = useState(() => {
    const idx = Math.floor(Math.random() * DUOLINGO_CELEBRATION_QUOTES.length);
    return DUOLINGO_CELEBRATION_QUOTES[idx];
  });

  const useNative = Platform.OS !== 'web';

  // Animation Refs
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const bambooSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.6)).current;
  const bubbleScaleAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonBounceAnim = useRef(new Animated.Value(0)).current;
  const pandaBobAnim = useRef(new Animated.Value(0)).current;
  const pawWaveAnim = useRef(new Animated.Value(0)).current;
  const starRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCelebrationModalOpen) {
      // 1. Play bamboo shoot & Duolingo celebration sound sequence
      if (soundEnabled) {
        soundService.playBambooSlideSound();
        setTimeout(() => {
          soundService.playDuolingoCelebrationFanfare();
          soundService.playMascotCuteSound('happy_bleat');
        }, 320);
      }

      if (hapticsEnabled) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } catch {}
      }

      // 2. Reset Animation Values
      backdropAnim.setValue(0);
      bambooSlideAnim.setValue(SCREEN_HEIGHT * 0.65);
      bubbleScaleAnim.setValue(0);
      cardSlideAnim.setValue(120);
      cardOpacityAnim.setValue(0);
      buttonBounceAnim.setValue(0);
      pandaBobAnim.setValue(0);
      pawWaveAnim.setValue(0);

      // 3. Orchestrate Entrance Stagger
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: useNative,
      }).start();

      // Bamboo Spring Shoot-Up
      Animated.spring(bambooSlideAnim, {
        toValue: 0,
        tension: 42,
        friction: 6.2,
        useNativeDriver: useNative,
      }).start(() => {
        // Continuous gentle bobbing once landed
        Animated.loop(
          Animated.sequence([
            Animated.timing(pandaBobAnim, {
              toValue: -8,
              duration: 1000,
              useNativeDriver: useNative,
            }),
            Animated.timing(pandaBobAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: useNative,
            }),
          ])
        ).start();

        // Cheerful paw wave loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(pawWaveAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: useNative,
            }),
            Animated.timing(pawWaveAnim, {
              toValue: -1,
              duration: 350,
              useNativeDriver: useNative,
            }),
          ])
        ).start();
      });

      // Speech bubble pop-in (at 380ms)
      setTimeout(() => {
        Animated.spring(bubbleScaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 5.5,
          useNativeDriver: useNative,
        }).start();
      }, 380);

      // Reward cards slide in (at 550ms)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(cardSlideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: useNative,
          }),
          Animated.timing(cardOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: useNative,
          }),
        ]).start();
      }, 550);

      // Continue button pop-in (at 700ms)
      setTimeout(() => {
        Animated.spring(buttonBounceAnim, {
          toValue: 1,
          tension: 70,
          friction: 6,
          useNativeDriver: useNative,
        }).start();
      }, 700);

      // Background golden star rotation
      Animated.loop(
        Animated.timing(starRotateAnim, {
          toValue: 1,
          duration: 18000,
          useNativeDriver: useNative,
        })
      ).start();
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

    // Smooth exit slide
    Animated.parallel([
      Animated.timing(bambooSlideAnim, {
        toValue: SCREEN_HEIGHT * 0.7,
        duration: 300,
        useNativeDriver: useNative,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      setIsCelebrationModalOpen(false);
    });
  };

  if (!isCelebrationModalOpen) return null;

  const starRotation = starRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pawRotate = pawWaveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-18deg', '18deg'],
  });

  return (
    <Modal visible={isCelebrationModalOpen} transparent animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.container}>
        {/* Semi-transparent dark overlay */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />

        {/* Ambient Golden Sunburst Rotating Effect */}
        <Animated.View
          style={[
            styles.sunburstContainer,
            {
              transform: [{ rotate: starRotation }],
              opacity: backdropAnim,
            },
          ]}
        >
          <Svg width={SCREEN_WIDTH * 1.5} height={SCREEN_WIDTH * 1.5} viewBox="0 0 500 500">
            <Defs>
              <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
                <Stop offset="60%" stopColor="#10B981" stopOpacity="0.10" />
                <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="250" cy="250" r="240" fill="url(#starGlow)" />
          </Svg>
        </Animated.View>

        {/* Main Springing Container */}
        <Animated.View
          style={[
            styles.celebrationContent,
            {
              transform: [{ translateY: bambooSlideAnim }],
            },
          ]}
        >
          {/* 1. Duolingo Comic Speech Bubble */}
          <Animated.View
            style={[
              styles.speechBubbleWrapper,
              {
                transform: [{ scale: bubbleScaleAnim }],
              },
            ]}
          >
            <View style={styles.speechBubble}>
              <Text style={styles.speechTitle}>{quote.title}</Text>
              <Text style={styles.speechBody}>{quote.body}</Text>
            </View>
            {/* Bubble arrow pointer pointing down to Sparky */}
            <View style={styles.bubbleTail} />
          </Animated.View>

          {/* 2. Sparky Panda + Bamboo Stalk SVG Scene */}
          <Animated.View
            style={[
              styles.mascotScene,
              {
                transform: [{ translateY: pandaBobAnim }],
              },
            ]}
          >
            <Svg width={260} height={240} viewBox="0 0 260 240">
              <Defs>
                {/* Bamboo Stalk Gradient */}
                <LinearGradient id="bambooStalk" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#059669" />
                  <Stop offset="40%" stopColor="#10B981" />
                  <Stop offset="70%" stopColor="#34D399" />
                  <Stop offset="100%" stopColor="#047857" />
                </LinearGradient>

                {/* Bamboo Node Ring Gradient */}
                <LinearGradient id="bambooNode" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#064E3B" />
                  <Stop offset="50%" stopColor="#34D399" />
                  <Stop offset="100%" stopColor="#064E3B" />
                </LinearGradient>

                {/* Sparky Red Fur Gradient */}
                <RadialGradient id="sparkyFur" cx="50%" cy="40%" r="60%">
                  <Stop offset="0%" stopColor="#FF7A3D" />
                  <Stop offset="75%" stopColor="#EA580C" />
                  <Stop offset="100%" stopColor="#9A3412" />
                </RadialGradient>

                {/* Golden Hat / Crown Gradient */}
                <LinearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FDE047" />
                  <Stop offset="50%" stopColor="#EAB308" />
                  <Stop offset="100%" stopColor="#CA8A04" />
                </LinearGradient>

                {/* Leaf Gradient */}
                <LinearGradient id="bambooLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#6EE7B7" />
                  <Stop offset="100%" stopColor="#059669" />
                </LinearGradient>
              </Defs>

              {/* === A. BAMBOO STALK (Tall, segmented bamboo shoot) === */}
              <G>
                {/* Lower Stalk Segment */}
                <Rect x="120" y="140" width="20" height="100" rx="3" fill="url(#bambooStalk)" />
                <Rect x="117" y="140" width="26" height="5" rx="2.5" fill="url(#bambooNode)" />

                {/* Middle Stalk Segment */}
                <Rect x="120" y="60" width="20" height="80" rx="3" fill="url(#bambooStalk)" />
                <Rect x="117" y="60" width="26" height="5" rx="2.5" fill="url(#bambooNode)" />

                {/* Upper Stalk Segment */}
                <Rect x="121" y="0" width="18" height="60" rx="3" fill="url(#bambooStalk)" />

                {/* Lush Bamboo Leaves sprouting left & right */}
                {/* Left Branch */}
                <Path d="M120,70 Q90,55 70,75 Q95,85 120,74 Z" fill="url(#bambooLeaf)" />
                <Path d="M120,68 Q80,45 60,60 Q85,72 120,70 Z" fill="url(#bambooLeaf)" />

                {/* Right Branch */}
                <Path d="M140,110 Q170,95 195,115 Q165,125 140,114 Z" fill="url(#bambooLeaf)" />
                <Path d="M140,108 Q180,85 205,100 Q175,112 140,110 Z" fill="url(#bambooLeaf)" />
                <Path d="M140,40 Q175,20 190,40 Q160,50 140,42 Z" fill="url(#bambooLeaf)" />
              </G>

              {/* === B. SPARKY THE PANDA CLIMBING / PEEKING === */}
              <G transform="translate(45, 30)">
                {/* Fluffy Red Panda Striped Tail */}
                <Path
                  d="M130,130 Q165,135 175,105 Q170,85 145,95 Q135,115 130,130 Z"
                  fill="url(#sparkyFur)"
                />
                {/* Tail Rings */}
                <Path d="M145,122 Q158,124 162,112" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
                <Path d="M155,108 Q166,108 168,98" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />

                {/* Left Ear */}
                <Path d="M30,42 Q18,18 42,22 Z" fill="url(#sparkyFur)" />
                <Path d="M32,38 Q24,24 38,26 Z" fill="#FFFFFF" />

                {/* Right Ear */}
                <Path d="M100,42 Q112,18 88,22 Z" fill="url(#sparkyFur)" />
                <Path d="M98,38 Q106,24 92,26 Z" fill="#FFFFFF" />

                {/* Head Base */}
                <Ellipse cx="65" cy="62" rx="42" ry="34" fill="url(#sparkyFur)" />

                {/* White Cheek Tufts & Brow Patches */}
                <Ellipse cx="38" cy="72" rx="14" ry="10" fill="#FFFFFF" />
                <Ellipse cx="92" cy="72" rx="14" ry="10" fill="#FFFFFF" />
                {/* Eyebrow Spots */}
                <Circle cx="48" cy="46" r="4.5" fill="#FFFFFF" />
                <Circle cx="82" cy="46" r="4.5" fill="#FFFFFF" />

                {/* Starry / Joyful Celebrating Eyes (Duolingo Style) */}
                <G>
                  {/* Left Star Eye */}
                  <Circle cx="48" cy="58" r="7" fill="#1E1B4B" />
                  <Circle cx="46" cy="55" r="2.5" fill="#FFFFFF" />
                  <Circle cx="51" cy="61" r="1.2" fill="#FFFFFF" />

                  {/* Right Star Eye */}
                  <Circle cx="82" cy="58" r="7" fill="#1E1B4B" />
                  <Circle cx="80" cy="55" r="2.5" fill="#FFFFFF" />
                  <Circle cx="85" cy="61" r="1.2" fill="#FFFFFF" />
                </G>

                {/* Rosy Cheeks */}
                <Circle cx="36" cy="74" r="6" fill="#FB7185" opacity={0.65} />
                <Circle cx="94" cy="74" r="6" fill="#FB7185" opacity={0.65} />

                {/* Muzzle & Cheerful Mouth */}
                <Ellipse cx="65" cy="75" rx="13" ry="9" fill="#FFFFFF" />
                {/* Black Nose */}
                <Ellipse cx="65" cy="71" rx="4.5" ry="3" fill="#1E1B4B" />
                {/* Big Open Happy Smile (Duolingo Joy) */}
                <Path d="M59,76 Q65,85 71,76 Z" fill="#E11D48" />
                <Path d="M62,82 Q65,85 68,82 Z" fill="#FB7185" />

                {/* Panda Body hugging the bamboo */}
                <Ellipse cx="68" cy="112" rx="30" ry="24" fill="url(#sparkyFur)" />
                {/* Dark chest bib */}
                <Ellipse cx="68" cy="116" rx="20" ry="16" fill="#451A03" />

                {/* Left Paw holding Bamboo Stalk */}
                <Ellipse cx="38" cy="104" rx="10" ry="8" fill="#451A03" transform="rotate(-15 38 104)" />
                {/* Right Paw holding Bamboo Stalk */}
                <Ellipse cx="96" cy="102" rx="11" ry="8" fill="#451A03" transform="rotate(20 96 102)" />

                {/* Feet at bottom of body */}
                <Ellipse cx="48" cy="132" rx="10" ry="7" fill="#451A03" />
                <Ellipse cx="86" cy="132" rx="10" ry="7" fill="#451A03" />

                {/* === EQUIPPED ACCESSORIES (Hats / Glasses) === */}
                {/* Crown / Hat Accessories */}
                {equippedHat === 'hat-crown' && (
                  <G transform="translate(42, 10)">
                    <Path d="M0,18 L10,6 L23,16 L36,6 L46,18 Z" fill="url(#goldCrown)" />
                    <Circle cx="10" cy="6" r="2.5" fill="#EF4444" />
                    <Circle cx="23" cy="16" r="2.5" fill="#3B82F6" />
                    <Circle cx="36" cy="6" r="2.5" fill="#10B981" />
                  </G>
                )}
                {equippedHat === 'hat-grad' && (
                  <G transform="translate(40, 14)">
                    <Path d="M0,14 L25,4 L50,14 L25,24 Z" fill="#1E293B" />
                    <Rect x="18" y="20" width="14" height="8" fill="#0F172A" rx="2" />
                    <Path d="M42,16 L48,26" stroke="#F59E0B" strokeWidth="2.5" />
                    <Circle cx="48" cy="27" r="2" fill="#F59E0B" />
                  </G>
                )}
                {equippedHat === 'hat-top' && (
                  <G transform="translate(44, 2)">
                    <Rect x="8" y="0" width="26" height="24" rx="3" fill="#0F172A" />
                    <Rect x="8" y="16" width="26" height="5" fill="#DC2626" />
                    <Ellipse cx="21" cy="24" rx="22" ry="5" fill="#0F172A" />
                  </G>
                )}

                {/* Glasses Accessories */}
                {equippedGlasses === 'glass-sunglasses' && (
                  <G transform="translate(40, 52)">
                    <Rect x="0" y="0" width="20" height="12" rx="4" fill="#0F172A" />
                    <Rect x="30" y="0" width="20" height="12" rx="4" fill="#0F172A" />
                    <Line x1="20" y1="5" x2="30" y2="5" stroke="#0F172A" strokeWidth="2.5" />
                  </G>
                )}
                {equippedGlasses === 'glass-geek' && (
                  <G transform="translate(38, 50)">
                    <Circle cx="10" cy="8" r="9" fill="none" stroke="#0284C7" strokeWidth="2.5" />
                    <Circle cx="36" cy="8" r="9" fill="none" stroke="#0284C7" strokeWidth="2.5" />
                    <Line x1="19" y1="8" x2="27" y2="8" stroke="#0284C7" strokeWidth="2.5" />
                  </G>
                )}
              </G>
            </Svg>
          </Animated.View>

          {/* 3. Reward & Progress Summary Cards */}
          <Animated.View
            style={[
              styles.rewardCardsContainer,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: cardSlideAnim }],
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
          </Animated.View>

          {/* 4. Duolingo-Style 3D Green Continue Button */}
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [{ scale: buttonBounceAnim }],
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
          </Animated.View>
        </Animated.View>
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
    backgroundColor: 'rgba(8, 14, 26, 0.85)',
  },
  sunburstContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationContent: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  speechBubbleWrapper: {
    alignItems: 'center',
    marginBottom: -8,
    zIndex: 10,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#7C5CFF',
  },
  speechTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  speechBody: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
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
  mascotScene: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  rewardCardsContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 12,
  },
  rewardCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
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
