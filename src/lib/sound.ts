export const SOUNDS = {
  silent: "Silence",
  music: "Soft music",
  waves: "Ocean waves",
} as const;

export type Soundscape = keyof typeof SOUNDS;

export function isSoundscape(value: unknown): value is Soundscape {
  return typeof value === "string" && Object.hasOwn(SOUNDS, value);
}

let context: AudioContext | null = null;

function getContext() {
  if (context) return context;
  const Audio = window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Audio) return null;
  try {
    context = new Audio();
  } catch {
    return null;
  }
  return context;
}

export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state !== "running") void ctx.resume().catch(() => {});
}

function makeMusic(ctx: AudioContext, output: AudioNode, hz: number) {
  const start = ctx.currentTime;
  const chords = [[1, 5 / 4, 3 / 2], [1, 7 / 6, 4 / 3], [1, 9 / 8, 3 / 2], [1, 5 / 4, 3 / 2]];

  return [1, 2, 0].map((note, voice) => {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    envelope.gain.value = 0;
    const level = [0.28, 0.22, 0.15][voice];
    for (let bar = 0; bar < 8; bar++) {
      const at = start + bar * 4 + voice * 0.38;
      const ratio = chords[bar % chords.length][note];
      // The last voice plays the exact mood frequency. The lower notes soften its presence.
      oscillator.frequency.setValueAtTime(hz * ratio * (voice === 2 ? 1 : 0.5), at);
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(level, at + 0.9);
      envelope.gain.linearRampToValueAtTime(0, at + 3.95);
    }
    oscillator.connect(envelope).connect(output);
    oscillator.start();
    return oscillator;
  });
}

function makeWaves(ctx: AudioContext, output: AudioNode) {
  const samples = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const data = samples.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < data.length; i++) {
    previous = (previous + (Math.random() * 2 - 1) * 0.045) / 1.045;
    data[i] = previous * 2.4;
  }
  // Fade the splice on both sides so there is no click when the buffer loops.
  for (let i = 0; i < 256; i++) {
    data[i] *= i / 256;
    data[data.length - 1 - i] *= i / 256;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = samples;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  noise.connect(filter).connect(output);
  noise.start();
  return [noise];
}

export type BreathSound = {
  update: (breath: number) => void;
  stop: () => void;
};

export function startBreathSound(hz: number, soundscape: Exclude<Soundscape, "silent">): BreathSound | null {
  const ctx = getContext();
  if (!ctx) return null;
  unlockAudio();
  const volume = ctx.createGain();
  volume.gain.value = 0;
  volume.connect(ctx.destination);
  const sources = soundscape === "music" ? makeMusic(ctx, volume, hz) : makeWaves(ctx, volume);
  sources[0].onended = () => volume.disconnect();
  const update = (breath: number) => {
    volume.gain.setTargetAtTime(0.07 + breath * 0.14, ctx.currentTime, 0.25);
  };
  update(0);

  return {
    update,
    stop: () => {
      volume.gain.setTargetAtTime(0, ctx.currentTime, 0.09);
      sources.forEach((source) => source.stop(ctx.currentTime + 0.45));
    },
  };
}
