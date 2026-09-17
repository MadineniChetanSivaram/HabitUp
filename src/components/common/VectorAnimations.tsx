import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Path,
  Rect,
  Circle,
  Ellipse,
  Polygon,
} from 'react-native-svg';

const useNative = Platform.OS !== 'web';

// -------------------------------------------------------------
// 1. STREAK FLAME ANIMATION (Dynamic 3-layer roaring fire + sparks)
// -------------------------------------------------------------
export const StreakFlameVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 64,
  speed = 1,
}) => {
  const outerAnim = useRef(new Animated.Value(0)).current;
  const midAnim = useRef(new Animated.Value(0)).current;
  const coreAnim = useRef(new Animated.Value(0)).current;
  const sparkAnim1 = useRef(new Animated.Value(0)).current;
  const sparkAnim2 = useRef(new Animated.Value(0)).current;
  const sparkAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 1000 / speed;

    // Layer 1: Outer flame wave
    const outer = Animated.loop(
      Animated.sequence([
        Animated.timing(outerAnim, {
          toValue: 1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(outerAnim, {
          toValue: -1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    // Layer 2: Mid flame counter-wave (faster)
    const mid = Animated.loop(
      Animated.sequence([
        Animated.timing(midAnim, {
          toValue: 1,
          duration: baseDuration * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(midAnim, {
          toValue: -1,
          duration: baseDuration * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );

    // Layer 3: Core pulse
    const core = Animated.loop(
      Animated.sequence([
        Animated.timing(coreAnim, {
          toValue: 1,
          duration: baseDuration * 0.28,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(coreAnim, {
          toValue: 0,
          duration: baseDuration * 0.28,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    // Sparks
    const spark1 = Animated.loop(
      Animated.timing(sparkAnim1, {
        toValue: 1,
        duration: baseDuration * 0.8,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    const spark2 = Animated.loop(
      Animated.timing(sparkAnim2, {
        toValue: 1,
        duration: baseDuration * 1.1,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    const spark3 = Animated.loop(
      Animated.timing(sparkAnim3, {
        toValue: 1,
        duration: baseDuration * 0.95,
        easing: Easing.out(Easing.quad),
        useNativeDriver: useNative,
      })
    );

    outer.start();
    mid.start();
    core.start();
    spark1.start();
    spark2.start();
    spark3.start();

    return () => {
      outer.stop();
      mid.stop();
      core.stop();
      spark1.stop();
      spark2.stop();
      spark3.stop();
    };
  }, [speed]);

  const outerScaleY = outerAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.91, 1.0, 1.11],
  });
  const outerRotate = outerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3.5deg', '3.5deg'],
  });

  const midScaleY = midAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.88, 1.0, 1.14],
  });
  const midRotate = midAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['4deg', '-4deg'],
  });

  const coreScale = coreAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1.08],
  });

  // Spark interpolations
  const s1Y = sparkAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -32] });
  const s1Op = sparkAnim1.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 1, 0.8, 0] });
  const s1X = sparkAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  const s2Y = sparkAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
  const s2Op = sparkAnim2.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 1, 0.7, 0] });
  const s2X = sparkAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  const s3Y = sparkAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });
  const s3Op = sparkAnim3.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.9, 0] });

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Background Heat Halo */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            opacity: outerAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.35, 0.5, 0.65] }),
            transform: [{ scale: outerScaleY }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size * 1.2} height={size * 1.2}>
          <Defs>
            <RadialGradient id="flameHalo" cx="50%" cy="55%" r="45%">
              <Stop offset="0%" stopColor="#EA580C" stopOpacity={0.8} />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="55" r="45" fill="url(#flameHalo)" />
        </Svg>
      </Animated.View>

      {/* Layer 1: Outer Roaring Flame */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scaleY: outerScaleY }, { rotate: outerRotate }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id="flameOuterGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#DC2626" />
              <Stop offset="40%" stopColor="#EA580C" />
              <Stop offset="80%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FDE047" />
            </LinearGradient>
          </Defs>
          <Path
            d="M 50 6 C 63 24 86 42 86 66 C 86 85 70 95 50 95 C 30 95 14 85 14 66 C 14 42 37 24 50 6 Z"
            fill="url(#flameOuterGrad)"
          />
        </Svg>
      </Animated.View>

      {/* Layer 2: Mid Flickering Flame */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scaleY: midScaleY }, { rotate: midRotate }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id="flameMidGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#EA580C" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FEF08A" />
            </LinearGradient>
          </Defs>
          <Path
            d="M 50 20 C 60 36 74 48 74 68 C 74 84 64 90 50 90 C 36 90 26 84 26 68 C 26 48 40 36 50 20 Z"
            fill="url(#flameMidGrad)"
          />
        </Svg>
      </Animated.View>

      {/* Layer 3: White-Hot Core */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scale: coreScale }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id="flameCoreGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="65%" stopColor="#FEF08A" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>
          <Path
            d="M 50 40 C 58 52 64 62 64 74 C 64 84 58 87 50 87 C 42 87 36 84 36 74 C 36 62 42 52 50 40 Z"
            fill="url(#flameCoreGrad)"
          />
        </Svg>
      </Animated.View>

      {/* Spark 1 (Left drift) */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            left: '26%',
            bottom: '38%',
            opacity: s1Op,
            transform: [{ translateY: s1Y }, { translateX: s1X }, { scale: 0.95 }],
          },
        ]}
      >
        <Svg width={size * 0.16} height={size * 0.16} viewBox="0 0 10 10">
          <Circle cx="5" cy="5" r="3.8" fill="#FDE047" />
        </Svg>
      </Animated.View>

      {/* Spark 2 (Right drift) */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            right: '24%',
            bottom: '42%',
            opacity: s2Op,
            transform: [{ translateY: s2Y }, { translateX: s2X }, { scale: 1.1 }],
          },
        ]}
      >
        <Svg width={size * 0.16} height={size * 0.16} viewBox="0 0 10 10">
          <Circle cx="5" cy="5" r="4" fill="#FFA500" />
        </Svg>
      </Animated.View>

      {/* Spark 3 (Center high) */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            left: '48%',
            bottom: '50%',
            opacity: s3Op,
            transform: [{ translateY: s3Y }, { scale: 0.8 }],
          },
        ]}
      >
        <Svg width={size * 0.14} height={size * 0.14} viewBox="0 0 10 10">
          <Circle cx="5" cy="5" r="3.5" fill="#FFFFFF" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// -------------------------------------------------------------
