export type BreathSound = {
  /** breath is 0..1, the same value that drives the visual. */
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

// The chosen tone with a soft octave and fifth above it, so low tones still carry on phone and laptop
// speakers. The slightly detuned pair makes a slow, gentle shimmer.
const PARTIALS: [ratio: number, level: number][] = [
  [1, 0.6],
  [1.0025, 0.4],
  [2, 0.3],
  [3, 0.12],
];

/** Returns null when audio isn't available. The tone swells and settles with the breath. */
export function startBreathSound(hz: number): BreathSound | null {
  const ctx = getContext();
  if (!ctx) return null;
  unlockAudio();
  const master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.max(1100, hz * 3.4);
  filter.connect(master).connect(ctx.destination);
  const oscillators = PARTIALS.map(([ratio, level]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz * ratio;
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
