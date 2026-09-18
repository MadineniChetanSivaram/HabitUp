import { Platform } from 'react-native';
import { Audio } from 'expo-av';

/**
 * Sound Service powered by expo-av for native Android & iOS,
 * and Web Audio API for Web browsers.
 */
class SoundService {
  private isAudioModeConfigured = false;
  private audioCtx: any = null;

  private async ensureAudioMode(): Promise<void> {
    if (this.isAudioModeConfigured) return;
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
      this.isAudioModeConfigured = true;
    } catch {
      // ignore
    }
  }

  /**
   * Plays the rewarding completion harmonic chime
   */
  async playCompletionChime(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        this.playWebChime();
        return;
      }

      // Native Mobile (Android & iOS)
      await this.ensureAudioMode();

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/chime.wav'),
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      if (Platform.OS === 'web') {
        this.playWebChime();
      }
    }
  }

  private playWebChime(): void {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const notes = [
          { freq: 587.33, start: 0, dur: 0.35, gain: 0.28 },   // D5
          { freq: 880.0, start: 0.08, dur: 0.4, gain: 0.34 },  // A5
          { freq: 1174.66, start: 0.16, dur: 0.5, gain: 0.42 }, // D6
        ];

        notes.forEach(({ freq, start, dur, gain: targetGain }) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          // 2nd Harmonic for bright sparkle
          const overtone = ctx.createOscillator();
          const overtoneGain = ctx.createGain();
          overtone.type = 'sine';
          overtone.frequency.setValueAtTime(freq * 2, now + start);
          overtoneGain.gain.setValueAtTime(targetGain * 0.25, now + start);
          overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur * 0.6);

          gainNode.gain.setValueAtTime(0.0001, now + start);
          gainNode.gain.linearRampToValueAtTime(targetGain, now + start + 0.015);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          overtone.connect(overtoneGain);
          overtoneGain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
          overtone.start(now + start);
          overtone.stop(now + start + dur);
        });
      }
    } catch {
      // ignore
    }
  }

  playClickSound(): void {
    if (Platform.OS === 'web') {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!this.audioCtx || this.audioCtx.state === 'closed') {
            this.audioCtx = new AudioContextClass();
          }
          const ctx = this.audioCtx;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Plays cute, high-pitched red panda vocalizations & sound effects
   * mapped to habit progress stages & facial expressions.
   */
  playMascotCuteSound(
    type: 'wake' | 'sleepy' | 'happy' | 'starry' | 'wink' | 'love' | 'feast' | 'cheer' | 'playful'
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'wake' || type === 'sleepy') {
        // Sleepy wakeup purr & sweet yawn chirp (~480Hz -> 680Hz -> 520Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.29);
      } else if (type === 'happy' || type === 'playful') {
        // Cheerful double panda chirp (tweep-tweep!)
        const chirps = [
          { freqStart: 1100, freqEnd: 1650, start: 0, dur: 0.07, gainVal: 0.22 },
          { freqStart: 1350, freqEnd: 1950, start: 0.09, dur: 0.09, gainVal: 0.26 },
        ];

        chirps.forEach(({ freqStart, freqEnd, start, dur, gainVal }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freqStart, now + start);
          osc.frequency.exponentialRampToValueAtTime(freqEnd, now + start + dur * 0.85);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      } else if (type === 'wink') {
        // Playful upward bounce squeak
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(1750, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'starry' || type === 'cheer') {
        // Sparkly high-pitched 3-tone trill (C6 -> E6 -> A6 + sparkle overtone)
        const tones = [
          { freq: 1046.5, start: 0, dur: 0.07, gainVal: 0.22 },
          { freq: 1318.5, start: 0.06, dur: 0.08, gainVal: 0.25 },
          { freq: 1760.0, start: 0.13, dur: 0.14, gainVal: 0.28 },
        ];

        tones.forEach(({ freq, start, dur, gainVal }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      } else if (type === 'love') {
        // Sweet melodic warm bell purr
        const notes = [
          { freq: 880.0, start: 0, dur: 0.14, gainVal: 0.20 },
          { freq: 1174.66, start: 0.08, dur: 0.22, gainVal: 0.24 },
        ];
        notes.forEach(({ freq, start, dur, gainVal }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      } else if (type === 'feast') {
        // Bamboo crunch munch sound pops + victory chime celebration!
        // 1. Two rapid crunch-pops (woody munch texture)
        const munchPops = [0, 0.11];
        munchPops.forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now + offset);
          osc.frequency.exponentialRampToValueAtTime(220, now + offset + 0.05);

          gain.gain.setValueAtTime(0.22, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.06);
        });

        // 2. High victory harmonic sparkle chime
        const fanfares = [
          { freq: 1046.5, start: 0.18, dur: 0.14, gainVal: 0.22 },
          { freq: 1318.5, start: 0.26, dur: 0.16, gainVal: 0.25 },
          { freq: 1567.98, start: 0.35, dur: 0.18, gainVal: 0.28 },
          { freq: 2093.0, start: 0.44, dur: 0.32, gainVal: 0.32 },
        ];

        fanfares.forEach(({ freq, start, dur, gainVal }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(gainVal, now + start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      }
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();
