import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Rect,
  Circle,
  Ellipse,
  Polygon,
} from 'react-native-svg';

const useNative = Platform.OS !== 'web';

// -------------------------------------------------------------
// 1. STREAK FLAME ANIMATION (Flickering, blazing fire with sparks)
// -------------------------------------------------------------
export const StreakFlameVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 64,
  speed = 1,
}) => {
  const flickerAnim = useRef(new Animated.Value(0)).current;
  const sparkAnim1 = useRef(new Animated.Value(0)).current;
  const sparkAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 1200 / speed;

    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(flickerAnim, {
          toValue: -1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const spark1 = Animated.loop(
      Animated.timing(sparkAnim1, {
        toValue: 1,
        duration: baseDuration * 0.9,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    const spark2 = Animated.loop(
      Animated.timing(sparkAnim2, {
        toValue: 1,
        duration: baseDuration * 1.3,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    flicker.start();
    spark1.start();
    spark2.start();

    return () => {
      flicker.stop();
      spark1.stop();
      spark2.stop();
    };
  }, [speed]);

  const scaleY = flickerAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.93, 1.0, 1.07],
  });

  const scaleX = flickerAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [1.05, 1.0, 0.95],
  });

  const rotate = flickerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const spark1Y = sparkAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const spark1Opacity = sparkAnim1.interpolate({
    inputRange: [0, 0.3, 0.8, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  const spark2Y = sparkAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -36],
  });
  const spark2Opacity = sparkAnim2.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0, 1, 0.7, 0],
  });

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Animated Fire Body */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scaleY }, { scaleX }, { rotate }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id="flameOuter" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#DC2626" />
              <Stop offset="45%" stopColor="#EA580C" />
              <Stop offset="85%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FDE047" />
            </LinearGradient>
            <LinearGradient id="flameMid" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#EA580C" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FEF08A" />
            </LinearGradient>
            <LinearGradient id="flameCore" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="70%" stopColor="#FEF08A" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>

          {/* Outer Blazing Body */}
          <Path
            d="M 50 8 C 62 25 84 42 84 66 C 84 84 69 94 50 94 C 31 94 16 84 16 66 C 16 42 38 25 50 8 Z"
            fill="url(#flameOuter)"
          />

          {/* Secondary Flickering Tongue */}
          <Path
            d="M 50 24 C 60 38 74 50 74 70 C 74 84 64 90 50 90 C 36 90 26 84 26 70 C 26 50 40 38 50 24 Z"
            fill="url(#flameMid)"
            opacity={0.95}
          />

          {/* Radiant White-Hot Core */}
          <Path
            d="M 50 44 C 58 56 64 64 64 76 C 64 85 58 88 50 88 C 42 88 36 85 36 76 C 36 64 42 56 50 44 Z"
            fill="url(#flameCore)"
          />
        </Svg>
      </Animated.View>

      {/* Sparks Left */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            left: '28%',
            bottom: '40%',
            opacity: spark1Opacity,
            transform: [{ translateY: spark1Y }, { scale: 0.9 }],
          },
        ]}
      >
        <Svg width={size * 0.16} height={size * 0.16} viewBox="0 0 10 10">
          <Circle cx="5" cy="5" r="3.5" fill="#FDE047" />
        </Svg>
      </Animated.View>

      {/* Sparks Right */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            right: '26%',
            bottom: '45%',
            opacity: spark2Opacity,
            transform: [{ translateY: spark2Y }, { scale: 1.1 }],
          },
        ]}
      >
        <Svg width={size * 0.16} height={size * 0.16} viewBox="0 0 10 10">
          <Circle cx="5" cy="5" r="4" fill="#FFA500" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// -------------------------------------------------------------
