import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type MascotSoundType =
  | 'sad_whimper'
  | 'sleepy_yawn'
  | 'happy_bleat'
  | 'half_done_chirp'
  | 'excited_twitter'
  | 'bamboo_crunch'
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
 * and Web Audio API with bio-acoustic formant synthesis for genuine animal vocalizations.
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

  private createPinkNoiseBuffer(ctx: any, duration = 0.5): any {
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = lastOut * 0.88 + white * 0.12;
        data[i] = lastOut * 1.5;
      }
      return buffer;
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
   * Plays authentic bio-acoustic Red Panda animal vocalizations!
   * Formants + glottal pulses + vocal tract resonances + breath dynamics.
   */
  playMascotCuteSound(soundType: MascotSoundType | string = 'happy_bleat'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (soundType) {
        // 🥺 Sad Whimper Bleat (0 Habits Done / Pouting / Inactive)
        case 'sad_whimper': {
          const dur = 0.38;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(420, now + dur);

          const f1 = ctx.createBiquadFilter();
          f1.type = 'bandpass';
          f1.frequency.setValueAtTime(700, now);
          f1.frequency.exponentialRampToValueAtTime(480, now + dur);
          f1.Q.setValueAtTime(5.0, now);

          const f2 = ctx.createBiquadFilter();
          f2.type = 'bandpass';
          f2.frequency.setValueAtTime(1450, now);
          f2.frequency.exponentialRampToValueAtTime(1050, now + dur);
          f2.Q.setValueAtTime(4.5, now);

          // Throat tremolo
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(6.5, now);
          lfoGain.gain.setValueAtTime(18, now);
          lfo.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + dur);

          // Breath airiness
          const noiseBuffer = this.createPinkNoiseBuffer(ctx, dur);
          if (noiseBuffer) {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(800, now);
            noiseFilter.Q.setValueAtTime(3.0, now);
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.05);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + dur);
          }

          oscGain.gain.setValueAtTime(0.001, now);
          oscGain.gain.linearRampToValueAtTime(0.24, now + 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(f1);
          osc.connect(f2);
          f1.connect(oscGain);
          f2.connect(oscGain);
          oscGain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + dur);
          break;
        }

        // 🥱 Sleepy Yawn & Snuffle (Waking Up)
        case 'wake':
        case 'sleepy_yawn': {
          const dur = 0.45;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.22);
          osc.frequency.exponentialRampToValueAtTime(460, now + dur);

          const f1 = ctx.createBiquadFilter();
          f1.type = 'bandpass';
          f1.frequency.setValueAtTime(600, now);
          f1.frequency.exponentialRampToValueAtTime(1100, now + 0.22);
          f1.frequency.exponentialRampToValueAtTime(700, now + dur);
          f1.Q.setValueAtTime(4.0, now);

          const noiseBuffer = this.createPinkNoiseBuffer(ctx, dur);
          if (noiseBuffer) {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.1);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + dur);
          }

          oscGain.gain.setValueAtTime(0.001, now);
          oscGain.gain.linearRampToValueAtTime(0.22, now + 0.08);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(f1);
          f1.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + dur);
          break;
        }

        // 🎋💪 Halfway / Determined Double Chirp Bleat (1 - 50%)
        case 'half_done_chirp': {
          const playChirp = (delay: number, startF: number, peakF: number, endF: number, dur: number) => {
            const cOsc = ctx.createOscillator();
            const cGain = ctx.createGain();
            cOsc.type = 'sawtooth';
            cOsc.frequency.setValueAtTime(startF, now + delay);
            cOsc.frequency.exponentialRampToValueAtTime(peakF, now + delay + dur * 0.4);
            cOsc.frequency.exponentialRampToValueAtTime(endF, now + delay + dur);

            const cFilt = ctx.createBiquadFilter();
            cFilt.type = 'bandpass';
            cFilt.frequency.setValueAtTime(peakF, now + delay);
            cFilt.Q.setValueAtTime(6.0, now + delay);

            cGain.gain.setValueAtTime(0.001, now + delay);
            cGain.gain.linearRampToValueAtTime(0.25, now + delay + 0.012);
            cGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

            cOsc.connect(cFilt);
            cFilt.connect(cGain);
            cGain.connect(ctx.destination);
            cOsc.start(now + delay);
            cOsc.stop(now + delay + dur);
          };

          playChirp(0, 720, 1080, 880, 0.09);
          playChirp(0.10, 860, 1340, 1020, 0.11);
          break;
        }

        // ✨ Excited Twitter / Trill (51 - 99%)
        case 'starry':
        case 'trill':
        case 'excited_twitter': {
          const notes = [
            { f: 880, delay: 0 },
            { f: 1100, delay: 0.04 },
            { f: 1350, delay: 0.08 },
            { f: 1650, delay: 0.12 },
          ];

          notes.forEach(({ f, delay }) => {
            const tOsc = ctx.createOscillator();
            const tGain = ctx.createGain();
            tOsc.type = 'sawtooth';
            tOsc.frequency.setValueAtTime(f, now + delay);
            tOsc.frequency.exponentialRampToValueAtTime(f * 1.18, now + delay + 0.04);

            const tFilt = ctx.createBiquadFilter();
            tFilt.type = 'bandpass';
            tFilt.frequency.setValueAtTime(f * 1.1, now + delay);
            tFilt.Q.setValueAtTime(7.0, now + delay);

            tGain.gain.setValueAtTime(0.001, now + delay);
            tGain.gain.linearRampToValueAtTime(0.20, now + delay + 0.008);
            tGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.07);

            tOsc.connect(tFilt);
            tFilt.connect(tGain);
            tGain.connect(ctx.destination);
            tOsc.start(now + delay);
            tOsc.stop(now + delay + 0.07);
          });
          break;
        }

        // 🎋😋 Crunchy Bamboo Bites & Happy Eating Gulp (100% Feast)
        case 'feast':
        case 'munch':
        case 'bamboo_crunch': {
          const playCrunchBite = (delay: number, fStart: number, fEnd: number) => {
            const noiseBuf = this.createPinkNoiseBuffer(ctx, 0.06);
            if (noiseBuf) {
              const cNoise = ctx.createBufferSource();
              cNoise.buffer = noiseBuf;
              const cNoiseGain = ctx.createGain();
              const cNoiseFilter = ctx.createBiquadFilter();
              cNoiseFilter.type = 'bandpass';
              cNoiseFilter.frequency.setValueAtTime(1200, now + delay);
              cNoiseFilter.Q.setValueAtTime(4.0, now + delay);

              cNoiseGain.gain.setValueAtTime(0.35, now + delay);
              cNoiseGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.05);

              cNoise.connect(cNoiseFilter);
              cNoiseFilter.connect(cNoiseGain);
              cNoiseGain.connect(ctx.destination);
              cNoise.start(now + delay);
              cNoise.stop(now + delay + 0.05);
            }

            const pOsc = ctx.createOscillator();
            const pGain = ctx.createGain();
            pOsc.type = 'triangle';
            pOsc.frequency.setValueAtTime(fStart, now + delay);
            pOsc.frequency.exponentialRampToValueAtTime(fEnd, now + delay + 0.035);
            pGain.gain.setValueAtTime(0.3, now + delay);
            pGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.04);
            pOsc.connect(pGain);
            pGain.connect(ctx.destination);
            pOsc.start(now + delay);
            pOsc.stop(now + delay + 0.04);
          };

          playCrunchBite(0, 360, 160);
          playCrunchBite(0.08, 420, 190);
          playCrunchBite(0.17, 490, 220);

          setTimeout(() => {
            const sCtx = this.getAudioContext();
            if (!sCtx) return;
            const sNow = sCtx.currentTime;
            const eOsc = sCtx.createOscillator();
            const eGain = sCtx.createGain();
            eOsc.type = 'sawtooth';
            eOsc.frequency.setValueAtTime(780, sNow);
            eOsc.frequency.exponentialRampToValueAtTime(1120, sNow + 0.06);
            eOsc.frequency.exponentialRampToValueAtTime(860, sNow + 0.14);

            const eFilt = sCtx.createBiquadFilter();
            eFilt.type = 'bandpass';
            eFilt.frequency.setValueAtTime(1100, sNow);
            eFilt.Q.setValueAtTime(6.0, sNow);

            eGain.gain.setValueAtTime(0.001, sNow);
            eGain.gain.linearRampToValueAtTime(0.24, sNow + 0.015);
            eGain.gain.exponentialRampToValueAtTime(0.0001, sNow + 0.14);

            eOsc.connect(eFilt);
            eFilt.connect(eGain);
            eGain.connect(sCtx.destination);
            eOsc.start(sNow);
            eOsc.stop(sNow + 0.14);
          }, 220);
          break;
        }

        // 🐾 Authentic High-Pitched Panda Bleat
        case 'happy':
        case 'squeak':
        case 'happy_bleat':
        default: {
          const dur = 0.16;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(680, now);
          osc.frequency.exponentialRampToValueAtTime(1180, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(920, now + dur);

          const f1 = ctx.createBiquadFilter();
          f1.type = 'bandpass';
          f1.frequency.setValueAtTime(1150, now);
          f1.Q.setValueAtTime(6.0, now);

          const f2 = ctx.createBiquadFilter();
          f2.type = 'bandpass';
          f2.frequency.setValueAtTime(2250, now);
          f2.Q.setValueAtTime(5.5, now);

          oscGain.gain.setValueAtTime(0.001, now);
          oscGain.gain.linearRampToValueAtTime(0.28, now + 0.015);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(f1);
          osc.connect(f2);
          f1.connect(oscGain);
          f2.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + dur);
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  /**
   * Orchestrates the 100% Day Completion celebration fanfare + cute panda 'Hi!' squeak + bamboo crunching
   */
  playMascotFeastCelebration(): void {
    try {
      this.playCompletionChime();
      setTimeout(() => {
        this.playMascotCuteSound('happy_bleat');
      }, 350);
      setTimeout(() => {
        this.playMascotCuteSound('feast');
      }, 850);
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();
