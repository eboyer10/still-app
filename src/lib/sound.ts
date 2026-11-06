export type BreathSound = {
  /** breath is 0..1, the same value that drives the orb. */
  update: (breath: number) => void;
  stop: () => void;
};

/**
 * An optional, very soft two-note tone that swells and settles with the breath.
 * Returns null when audio isn't available or the browser hasn't allowed it yet.
 */
export function startBreathSound(): BreathSound | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    const ctx = new Ctx();
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.connect(master).connect(ctx.destination);
    const oscillators = [174.6, 261.6].map((frequency) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(filter);
      osc.start();
      return osc;
    });
    return {
      update: (breath) => master.gain.setTargetAtTime(0.012 + breath * 0.05, ctx.currentTime, 0.25),
      stop: () => {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        window.setTimeout(() => {
          oscillators.forEach((osc) => osc.stop());
          void ctx.close();
        }, 900);
      },
    };
  } catch {
    return null;
  }
}
