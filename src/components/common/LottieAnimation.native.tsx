import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LottieAnimationKey } from '../../assets/animations';
import {
  StreakFlameVector,
  CelebrationBurstVector,
  TrophyAchievementVector,
  PlantGrowingVector,
  MascotWavingVector,
  ZenMeditationVector,
} from './VectorAnimations';

export interface LottieAnimationProps {
  /** Name of the built-in animation or custom animation object */
  source?: LottieAnimationKey | any;
  /** Loop animation continuously */
  loop?: boolean;
  /** Play automatically on mount */
  autoPlay?: boolean;
  /** Playback speed (1 = normal) */
  speed?: number;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Callback when animation completes one cycle (non-looping) */
  onAnimationFinish?: () => void;
  /** Width / Height shorthand */
  size?: number;
}

export interface LottieAnimationRef {
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export const LottieAnimation = forwardRef<LottieAnimationRef, LottieAnimationProps>(
  (
    {
      source = 'streakFlame',
      loop = true,
      autoPlay = true,
      speed = 1,
      style,
      onAnimationFinish,
      size = 48,
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      play: () => {},
      pause: () => {},
      reset: () => {},
    }));

    const key = typeof source === 'string' ? source : 'streakFlame';

    const renderContent = () => {
      switch (key) {
        case 'streakFlame':
          return <StreakFlameVector size={size} speed={speed} />;
        case 'celebrationBurst':
          return (
            <CelebrationBurstVector
              size={size}
              loop={loop}
              onAnimationFinish={onAnimationFinish}
            />
          );
        case 'trophyAchievement':
          return <TrophyAchievementVector size={size} speed={speed} />;
        case 'plantGrowing':
          return <PlantGrowingVector size={size} speed={speed} />;
        case 'mascotWaving':
          return <MascotWavingVector size={size} speed={speed} />;
        case 'zenMeditation':
          return <ZenMeditationVector size={size} speed={speed} />;
        default:
          return <StreakFlameVector size={size} speed={speed} />;
      }
    };

    const containerSizeStyle: ViewStyle = { width: size, height: size };

    return (
      <View style={[styles.container, containerSizeStyle, style]}>
        {renderContent()}
      </View>
    );
  }
);

LottieAnimation.displayName = 'LottieAnimation';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
});