// 2. CELEBRATION BURST ANIMATION (Confetti, sparkles, victory stars)
// -------------------------------------------------------------
export const CelebrationBurstVector: React.FC<{
  size?: number;
  loop?: boolean;
  onAnimationFinish?: () => void;
}> = ({ size = 60, loop = false, onAnimationFinish }) => {
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const playAnim = () => {
      animProgress.setValue(0);
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: useNative,
      }).start(({ finished }) => {
        if (finished) {
          if (loop) {
            playAnim();
          } else if (onAnimationFinish) {
            onAnimationFinish();
          }
        }
      });
    };

    playAnim();
  }, [loop]);

  const scale = animProgress.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0.2, 1.25, 1.05, 1.0],
  });

  const opacity = animProgress.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 1, 0.9, 0],
  });

  return (
    <Animated.View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Svg viewBox="0 0 120 120" width={size} height={size}>
        <Defs>
          <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FDE047" stopOpacity={1} />
            <Stop offset="60%" stopColor="#F59E0B" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#EA580C" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Center Golden Flash */}
        <Circle cx="60" cy="60" r="18" fill="url(#starGlow)" />

        {/* Center 4-Point Victory Star */}
        <Path
          d="M 60 40 Q 60 60 40 60 Q 60 60 60 80 Q 60 60 80 60 Q 60 60 60 40 Z"
          fill="#FEF08A"
        />

        {/* Colorful Confetti Particles */}
        <Polygon points="60,18 64,24 60,30 56,24" fill="#10B981" />
        <Polygon points="60,90 64,96 60,102 56,96" fill="#10B981" />

        <Rect x="18" y="56" width="10" height="8" rx="3" fill="#8B5CF6" transform="rotate(25 23 60)" />
        <Rect x="92" y="56" width="10" height="8" rx="3" fill="#8B5CF6" transform="rotate(-25 97 60)" />

        <Circle cx="30" cy="30" r="5" fill="#F59E0B" />
        <Circle cx="90" cy="30" r="5.5" fill="#EC4899" />
        <Circle cx="30" cy="90" r="5.5" fill="#06B6D4" />
        <Circle cx="90" cy="90" r="5" fill="#F59E0B" />

        <Polygon points="42,46 45,42 48,46 45,50" fill="#FFFFFF" />
        <Polygon points="75,72 78,68 81,72 78,76" fill="#FFFFFF" />
        <Polygon points="76,44 79,40 82,44 79,48" fill="#FDE047" />
        <Polygon points="40,74 43,70 46,74 43,78" fill="#FDE047" />
      </Svg>
    </Animated.View>
  );
};

// -------------------------------------------------------------
// 3. TROPHY ACHIEVEMENT ANIMATION (Golden trophy with stars)
// -------------------------------------------------------------
export const TrophyAchievementVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 48,
  speed = 1,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const twinkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 2000 / speed;

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: 3,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: baseDuration * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0,
          duration: baseDuration * 0.6,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );

    float.start();
    twinkle.start();

    return () => {
      float.stop();
      twinkle.stop();
    };
  }, [speed]);

  const starScale = twinkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1.2, 0.8],
  });

  const starOpacity = twinkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1.0, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          transform: [{ translateY: floatAnim }],
        },
      ]}
    >
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="goldCup" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="40%" stopColor="#FACC15" />
            <Stop offset="75%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
          <LinearGradient id="goldBase" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>
          <LinearGradient id="goldHandle" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#B45309" />
          </LinearGradient>
        </Defs>

        {/* Ambient base shadow */}
        <Ellipse cx="50" cy="92" rx="26" ry="4.5" fill="rgba(0,0,0,0.25)" />

        {/* Pedestal Base */}
        <Path d="M 32 84 L 68 84 L 64 74 L 36 74 Z" fill="url(#goldBase)" />
        <Rect x="28" y="84" width="44" height="6" rx="2" fill="#78350F" />

        {/* Trophy Stem */}
        <Path d="M 45 64 L 55 64 L 54 74 L 46 74 Z" fill="url(#goldCup)" />
        <Ellipse cx="50" cy="64" rx="9" ry="3" fill="#D97706" />

        {/* Left Sculpted Handle */}
        <Path
          d="M 32 30 C 14 30 14 54 34 54 C 33 49 33 36 32 30 Z"
          fill="none"
          stroke="url(#goldHandle)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Right Sculpted Handle */}
        <Path
          d="M 68 30 C 86 30 86 54 66 54 C 67 49 67 36 68 30 Z"
          fill="none"
          stroke="url(#goldHandle)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Main Trophy Cup Body */}
        <Path
          d="M 28 22 C 28 54 40 64 50 64 C 60 64 72 54 72 22 Z"
          fill="url(#goldCup)"
        />
        {/* Trophy Top Rim */}
        <Ellipse cx="50" cy="22" rx="22" ry="5.5" fill="#FEF08A" />
        <Ellipse cx="50" cy="22" rx="19" ry="4" fill="#CA8A04" />

        {/* Star Badge on Trophy Cup */}
        <Path
          d="M 50 36 L 52.5 42 L 58 42.5 L 53.5 46.5 L 55 52 L 50 48.5 L 45 52 L 46.5 46.5 L 42 42.5 L 47.5 42 Z"
          fill="#FFFFFF"
        />

        {/* Shiny Highlight Line */}
        <Path d="M 36 26 Q 38 46 44 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.6} />
      </Svg>

      {/* Twinkling Star 1 */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            top: 2,
            left: 2,
            opacity: starOpacity,
            transform: [{ scale: starScale }],
          },
        ]}
      >
        <Svg width={size * 0.28} height={size * 0.28} viewBox="0 0 20 20">
          <Path d="M 10 2 Q 10 10 2 10 Q 10 10 10 18 Q 10 10 18 10 Q 10 10 10 2 Z" fill="#FDE047" />
        </Svg>
      </Animated.View>

      {/* Twinkling Star 2 */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            top: 8,
            right: 0,
            opacity: starOpacity,
            transform: [{ scale: starScale }],
          },
        ]}
      >
        <Svg width={size * 0.22} height={size * 0.22} viewBox="0 0 20 20">
          <Path d="M 10 2 Q 10 10 2 10 Q 10 10 10 18 Q 10 10 18 10 Q 10 10 10 2 Z" fill="#FFFFFF" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

