import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { LottieAnimation } from '../common/LottieAnimation';

interface HabitlyMascotProps {
  onClick?: () => void;
  size?: number;
}

export const HabitlyMascot: React.FC<HabitlyMascotProps> = ({ onClick, size = 110 }) => {
  const { theme } = useHabit();
  const isDark = theme === 'dark';

  // 1. Mascot Floating Loop
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 2. Stars Pulsating Loops (Dark mode)
  const star1 = useRef(new Animated.Value(0.3)).current;
  const star2 = useRef(new Animated.Value(0.4)).current;
  const star3 = useRef(new Animated.Value(0.2)).current;
  const star4 = useRef(new Animated.Value(0.5)).current;

  // 3. Sun Radiant Glow Pulse (Light mode)
  const sunGlowAnim = useRef(new Animated.Value(0.75)).current;
  const sunGlowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle Floating Animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // Twinkling Star 1
    const star1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(star1, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(star1, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    star1Loop.start();

    // Twinkling Star 2
    const star2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(star2, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(star2, {
          toValue: 0.2,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    star2Loop.start();

    // Twinkling Star 3
    const star3Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(star3, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(star3, {
          toValue: 0.1,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    star3Loop.start();

    // Twinkling Star 4
    const star4Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(star4, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(star4, {
          toValue: 0.4,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    star4Loop.start();

    // Sun Luminous Breathing Glow
    const sunGlowLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sunGlowAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sunGlowScale, {
            toValue: 1.1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sunGlowAnim, {
            toValue: 0.65,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sunGlowScale, {
            toValue: 0.98,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    sunGlowLoop.start();

    return () => {
      floatLoop.stop();
      star1Loop.stop();
      star2Loop.stop();
      star3Loop.stop();
      star4Loop.stop();
      sunGlowLoop.stop();
    };
  }, []);

  const AnimatedView = Animated.View as any;

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.85}
      style={styles.container}
    >
      {/* 1. Dark Mode Twinkling Stars */}
      {isDark && (
        <>
          <AnimatedView
            style={[
              styles.star,
              {
                top: 4,
                left: 6,
                opacity: star1,
                transform: [{ scale: star1 }],
              },
            ]}
          >
            <Text style={{ color: '#FDE047', fontSize: 13, fontWeight: '900' }}>✦</Text>
          </AnimatedView>

          <AnimatedView
            style={[
              styles.star,
              {
                top: 20,
                left: 18,
                opacity: star2,
                transform: [{ scale: star2 }],
              },
            ]}
          >
            <Text style={{ color: '#67E8F9', fontSize: 10, fontWeight: '900' }}>★</Text>
          </AnimatedView>

          <AnimatedView
            style={[
              styles.star,
              {
                top: 6,
                right: 12,
                opacity: star3,
                transform: [{ scale: star3 }],
              },
            ]}
          >
            <Text style={{ color: '#FEF08A', fontSize: 11, fontWeight: '900' }}>✦</Text>
          </AnimatedView>

          <AnimatedView
            style={[
              styles.star,
              {
                top: 26,
                right: 22,
                opacity: star4,
                transform: [{ scale: star4 }],
              },
            ]}
          >
            <Text style={{ color: '#F472B6', fontSize: 9, fontWeight: '900' }}>★</Text>
          </AnimatedView>
        </>
      )}

      {/* 2. Light Mode Radiant Sun Glow */}
      {!isDark && (
        <AnimatedView
          style={[
            styles.sunAuraGlowDisk,
            {
              opacity: sunGlowAnim,
              transform: [{ scale: sunGlowScale }],
            },
          ]}
        />
      )}

      {/* 3. Floating Animated Lottie Mascot */}
      <AnimatedView
        style={{
          transform: [{ translateY: floatAnim }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LottieAnimation source="mascotWaving" size={size} />
      </AnimatedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 125,
    width: 140,
    position: 'relative',
    overflow: 'visible',
  },
  sunAuraGlowDisk: {
    position: 'absolute',
    top: 14,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(251, 191, 36, 0.22)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
    shadowOpacity: 0.7,
    elevation: 8,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    zIndex: 2,
  },
});