// 2. CELEBRATION BURST ANIMATION (12 Radial Confetti Particles + Star Burst)
// -------------------------------------------------------------
export const CelebrationBurstVector: React.FC<{
  size?: number;
  loop?: boolean;
  onAnimationFinish?: () => void;
}> = ({ size = 80, loop = false, onAnimationFinish }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const play = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: useNative,
      }).start(({ finished }) => {
        if (finished) {
          if (loop) {
            play();
          } else if (onAnimationFinish) {
            onAnimationFinish();
          }
        }
      });
    };

    play();
  }, [loop]);

  // Overall opacity & particle distance
  const opacity = anim.interpolate({
    inputRange: [0, 0.1, 0.65, 1],
    outputRange: [0, 1, 0.95, 0],
  });

  const dist = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.44],
  });

  const starScale = anim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [0.1, 1.4, 1.0, 0.8],
  });

  const ringScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1.6],
  });

  const ringOpacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [1, 0.8, 0.2, 0],
  });

  // Particle trajectory helper (angle in degrees)
  const getParticlePos = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const x = dist.interpolate({
      inputRange: [0, size * 0.44],
      outputRange: [0, Math.cos(rad) * (size * 0.44)],
    });
    const y = dist.interpolate({
      inputRange: [0, size * 0.44],
      outputRange: [0, Math.sin(rad) * (size * 0.44)],
    });
    return { x, y };
  };

  const p0 = getParticlePos(-90);   // Top (0)
  const p1 = getParticlePos(-55);   // Top-Right
  const p2 = getParticlePos(-20);   // Right-Top
  const p3 = getParticlePos(15);    // Right-Bottom
  const p4 = getParticlePos(50);    // Bottom-Right
  const p5 = getParticlePos(90);    // Bottom
  const p6 = getParticlePos(130);   // Bottom-Left
  const p7 = getParticlePos(165);   // Left-Bottom
  const p8 = getParticlePos(200);   // Left-Top
  const p9 = getParticlePos(235);   // Top-Left

  return (
    <Animated.View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          opacity,
        },
      ]}
    >
      {/* Shockwave Energy Ring */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Circle cx="50" cy="50" r="28" fill="none" stroke="#FDE047" strokeWidth="2.5" />
        </Svg>
      </Animated.View>

      {/* Center 4-Point Victory Star */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            transform: [{ scale: starScale }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size * 0.65} height={size * 0.65}>
          <Defs>
            <RadialGradient id="burstStarGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="40%" stopColor="#FEF08A" />
              <Stop offset="80%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#EA580C" />
            </RadialGradient>
          </Defs>
          <Path
            d="M 50 18 Q 50 50 18 50 Q 50 50 50 82 Q 50 50 82 50 Q 50 50 50 18 Z"
            fill="url(#burstStarGrad)"
          />
        </Svg>
      </Animated.View>

      {/* 10 Flying Confetti Particles */}
      {/* P0: Top Golden Diamond */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p0.x }, { translateY: p0.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Polygon points="7,1 13,7 7,13 1,7" fill="#FACC15" />
        </Svg>
      </Animated.View>

      {/* P1: Top-Right Emerald Star */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p1.x }, { translateY: p1.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx="7" cy="7" r="5" fill="#10B981" />
        </Svg>
      </Animated.View>

      {/* P2: Right Pink Ribbon */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p2.x }, { translateY: p2.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Rect x="2" y="4" width="10" height="6" rx="2.5" fill="#EC4899" transform="rotate(30 7 7)" />
        </Svg>
      </Animated.View>

      {/* P3: Right-Bottom Purple Diamond */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p3.x }, { translateY: p3.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Polygon points="7,2 12,7 7,12 2,7" fill="#8B5CF6" />
        </Svg>
      </Animated.View>

      {/* P4: Bottom-Right Sky Circle */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p4.x }, { translateY: p4.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx="7" cy="7" r="4.5" fill="#0EA5E9" />
        </Svg>
      </Animated.View>

      {/* P5: Bottom Gold Star */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p5.x }, { translateY: p5.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Polygon points="7,1 13,7 7,13 1,7" fill="#F59E0B" />
        </Svg>
      </Animated.View>

      {/* P6: Bottom-Left Emerald Ribbon */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p6.x }, { translateY: p6.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Rect x="2" y="4" width="10" height="6" rx="2.5" fill="#10B981" transform="rotate(-30 7 7)" />
        </Svg>
      </Animated.View>

      {/* P7: Left Violet Circle */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p7.x }, { translateY: p7.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx="7" cy="7" r="5" fill="#A855F7" />
        </Svg>
      </Animated.View>

      {/* P8: Left-Top Coral Diamond */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p8.x }, { translateY: p8.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Polygon points="7,2 12,7 7,12 2,7" fill="#F43F5E" />
        </Svg>
      </Animated.View>

      {/* P9: Top-Left Amber Glint */}
      <Animated.View style={[styles.sparkParticle, { transform: [{ translateX: p9.x }, { translateY: p9.y }] }]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx="7" cy="7" r="4.5" fill="#FEF08A" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

// -------------------------------------------------------------
// 3. TROPHY ACHIEVEMENT ANIMATION (Golden Trophy with Spinning Twinkles)
// -------------------------------------------------------------
export const TrophyAchievementVector: React.FC<{ size?: number; speed?: number }> = ({
  size = 48,
  speed = 1,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const starSpin = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const baseDuration = 1800 / speed;

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3.5,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(floatAnim, {
          toValue: 3.5,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const spin = Animated.loop(
      Animated.timing(starSpin, {
        toValue: 1,
        duration: baseDuration * 1.5,
        easing: Easing.linear,
        useNativeDriver: useNative,
      })
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: baseDuration * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    float.start();
    spin.start();
    glow.start();

    return () => {
      float.stop();
      spin.stop();
      glow.stop();
    };
  }, [speed]);

  const spinDeg = starSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.3],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
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
      {/* Golden Aura Glow */}
      <Animated.View
        style={[
          styles.fillCenter,
          {
            opacity: glowOpacity,
            transform: [{ scale: 1.15 }],
          },
        ]}
      >
        <Svg viewBox="0 0 100 100" width={size * 1.2} height={size * 1.2}>
          <Defs>
            <RadialGradient id="trophyHalo" cx="50%" cy="45%" r="45%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity={0.9} />
              <Stop offset="60%" stopColor="#F59E0B" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#D97706" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="45" r="45" fill="url(#trophyHalo)" />
        </Svg>
      </Animated.View>

      {/* Main Trophy Illustration */}
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="goldCupGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="30%" stopColor="#FACC15" />
            <Stop offset="70%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#B45309" />
          </LinearGradient>
          <LinearGradient id="goldBaseGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>
          <LinearGradient id="goldHandleGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>
        </Defs>

        {/* Ambient base shadow */}
        <Ellipse cx="50" cy="92" rx="26" ry="4.5" fill="rgba(0,0,0,0.3)" />

        {/* Pedestal Base */}
        <Path d="M 32 84 L 68 84 L 64 74 L 36 74 Z" fill="url(#goldBaseGrad)" />
        <Rect x="26" y="84" width="48" height="6.5" rx="2.5" fill="#78350F" />
        <Rect x="36" y="78" width="28" height="3" rx="1" fill="#FEF08A" opacity={0.6} />

        {/* Trophy Stem */}
        <Path d="M 44 63 L 56 63 L 54 74 L 46 74 Z" fill="url(#goldCupGrad)" />
        <Ellipse cx="50" cy="63" rx="9" ry="3" fill="#D97706" />

        {/* Left Sculpted Handle */}
        <Path
          d="M 32 28 C 12 28 12 54 34 54 C 33 48 33 36 32 28 Z"
          fill="none"
          stroke="url(#goldHandleGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Right Sculpted Handle */}
        <Path
          d="M 68 28 C 88 28 88 54 66 54 C 67 48 67 36 68 28 Z"
          fill="none"
          stroke="url(#goldHandleGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Main Trophy Cup Body */}
        <Path
          d="M 28 20 C 28 54 40 64 50 64 C 60 64 72 54 72 20 Z"
          fill="url(#goldCupGrad)"
        />
        {/* Top Rim */}
        <Ellipse cx="50" cy="20" rx="22" ry="5.5" fill="#FEF08A" />
        <Ellipse cx="50" cy="20" rx="19" ry="3.8" fill="#CA8A04" />

        {/* Star Badge on Trophy Cup */}
        <Path
          d="M 50 35 L 53 41.5 L 59 42 L 54.5 46.5 L 56 52.5 L 50 49 L 44 52.5 L 45.5 46.5 L 41 42 L 47 41.5 Z"
          fill="#FFFFFF"
        />

        {/* Shiny Highlight Glint */}
        <Path d="M 35 24 Q 37 46 44 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.65} />
      </Svg>

      {/* Spinning Twinkle Star 1 (Top Left) */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            top: -2,
            left: -2,
            transform: [{ rotate: spinDeg }, { scale: starScale }],
          },
        ]}
      >
        <Svg width={size * 0.32} height={size * 0.32} viewBox="0 0 20 20">
          <Path d="M 10 1 Q 10 10 1 10 Q 10 10 10 19 Q 10 10 19 10 Q 10 10 10 1 Z" fill="#FDE047" />
        </Svg>
      </Animated.View>

      {/* Spinning Twinkle Star 2 (Top Right) */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            top: 4,
            right: -2,
            transform: [{ rotate: spinDeg }, { scale: starScale }],
          },
        ]}
      >
        <Svg width={size * 0.26} height={size * 0.26} viewBox="0 0 20 20">
          <Path d="M 10 1 Q 10 10 1 10 Q 10 10 10 19 Q 10 10 19 10 Q 10 10 10 1 Z" fill="#FFFFFF" />
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
    outputRange: ['-4.5deg', '4.5deg'],
  });

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="pgPot2" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#9A3412" />
          </LinearGradient>
          <LinearGradient id="pgStem2" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#15803D" />
            <Stop offset="100%" stopColor="#4ADE80" />
          </LinearGradient>
          <LinearGradient id="pgLeaf2" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0%" stopColor="#16A34A" />
            <Stop offset="100%" stopColor="#86EFAC" />
          </LinearGradient>
        </Defs>

        {/* Base Terracotta Pot */}
        <Path d="M 32 68 L 38 88 Q 40 91 46 91 L 54 91 Q 60 91 62 88 L 68 68 Z" fill="url(#pgPot2)" />
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
          <Path d="M 50 68 Q 49 50 50 34" stroke="url(#pgStem2)" strokeWidth="4.2" strokeLinecap="round" fill="none" />

          {/* Left Leaf */}
          <Path d="M 50 48 C 36 42 34 54 44 58 C 48 58 50 52 50 48 Z" fill="url(#pgLeaf2)" />
          {/* Right Leaf */}
          <Path d="M 50 42 C 64 34 66 48 56 52 C 52 52 50 46 50 42 Z" fill="url(#pgLeaf2)" />

          {/* Blooming Pink Blossom with Golden Center */}
          <Circle cx="50" cy="30" r="5.5" fill="#EC4899" />
          <Circle cx="50" cy="30" r="2.5" fill="#FEF08A" />
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
    const baseDuration = 1200 / speed;

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
          toValue: -4,
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
    outputRange: ['-24deg', '28deg'],
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
          <RadialGradient id="mwFur2" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FB923C" />
            <Stop offset="70%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#C2410C" />
          </RadialGradient>
          <LinearGradient id="mwDark2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#451A03" />
            <Stop offset="100%" stopColor="#290E02" />
          </LinearGradient>
        </Defs>

        {/* Fluffy Body */}
        <Ellipse cx="60" cy="80" rx="28" ry="22" fill="url(#mwFur2)" />
        <Ellipse cx="60" cy="84" rx="16" ry="12" fill="url(#mwDark2)" />

        {/* Ears */}
        <Path d="M 36 44 L 24 20 Q 20 28 34 50 Z" fill="url(#mwFur2)" />
        <Path d="M 33 42 L 25 24 Q 22 30 31 46 Z" fill="#FFFFFF" />

        <Path d="M 84 44 L 96 20 Q 100 28 86 50 Z" fill="url(#mwFur2)" />
        <Path d="M 87 42 L 95 24 Q 98 30 89 46 Z" fill="#FFFFFF" />

        {/* Round Head */}
        <Ellipse cx="60" cy="52" rx="28" ry="24" fill="url(#mwFur2)" />

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
        <Ellipse cx="42" cy="57" rx="3.5" ry="2" fill="#F43F5E" opacity={0.65} />
        <Ellipse cx="78" cy="57" rx="3.5" ry="2" fill="#F43F5E" opacity={0.65} />

        {/* Left Resting Paw */}
        <Ellipse cx="45" cy="92" rx="7" ry="5.5" fill="url(#mwDark2)" />
      </Svg>

      {/* Animated Waving Right Paw */}
      <Animated.View
        style={[
          styles.sparkParticle,
          {
            right: size * 0.1,
            top: size * 0.36,
            transform: [{ rotate: pawRotate }],
          },
        ]}
      >
        <Svg width={size * 0.34} height={size * 0.34} viewBox="0 0 30 30">
          <Ellipse cx="15" cy="15" rx="9" ry="7" fill="#451A03" />
          <Circle cx="12" cy="13" r="2.2" fill="#FDE047" opacity={0.9} />
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
    const baseDuration = 2800 / speed;

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
        duration: baseDuration * 0.75,
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
    outputRange: [0.7, 1.3],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.85, 0.5, 0],
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
          <Ellipse cx="50" cy="65" rx="36" ry="12" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6 4" opacity={0.7} />
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
            <LinearGradient id="zenLotus2" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#C084FC" />
              <Stop offset="60%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#FBCFE8" />
            </LinearGradient>
            <RadialGradient id="zenGlow2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity={0.95} />
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
          <Path d="M 36 65 C 28 44 46 32 50 56 Z" fill="url(#zenLotus2)" />
          <Path d="M 64 65 C 72 44 54 32 50 56 Z" fill="url(#zenLotus2)" />

          {/* Center Main Sacred Petal */}
          <Path d="M 50 66 C 42 40 50 22 50 22 C 50 22 58 40 50 66 Z" fill="url(#zenLotus2)" />

          {/* Golden Spiritual Core */}
          <Circle cx="50" cy="52" r="8" fill="url(#zenGlow2)" />
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
    overflow: 'visible',
  },
  fillCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  sparkParticle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