// -------------------------------------------------------------
// 4. PLANT GROWING ANIMATION (Vibrant sprouting pot)
// -------------------------------------------------------------
export const PlantGrowingVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 54,
  speed = 1,
}) => {
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 2200 / speed;

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    sway.start();
    return () => sway.stop();
  }, [speed]);

  const rotate = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="pgPot" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#9A3412" />
          </LinearGradient>
          <LinearGradient id="pgStem" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#15803D" />
            <Stop offset="100%" stopColor="#4ADE80" />
          </LinearGradient>
          <LinearGradient id="pgLeaf" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0%" stopColor="#16A34A" />
            <Stop offset="100%" stopColor="#86EFAC" />
          </LinearGradient>
        </Defs>

        {/* Base Terracotta Pot */}
        <Path d="M 32 68 L 38 88 Q 40 91 46 91 L 54 91 Q 60 91 62 88 L 68 68 Z" fill="url(#pgPot)" />
        <Rect x="28" y="64" width="44" height="6" rx="2" fill="#D97706" />
        <Ellipse cx="50" cy="66" rx="20" ry="2.5" fill="#3E2723" />
      </Svg>

      {/* Swaying Sprout Stem & Leaves */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ rotate }],
            top: '-10%',
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Main Stem */}
          <Path d="M 50 68 Q 49 50 50 34" stroke="url(#pgStem)" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Left Leaf */}
          <Path d="M 50 48 C 36 42 34 54 44 58 C 48 58 50 52 50 48 Z" fill="url(#pgLeaf)" />
          {/* Right Leaf */}
          <Path d="M 50 42 C 64 34 66 48 56 52 C 52 52 50 46 50 42 Z" fill="url(#pgLeaf)" />

          {/* Flower Blossom on top */}
          <Circle cx="50" cy="30" r="5" fill="#EC4899" />
          <Circle cx="50" cy="30" r="2.2" fill="#FEF08A" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// -------------------------------------------------------------
