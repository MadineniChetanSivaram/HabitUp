import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import lottie from 'lottie-web';
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
    const webContainerRef = useRef<any>(null);
    const animInstanceRef = useRef<any>(null);

    // Resolve JSON data
    const animationData =
      typeof source === 'string' && source in LOTTIE_ANIMATIONS
        ? LOTTIE_ANIMATIONS[source as LottieAnimationKey]
        : typeof source === 'object'
        ? source
        : LOTTIE_ANIMATIONS.streakFlame;

    // Imperative ref methods
    useImperativeHandle(ref, () => ({
      play: () => {
        if (animInstanceRef.current?.play) {
          animInstanceRef.current.play();
        }
      },
      pause: () => {
        if (animInstanceRef.current?.pause) {
          animInstanceRef.current.pause();
        }
      },
      reset: () => {
        if (animInstanceRef.current?.goToAndPlay) {
          animInstanceRef.current.goToAndPlay(0, true);
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      // Platform: WEB
      if (Platform.OS === 'web' && webContainerRef.current) {
        // Destroy any previous instance in container
        if (animInstanceRef.current) {
          try {
            animInstanceRef.current.destroy();
          } catch {}
        }

        try {
          const anim = lottie.loadAnimation({
            container: webContainerRef.current,
            renderer: 'svg',
            loop,
            autoplay: autoPlay,
            animationData,
          });

          anim.setSpeed(speed);

          if (onAnimationFinish) {
            anim.addEventListener('complete', () => {
              if (isMounted && onAnimationFinish) onAnimationFinish();
            });
          }

          animInstanceRef.current = anim;
        } catch (err) {
          console.warn('Lottie web load error:', err);
        }
      }

      return () => {
        isMounted = false;
        if (animInstanceRef.current) {
          try {
            animInstanceRef.current.destroy();
          } catch {}
          animInstanceRef.current = null;
        }
      };
    }, [animationData, loop, autoPlay, speed]);

    const sizeStyle: ViewStyle = size ? { width: size, height: size } : {};

    // Web Render: uses native div container with lottie-web SVG renderer
    if (Platform.OS === 'web') {
      return (
        <View style={[styles.container, sizeStyle, style]}>
          <div
            ref={webContainerRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          />
        </View>
      );
    }

    // Native Mobile Render (Android / iOS): uses lottie-react-native
    try {
      const LottieView = require('lottie-react-native').default;
      return (
        <View style={[styles.container, sizeStyle, style]}>
          <LottieView
            source={animationData}
            autoPlay={autoPlay}
            loop={loop}
            speed={speed}
            style={[StyleSheet.absoluteFill, sizeStyle]}
            onAnimationFinish={onAnimationFinish}
          />
        </View>
      );
    } catch {
      return <View style={[styles.container, sizeStyle, style]} />;
    }
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
