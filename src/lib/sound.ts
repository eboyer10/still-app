export type BreathSound = {
  /** breath is 0..1, the same value that drives the orb. */
  update: (breath: number) => void;
  stop: () => void;
};

let context: AudioContext | null = null;

function getContext() {
  if (context) return context;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    context = new Ctx();
  } catch {
    return null;
  }
  return context;
}

/**
 * Browsers only allow audio after a tap or key press. Call this from a click handler
 * (the sound toggle, Begin a moment) so the tone can start later without being blocked.
 */
export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state !== "running") void ctx.resume();
}

// A soft open chord (D, A, D, F#) with a gentle low-pass, so it stays warm on small speakers.
const PARTIALS: [frequency: number, level: number][] = [
  [146.8, 0.5],
  [220, 0.6],
  [293.7, 0.45],
  [370, 0.25],
];

/** Returns null when audio isn't available. The tone swells and settles with the breath. */
export function startBreathSound(): BreathSound | null {
  const ctx = getContext();
  if (!ctx) return null;
  unlockAudio();
  const master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1100;
  filter.connect(master).connect(ctx.destination);
  const oscillators = PARTIALS.map(([frequency, level]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.detune.value = (Math.random() - 0.5) * 8;
    gain.gain.value = level;
    osc.connect(gain).connect(filter);
    osc.start();
    return osc;
  });
  master.gain.setTargetAtTime(0.1, ctx.currentTime, 0.6);
  return {
    update: (breath) => master.gain.setTargetAtTime(0.07 + breath * 0.14, ctx.currentTime, 0.3),
    stop: () => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      window.setTimeout(() => oscillators.forEach((osc) => osc.stop()), 1000);
    },
  };
}
