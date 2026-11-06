type BreathingLinesProps = {
  /**
   * Self-animating 4s in / 4s out loop (welcome screen). Without it, the lines
   * follow the `--breath` CSS variable (0..1) set by a parent.
   */
  auto?: boolean;
  compact?: boolean;
  className?: string;
};

const WIDTH = 400;
const MID = 80;

type Line = { amplitude: number; frequency: number; phase: number; reach: number; drift: number };

// Fine lines that gather into a soft swell in the middle and settle flat at the edges.
const LINES: Line[] = [
  { amplitude: 62, frequency: 0.0105, phase: 0, reach: 1, drift: 16 },
  { amplitude: 50, frequency: 0.013, phase: 1.2, reach: 0.82, drift: 22 },
  { amplitude: 38, frequency: 0.016, phase: 2.4, reach: 0.64, drift: 19 },
  { amplitude: -44, frequency: 0.0115, phase: 0.6, reach: 0.9, drift: 26 },
  { amplitude: -30, frequency: 0.0175, phase: 3.1, reach: 0.5, drift: 14 },
];

function path({ amplitude, frequency, phase }: Line) {
  const points: string[] = [];
  for (let x = 0; x <= WIDTH; x += 4) {
    const envelope = Math.exp(-(((x - WIDTH / 2) / 95) ** 2));
    const y = MID + amplitude * envelope * Math.sin((x - WIDTH / 2) * frequency * 2 * Math.PI * 0.5 + phase);
    points.push(`${x} ${y.toFixed(2)}`);
  }
  return `M${points.join(" L")}`;
}

export default function BreathingLines({ auto = false, compact = false, className = "" }: BreathingLinesProps) {
  return (
    <div
      aria-hidden="true"
      className={`lines ${auto ? "lines-auto" : ""} ${compact ? "lines-compact" : ""} ${className}`.trim()}
    >
      <div className="lines-glow" />
      <svg viewBox={`0 0 ${WIDTH} 160`} preserveAspectRatio="xMidYMid meet" className="lines-svg">
        <defs>
          <linearGradient id="line-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f08cc4" />
            <stop offset="0.5" stopColor="#8f9bff" />
            <stop offset="1" stopColor="#b58cf2" />
          </linearGradient>
        </defs>
        <line x1="0" y1={MID} x2={WIDTH} y2={MID} stroke="url(#line-stroke)" strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke" />
        {LINES.map((line, index) => (
          <g key={index} className="lines-drift" style={{ "--drift": `${line.drift}s` } as React.CSSProperties}>
            <path
              d={path(line)}
              fill="none"
              stroke="url(#line-stroke)"
              strokeWidth="1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="lines-path"
              style={{ "--reach": line.reach } as React.CSSProperties}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
