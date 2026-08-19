// Web Audio API Sound Synthesizer & Procedural Chiptune Music Generator

let ctx = null;
let musicInterval = null;
let isMuted = false;

export function initAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

function playTone(freq, type, duration, startVol = 0.15, endVol = 0.001) {
  if (!ctx || isMuted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(startVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function playJump() {
  if (!ctx || isMuted) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch(e) {}
}

export function playDoubleJump() {
  if (!ctx || isMuted) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch(e) {}
}

export function playGemCollect() {
  if (!ctx || isMuted) return;
  try {
    const now = ctx.currentTime;
    [987.77, 1318.51, 1567.98].forEach((f, i) => { // B5, E6, G6 chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.12, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.12);
    });
  } catch(e) {}
}

export function playPowerup() {
  if (!ctx || isMuted) return;
  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => { // C5, E5, G5, C6
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.18);
    });
  } catch(e) {}
}

export function playCrash() {
  if (!ctx || isMuted) return;
  try {
    const now = ctx.currentTime;
    // Noise buffer for explosion
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);
  } catch(e) {}
}

// Chiptune Synth Music Melody
const MELODY = [
  523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 587.33,
  523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 880.00, 987.77
];

export function startMusic() {
  if (musicInterval) return;
  let step = 0;
  musicInterval = setInterval(() => {
    if (!ctx || isMuted) return;
    try {
      const note = MELODY[step % MELODY.length];
      playTone(note, 'triangle', 0.12, 0.05, 0.001);
      // Bass backing note
      if (step % 2 === 0) {
        playTone(note / 2, 'sine', 0.2, 0.06, 0.001);
      }
      step++;
    } catch(e) {}
  }, 160);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
