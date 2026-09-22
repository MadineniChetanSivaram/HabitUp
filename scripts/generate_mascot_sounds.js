import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

function createWavBuffer(sampleRate, durationSec, generateSample) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const bytesPerSample = 2; // 16-bit PCM
  const numChannels = 1; // mono
  const dataSize = numSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generateSample(t, durationSec)));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const sampleRate = 44100;

// 1. 🥱 Mascot Yawn / Wake Up Sound
const yawnBuffer = createWavBuffer(sampleRate, 0.45, (t, dur) => {
  // Rising then settling frequency
  const f = t < 0.22 ? 380 + (680 - 380) * (t / 0.22) : 680 - (680 - 460) * ((t - 0.22) / (dur - 0.22));
  const env = Math.min(t / 0.08, 1) * Math.exp(-t * 5.0);
  // Soft sine with gentle second harmonic
  const wave = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t);
  // Breath noise
  const noise = (Math.random() * 2 - 1) * 0.06 * Math.exp(-t * 4.0);
  return (wave * 0.4 + noise) * env;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_yawn.wav'), yawnBuffer);

// 2. 🥺 Mascot Sad / Pleading Whimper
const sadBuffer = createWavBuffer(sampleRate, 0.38, (t, dur) => {
  const f = t < 0.08 ? 620 + 120 * (t / 0.08) : 740 - (740 - 420) * ((t - 0.08) / (dur - 0.08));
  // Tremolo wobble
  const tremolo = 1 + 0.25 * Math.sin(2 * Math.PI * 7.5 * t);
  const env = Math.min(t / 0.04, 1) * Math.exp(-t * 6.5);
  const wave = (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t)) * tremolo;
  return wave * env * 0.45;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_sad.wav'), sadBuffer);

// 3. 🎋💪 Mascot Half-Done Chirp (Determined Double Chirp)
const chirpBuffer = createWavBuffer(sampleRate, 0.30, (t) => {
  let val = 0;
  // Chirp 1 (0 to 0.12s)
  if (t < 0.12) {
    const dt = t;
    const f = 720 + 360 * (dt / 0.12);
    const env = Math.min(dt / 0.015, 1) * Math.exp(-dt * 18.0);
    val += Math.sin(2 * Math.PI * f * dt) * env * 0.48;
  }
  // Chirp 2 (0.10s to 0.26s)
  if (t >= 0.10 && t < 0.26) {
    const dt = t - 0.10;
    const f = 860 + 480 * (dt / 0.16);
    const env = Math.min(dt / 0.015, 1) * Math.exp(-dt * 16.0);
    val += Math.sin(2 * Math.PI * f * dt) * env * 0.52;
  }
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_chirp.wav'), chirpBuffer);

// 4. ✨ Mascot Excited Twitter / Trill (Playful high rising twitter)
const twitterBuffer = createWavBuffer(sampleRate, 0.34, (t) => {
  let val = 0;
  const notes = [
    { start: 0.00, dur: 0.07, f1: 880, f2: 1100 },
    { start: 0.06, dur: 0.07, f1: 1100, f2: 1350 },
    { start: 0.12, dur: 0.08, f1: 1350, f2: 1650 },
    { start: 0.19, dur: 0.11, f1: 1650, f2: 1980 },
  ];
  notes.forEach(({ start, dur, f1, f2 }) => {
    if (t >= start && t <= start + dur) {
      const dt = t - start;
      const f = f1 + (f2 - f1) * (dt / dur);
      const env = Math.min(dt / 0.01, 1) * Math.exp(-dt * 14.0);
      val += (Math.sin(2 * Math.PI * f * dt) + 0.15 * Math.sin(4 * Math.PI * f * dt)) * env * 0.32;
    }
  });
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_twitter.wav'), twitterBuffer);

// 5. 🎋😋 Mascot Bamboo Crunch (Crispy double crunch)
const crunchBuffer = createWavBuffer(sampleRate, 0.36, (t) => {
  let val = 0;
  // Bite 1
  if (t < 0.16) {
    const dt = t;
    const noise = (Math.random() * 2 - 1) * Math.exp(-dt * 25.0);
    const pop = Math.sin(2 * Math.PI * (480 - dt * 1500) * dt) * Math.exp(-dt * 30.0);
    val += (noise * 0.4 + pop * 0.45);
  }
  // Bite 2
  if (t >= 0.14 && t < 0.34) {
    const dt = t - 0.14;
    const noise = (Math.random() * 2 - 1) * Math.exp(-dt * 22.0);
    const pop = Math.sin(2 * Math.PI * (560 - dt * 1800) * dt) * Math.exp(-dt * 28.0);
    val += (noise * 0.42 + pop * 0.48);
  }
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_crunch.wav'), crunchBuffer);

// 6. 💖 Mascot Happy Bleat (Cute joyful panda bleat)
const happyBuffer = createWavBuffer(sampleRate, 0.30, (t) => {
  let val = 0;
  const f = 640 + 280 * Math.sin(2 * Math.PI * 4 * t);
  const tremolo = 1 + 0.2 * Math.sin(2 * Math.PI * 14 * t);
  const env = Math.min(t / 0.02, 1) * Math.exp(-t * 7.0);
  val = Math.sin(2 * Math.PI * f * t) * tremolo * env * 0.45;
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'mascot_happy.wav'), happyBuffer);

console.log('All Mascot WAV audio files successfully generated in:', soundsDir);
