type BreathingOrbProps = {
  /**
   * Self-animating 4s in / 4s out loop (welcome screen). Without it, the orb
   * follows the `--breath` CSS variable (0..1) set by a parent.
   */
  auto?: boolean;
  className?: string;
};

export default function BreathingOrb({ auto = false, className = "" }: BreathingOrbProps) {
  return (
    <div aria-hidden="true" className={`orb ${auto ? "orb-auto" : ""} ${className}`.trim()}>
      <div className="orb-halo" />
      <div className="orb-ring" style={{ "--ring-spread": 0.35 } as React.CSSProperties} />
      <div className="orb-ring" style={{ "--ring-spread": 0.7 } as React.CSSProperties} />
      <div className="orb-body" />
    </div>
  );
}
