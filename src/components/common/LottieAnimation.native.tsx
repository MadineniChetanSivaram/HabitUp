import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LottieView from 'lottie-react-native';
import { LOTTIE_ANIMATIONS, LottieAnimationKey } from '../../assets/animations';

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
      size,
    },
    ref
  ) => {
    const lottieRef = useRef<LottieView>(null);

    const animationData =
      typeof source === 'string' && source in LOTTIE_ANIMATIONS
        ? LOTTIE_ANIMATIONS[source as LottieAnimationKey]
        : typeof source === 'object'
        ? source
        : LOTTIE_ANIMATIONS.streakFlame;

    useImperativeHandle(ref, () => ({
      play: () => {
        lottieRef.current?.play();
      },
      pause: () => {
        lottieRef.current?.pause();
      },
      reset: () => {
        lottieRef.current?.reset();
      },
    }));

    const sizeStyle: ViewStyle = size ? { width: size, height: size } : {};

    return (
      <View style={[styles.container, sizeStyle, style]}>
        <LottieView
          ref={lottieRef}
          source={animationData}
          autoPlay={autoPlay}
          loop={loop}
          speed={speed}
          style={[StyleSheet.absoluteFill, sizeStyle]}
          onAnimationFinish={onAnimationFinish}
        />
      </View>
    );
  }
);

LottieAnimation.displayName = 'LottieAnimation';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
