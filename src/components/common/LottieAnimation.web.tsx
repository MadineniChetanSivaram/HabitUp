import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
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
    const webContainerRef = useRef<HTMLDivElement | null>(null);
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
        try {
          animInstanceRef.current?.play();
        } catch {}
      },
      pause: () => {
        try {
          animInstanceRef.current?.pause();
        } catch {}
      },
      reset: () => {
        try {
          animInstanceRef.current?.goToAndPlay(0, true);
        } catch {}
      },
    }));

    useEffect(() => {
      let isMounted = true;
      const container = webContainerRef.current;
      if (!container) return;

      // Clean up previous instance
      if (animInstanceRef.current) {
        try {
          animInstanceRef.current.destroy();
        } catch {}
        animInstanceRef.current = null;
      }
      container.innerHTML = '';

      try {
        const lottieLib = (window as any)?.lottie || (lottie as any)?.default || lottie;
        if (lottieLib && typeof lottieLib.loadAnimation === 'function') {
          // MUST deep clone animationData because lottie-web mutates the object in place
          const clonedData = JSON.parse(JSON.stringify(animationData));

          const anim = lottieLib.loadAnimation({
            container,
            renderer: 'svg',
            loop,
            autoplay: autoPlay,
            animationData: clonedData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet',
              clearCanvas: true,
              progressiveLoad: true,
              hideOnTransparent: true,
            },
          });

          if (speed !== 1) {
            anim.setSpeed(speed);
          }

          if (onAnimationFinish) {
            anim.addEventListener('complete', () => {
              if (isMounted && onAnimationFinish) onAnimationFinish();
            });
          }

          animInstanceRef.current = anim;
        }
      } catch (err) {
        console.warn('Lottie web animation error:', err);
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

    const sizeStyle: ViewStyle = size ? { width: size, height: size } : { width: '100%', height: '100%' };

    return (
      <View style={[styles.container, sizeStyle, style]}>
        <div
          ref={webContainerRef}
          style={{
            width: size ? `${size}px` : '100%',
            height: size ? `${size}px` : '100%',
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
);

LottieAnimation.displayName = 'LottieAnimation';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