// 5. MASCOT WAVING ANIMATION (Cute Red Panda greeting)
// -------------------------------------------------------------
export const MascotWavingVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 80,
  speed = 1,
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 1400 / speed;

    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(waveAnim, {
          toValue: -1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );

    wave.start();
    bounce.start();

    return () => {
      wave.stop();
      bounce.stop();
    };
  }, [speed]);

  const pawRotate = waveAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-18deg', '24deg'],
  });

  return (
    <Animated.View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          transform: [{ translateY: bounceAnim }],
        },
      ]}
    >
      <Svg viewBox="0 0 120 120" width={size} height={size}>
        <Defs>
          <RadialGradient id="mwFur" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FB923C" />
            <Stop offset="70%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#C2410C" />
          </RadialGradient>
          <LinearGradient id="mwDark" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#451A03" />
            <Stop offset="100%" stopColor="#290E02" />
          </LinearGradient>
        </Defs>

        {/* Fluffy Body */}
        <Ellipse cx="60" cy="80" rx="28" ry="22" fill="url(#mwFur)" />
        <Ellipse cx="60" cy="84" rx="16" ry="12" fill="url(#mwDark)" />

        {/* Ears */}
        <Path d="M 36 44 L 24 20 Q 20 28 34 50 Z" fill="url(#mwFur)" />
        <Path d="M 33 42 L 25 24 Q 22 30 31 46 Z" fill="#FFFFFF" />

        <Path d="M 84 44 L 96 20 Q 100 28 86 50 Z" fill="url(#mwFur)" />
        <Path d="M 87 42 L 95 24 Q 98 30 89 46 Z" fill="#FFFFFF" />

        {/* Round Head */}
        <Ellipse cx="60" cy="52" rx="28" ry="24" fill="url(#mwFur)" />

        {/* White Muzzle & Markings */}
        <Ellipse cx="60" cy="60" rx="13" ry="9" fill="#FFFFFF" />
        <Ellipse cx="47" cy="42" rx="4.5" ry="3" fill="#FFFFFF" transform="rotate(-15 47 42)" />
        <Ellipse cx="73" cy="42" rx="4.5" ry="3" fill="#FFFFFF" transform="rotate(15 73 42)" />
        <Path d="M 36 54 Q 44 60 40 66 Q 34 60 36 54 Z" fill="#FFFFFF" />
        <Path d="M 84 54 Q 76 60 80 66 Q 86 60 84 54 Z" fill="#FFFFFF" />

        {/* Cute Eyes & Nose */}
        <Circle cx="50" cy="50" r="3.8" fill="#1C1917" />
        <Circle cx="51.5" cy="48.5" r="1.4" fill="#FFFFFF" />

        <Circle cx="70" cy="50" r="3.8" fill="#1C1917" />
        <Circle cx="71.5" cy="48.5" r="1.4" fill="#FFFFFF" />

        <Path d="M 57 56 L 63 56 L 60 60 Z" fill="#1C1917" />
        <Path d="M 57 62 Q 60 66 63 62" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Rosy Cheeks */}
        <Ellipse cx="42" cy="57" rx="3.5" ry="2" fill="#F43F5E" opacity={0.6} />
        <Ellipse cx="78" cy="57" rx="3.5" ry="2" fill="#F43F5E" opacity={0.6} />

        {/* Left Resting Paw */}
        <Ellipse cx="45" cy="92" rx="7" ry="5.5" fill="url(#mwDark)" />
      </Svg>

      {/* Animated Waving Right Paw */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            right: size * 0.12,
            top: size * 0.38,
            transform: [{ rotate: pawRotate }],
          },
        ]}
      >
        <Svg width={size * 0.32} height={size * 0.32} viewBox="0 0 30 30">
          <Ellipse cx="15" cy="15" rx="9" ry="7" fill="#451A03" />
          <Circle cx="12" cy="13" r="2" fill="#FDE047" opacity={0.8} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

// -------------------------------------------------------------
// 6. ZEN MEDITATION ANIMATION (Serene floating lotus with ripples)
// -------------------------------------------------------------
export const ZenMeditationVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 80,
  speed = 1,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 3000 / speed;

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const ripple = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: baseDuration * 0.8,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    float.start();
    ripple.start();

    return () => {
      float.stop();
      ripple.stop();
    };
  }, [speed]);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.25],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.8, 0.5, 0],
  });

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Ripple Rings */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Ellipse cx="50" cy="65" rx="36" ry="12" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" opacity={0.6} />
        </Svg>
      </Animated.View>

      {/* Floating Lotus Blossom */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id="zenLotus" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#C084FC" />
              <Stop offset="60%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#FBCFE8" />
            </LinearGradient>
            <RadialGradient id="zenGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FDE047" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Lotus Pad Base */}
          <Ellipse cx="50" cy="68" rx="32" ry="8" fill="#047857" opacity={0.9} />
          <Ellipse cx="50" cy="67" rx="26" ry="6" fill="#10B981" opacity={0.9} />

          {/* Back Outer Petals */}
          <Path d="M 28 64 C 20 50 32 38 42 54 Z" fill="#A855F7" opacity={0.8} />
          <Path d="M 72 64 C 80 50 68 38 58 54 Z" fill="#A855F7" opacity={0.8} />

          {/* Mid Lotus Petals */}
          <Path d="M 36 65 C 28 44 46 32 50 56 Z" fill="url(#zenLotus)" />
          <Path d="M 64 65 C 72 44 54 32 50 56 Z" fill="url(#zenLotus)" />

          {/* Center Main Sacred Petal */}
          <Path d="M 50 66 C 42 40 50 22 50 22 C 50 22 58 40 50 66 Z" fill="url(#zenLotus)" />

          {/* Golden Spiritual Core */}
          <Circle cx="50" cy="52" r="8" fill="url(#zenGlow)" />
          <Circle cx="50" cy="52" r="3.5" fill="#FEF08A" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fillCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  sparkParticle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
