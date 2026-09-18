import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type MascotSoundType =
  | 'wake'
  | 'squeak'
  | 'happy'
  | 'feast'
  | 'munch'
  | 'starry'
  | 'love'
  | 'wink'
  | 'playful'
  | 'trill';

/**
 * Sound Service powered by expo-av for native Android & iOS,
 * and Web Audio API for Web browsers and responsive procedural synthesis.
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

  private getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
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
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, start: 0, dur: 0.35, gain: 0.28 }, // D5
        { freq: 880.0, start: 0.08, dur: 0.4, gain: 0.34 }, // A5
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
    } catch {
      // ignore
    }
  }

  /**
   * Plays snappy click sound for UI buttons
   */
  playClickSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
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
    } catch {
      // ignore
    }
  }

  /**
   * Plays an assortment of ultra-cute, adorable Red Panda vocalizations & squeaks!
   * Types:
   * - 'wake': Sleepy yawning squeak & sparkle waking up from nap 😴 -> ☀️
   * - 'feast' | 'munch': Crunchy rhythmic bamboo eating chops & nom nom squeaks 🎋😋
   * - 'happy' | 'squeak': Classic high cheerful red panda chirp-squeak 🐾
   * - 'starry': Magical ascending arpeggio trill ✨
   * - 'love': Heartwarming sweet affectionate coo 💖
   * - 'wink': Playful bubbly cheeky boop 😉
   * - 'playful': Bouncy double peep chirp 🐥
   * - 'trill': Musical flutter giggle 🎶
   */
  playMascotCuteSound(soundType: MascotSoundType | string = 'happy'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (soundType) {
        case 'wake': {
          // Sleepy Yawn glide (380Hz -> 760Hz -> 540Hz) + Morning sparkle
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(760, now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(540, now + 0.32);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);

          // Awakening sparkle chime at tail
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.type = 'sine';
          sOsc.frequency.setValueAtTime(1480, now + 0.16);
          sOsc.frequency.exponentialRampToValueAtTime(2180, now + 0.30);
          sGain.gain.setValueAtTime(0.0001, now + 0.16);
          sGain.gain.linearRampToValueAtTime(0.18, now + 0.18);
          sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
          sOsc.connect(sGain);
          sGain.connect(ctx.destination);
          sOsc.start(now + 0.16);
          sOsc.stop(now + 0.32);
          break;
        }

        case 'feast':
        case 'munch': {
          // 2 crunchy bamboo bites + delicious swallow nom chirp
          const playCrunch = (offset: number, startFreq: number, endFreq: number) => {
            const cOsc = ctx.createOscillator();
            const cGain = ctx.createGain();
            cOsc.type = 'triangle';
            cOsc.frequency.setValueAtTime(startFreq, now + offset);
            cOsc.frequency.exponentialRampToValueAtTime(endFreq, now + offset + 0.035);
            cGain.gain.setValueAtTime(0.26, now + offset);
            cGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.04);
            cOsc.connect(cGain);
            cGain.connect(ctx.destination);
            cOsc.start(now + offset);
            cOsc.stop(now + offset + 0.04);
          };

          playCrunch(0, 420, 180);
          playCrunch(0.085, 490, 210);

          // Nom chirp
          const nOsc = ctx.createOscillator();
          const nGain = ctx.createGain();
          nOsc.type = 'sine';
          nOsc.frequency.setValueAtTime(880, now + 0.17);
          nOsc.frequency.exponentialRampToValueAtTime(1420, now + 0.28);
          nGain.gain.setValueAtTime(0.0001, now + 0.17);
          nGain.gain.linearRampToValueAtTime(0.25, now + 0.185);
          nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
          nOsc.connect(nGain);
          nGain.connect(ctx.destination);
          nOsc.start(now + 0.17);
          nOsc.stop(now + 0.32);
          break;
        }

        case 'starry': {
          // Magical ascending arpeggio trill (C6 -> E6 -> G6 -> C7)
          const notes = [1046.5, 1318.5, 1567.98, 2093.0];
          notes.forEach((freq, idx) => {
            const tOsc = ctx.createOscillator();
            const tGain = ctx.createGain();
            const start = now + idx * 0.042;
            tOsc.type = 'sine';
            tOsc.frequency.setValueAtTime(freq, start);
            tGain.gain.setValueAtTime(0.0001, start);
            tGain.gain.linearRampToValueAtTime(0.20, start + 0.01);
            tGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
            tOsc.connect(tGain);
            tGain.connect(ctx.destination);
            tOsc.start(start);
            tOsc.stop(start + 0.15);
          });
          break;
        }

        case 'love': {
          // Sweet gentle coo (E5 -> A5 and C6 -> E6)
          const lOsc1 = ctx.createOscillator();
          const lGain1 = ctx.createGain();
          lOsc1.type = 'sine';
          lOsc1.frequency.setValueAtTime(659.25, now);
          lOsc1.frequency.exponentialRampToValueAtTime(880, now + 0.13);
          lGain1.gain.setValueAtTime(0.0001, now);
          lGain1.gain.linearRampToValueAtTime(0.24, now + 0.02);
          lGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          lOsc1.connect(lGain1);
          lGain1.connect(ctx.destination);
          lOsc1.start(now);
          lOsc1.stop(now + 0.22);

          const lOsc2 = ctx.createOscillator();
          const lGain2 = ctx.createGain();
          lOsc2.type = 'triangle';
          lOsc2.frequency.setValueAtTime(1046.5, now + 0.065);
          lOsc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.20);
          lGain2.gain.setValueAtTime(0.0001, now + 0.065);
          lGain2.gain.linearRampToValueAtTime(0.18, now + 0.085);
          lGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          lOsc2.connect(lGain2);
          lGain2.connect(ctx.destination);
          lOsc2.start(now + 0.065);
          lOsc2.stop(now + 0.25);
          break;
        }

        case 'wink': {
          // Playful cheeky boop (580Hz -> 1380Hz -> 980Hz)
          const wOsc = ctx.createOscillator();
          const wGain = ctx.createGain();
          wOsc.type = 'sine';
          wOsc.frequency.setValueAtTime(580, now);
          wOsc.frequency.exponentialRampToValueAtTime(1380, now + 0.075);
          wOsc.frequency.exponentialRampToValueAtTime(980, now + 0.13);
          wGain.gain.setValueAtTime(0.0001, now);
          wGain.gain.linearRampToValueAtTime(0.28, now + 0.015);
          wGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
          wOsc.connect(wGain);
          wGain.connect(ctx.destination);
          wOsc.start(now);
          wOsc.stop(now + 0.14);
          break;
        }

        case 'playful': {
          // Bouncy double peep chirp
          const p1Osc = ctx.createOscillator();
          const p1Gain = ctx.createGain();
          p1Osc.type = 'sine';
          p1Osc.frequency.setValueAtTime(880, now);
          p1Osc.frequency.exponentialRampToValueAtTime(1260, now + 0.055);
          p1Gain.gain.setValueAtTime(0.22, now);
          p1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
          p1Osc.connect(p1Gain);
          p1Gain.connect(ctx.destination);
          p1Osc.start(now);
          p1Osc.stop(now + 0.065);

          const p2Osc = ctx.createOscillator();
          const p2Gain = ctx.createGain();
          p2Osc.type = 'sine';
          p2Osc.frequency.setValueAtTime(1180, now + 0.07);
          p2Osc.frequency.exponentialRampToValueAtTime(1680, now + 0.14);
          p2Gain.gain.setValueAtTime(0.26, now + 0.07);
          p2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          p2Osc.connect(p2Gain);
          p2Gain.connect(ctx.destination);
          p2Osc.start(now + 0.07);
          p2Osc.stop(now + 0.15);
          break;
        }

        case 'trill': {
          // Musical flutter giggle
          const notes = [784.0, 987.77, 1318.5, 1760.0];
          notes.forEach((freq, idx) => {
            const trOsc = ctx.createOscillator();
            const trGain = ctx.createGain();
            const start = now + idx * 0.035;
            trOsc.type = 'triangle';
            trOsc.frequency.setValueAtTime(freq, start);
            trGain.gain.setValueAtTime(0.0001, start);
            trGain.gain.linearRampToValueAtTime(0.22, start + 0.01);
            trGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
            trOsc.connect(trGain);
            trGain.connect(ctx.destination);
            trOsc.start(start);
            trOsc.stop(start + 0.12);
          });
          break;
        }

        case 'happy':
        case 'squeak':
        default: {
          // Classic High Panda Squeak ("Pui! 🐾")
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.type = 'sine';
          sOsc.frequency.setValueAtTime(740, now);
          sOsc.frequency.exponentialRampToValueAtTime(1420, now + 0.045);
          sOsc.frequency.exponentialRampToValueAtTime(1020, now + 0.12);

          // Harmonic overtone for plushie squeak warmth
          const oOsc = ctx.createOscillator();
          const oGain = ctx.createGain();
          oOsc.type = 'triangle';
          oOsc.frequency.setValueAtTime(1480, now);
          oOsc.frequency.exponentialRampToValueAtTime(2840, now + 0.045);
          oOsc.frequency.exponentialRampToValueAtTime(2040, now + 0.12);
          oGain.gain.setValueAtTime(0.08, now);
          oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          sGain.gain.setValueAtTime(0.0001, now);
          sGain.gain.linearRampToValueAtTime(0.30, now + 0.012);
          sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

          sOsc.connect(sGain);
          sGain.connect(ctx.destination);
          oOsc.connect(oGain);
          oGain.connect(ctx.destination);

          sOsc.start(now);
          sOsc.stop(now + 0.13);
          oOsc.start(now);
          oOsc.stop(now + 0.13);
          break;
        }
      }
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();
