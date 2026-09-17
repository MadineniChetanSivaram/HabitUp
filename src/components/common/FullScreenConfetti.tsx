import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { useHabit } from '../../context/HabitContext';

const useNative = Platform.OS !== 'web';

const CONFETTI_COLORS = [
  '#FACC15', // Gold
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#059669', // Mint
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#6366F1', // Indigo
  '#0EA5E9', // Sky Blue
  '#F43F5E', // Coral Red
  '#FEF08A', // Pale Gold
];

interface ConfettiPieceConfig {
  id: number;
  startX: number; // percentage (0 - 100)
  color: string;
  width: number;
  height: number;
  shape: 'rect' | 'square' | 'circle' | 'star' | 'ribbon' | 'diamond';
  swayDistance: number;
  duration: number;
  delay: number;
  totalRotations: number;
  isCannonLeft?: boolean;
  isCannonRight?: boolean;
}

const generateConfettiPieces = (count: number = 60): ConfettiPieceConfig[] => {
  const pieces: ConfettiPieceConfig[] = [];

  for (let i = 0; i < count; i++) {
    const isCannon = i < 24; // 24 pieces shoot from bottom-left / bottom-right cannons
    const isCannonLeft = isCannon && i % 2 === 0;
    const isCannonRight = isCannon && i % 2 === 1;

    const shapes: ConfettiPieceConfig['shape'][] = [
      'rect',
      'rect',
      'square',
      'circle',
      'star',
      'ribbon',
      'diamond',
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    const width = shape === 'ribbon' ? 5 : shape === 'star' ? 14 : shape === 'circle' ? 8 : 8 + Math.random() * 7;
    const height = shape === 'ribbon' ? 18 + Math.random() * 8 : shape === 'circle' ? 8 : shape === 'star' ? 14 : 7 + Math.random() * 8;

    pieces.push({
      id: i,
      startX: isCannonLeft ? 10 + Math.random() * 15 : isCannonRight ? 75 + Math.random() * 15 : Math.random() * 96 + 2,
      color,
      width,
      height,
      shape,
      swayDistance: (Math.random() - 0.5) * 80,
      duration: 2000 + Math.random() * 1200,
      delay: Math.random() * 350,
      totalRotations: 3 + Math.floor(Math.random() * 4),
      isCannonLeft,
      isCannonRight,
    });
  }

  return pieces;
};

const ConfettiParticle: React.FC<{
  config: ConfettiPieceConfig;
  screenHeight: number;
  screenWidth: number;
  active: boolean;
}> = ({ config, screenHeight, screenWidth, active }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      anim.setValue(0);
      return;
    }

    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: config.duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: useNative,
      }).start();
    }, config.delay);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  // Y trajectory: cannons burst upwards first then fall down; rain drops from top
  const translateY = anim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: config.isCannonLeft || config.isCannonRight
      ? [screenHeight * 0.75, screenHeight * 0.15 + (config.id % 5) * 20, screenHeight + 60]
      : [-40, screenHeight * 0.3, screenHeight + 60],
  });

  // X trajectory: cannons shoot inward; rain sways sinusoidally
  const translateX = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: config.isCannonLeft
      ? [0, screenWidth * 0.25, screenWidth * 0.35 + config.swayDistance, screenWidth * 0.38 + config.swayDistance]
      : config.isCannonRight
      ? [0, -screenWidth * 0.25, -screenWidth * 0.35 + config.swayDistance, -screenWidth * 0.38 + config.swayDistance]
      : [0, config.swayDistance * 0.6, -config.swayDistance * 0.4, config.swayDistance],
  });

  // Spin rotation
  const rotateZ = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${config.totalRotations * 360}deg`],
  });

  const rotateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${config.totalRotations * 540}deg`],
  });

  // Fade out towards the end
  const opacity = anim.interpolate({
    inputRange: [0, 0.08, 0.75, 1],
    outputRange: [0, 1, 0.9, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0.3, 1, 1, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${config.startX}%`,
          top: 0,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotateZ },
            { rotateX },
            { scale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {config.shape === 'star' ? (
        <Svg width={config.width} height={config.height} viewBox="0 0 20 20">
          <Path
            d="M 10 2 L 12.5 7.5 L 18 8.2 L 14 12 L 15 17.5 L 10 14.8 L 5 17.5 L 6 12 L 2 8.2 L 7.5 7.5 Z"
            fill={config.color}
          />
        </Svg>
      ) : config.shape === 'circle' ? (
        <View
          style={{
            width: config.width,
            height: config.height,
            borderRadius: config.width / 2,
            backgroundColor: config.color,
          }}
        />
      ) : config.shape === 'diamond' ? (
        <Svg width={config.width} height={config.height} viewBox="0 0 14 14">
          <Polygon points="7,1 13,7 7,13 1,7" fill={config.color} />
        </Svg>
      ) : (
        <View
          style={{
            width: config.width,
            height: config.height,
            borderRadius: config.shape === 'ribbon' ? 2 : 1.5,
            backgroundColor: config.color,
          }}
        />
      )}
    </Animated.View>
  );
};

export const FullScreenConfetti: React.FC = () => {
  const { isConfettiActive } = useHabit();
  const { width, height } = useWindowDimensions();
  const [pieces, setPieces] = useState<ConfettiPieceConfig[]>([]);

  useEffect(() => {
    if (isConfettiActive) {
      setPieces(generateConfettiPieces(65));
    }
  }, [isConfettiActive]);

  if (!isConfettiActive && pieces.length === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiParticle
          key={piece.id}
          config={piece}
          screenHeight={height}
          screenWidth={width}
          active={isConfettiActive}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999999,
    elevation: 999999,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
});
