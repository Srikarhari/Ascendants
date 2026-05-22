interface Props {
  /** 0..1 */
  progress: number;
}

/**
 * SVG scan overlay: progress ring, hairline oval guide,
 * a handful of sculptural longitudinal arcs, and a soft scan band.
 *
 * viewBox 360 x 780 — closer to phone aspect ratio so oval reads larger.
 */
export default function ScanOverlay({ progress }: Props) {
  const VBW = 360;
  const VBH = 780;
  const cx = VBW / 2;
  const cy = VBH / 2 + 30;
  const rx = 115;
  const ry = 165; // oval reads as face guide, sits inside the ring
  const ringR = 170; // ≤ VBW/2 − 10 so the full circle fits inside iPhone 16 width
  const ringCircumference = 2 * Math.PI * ringR;
  const ringDashOffset =
    ringCircumference * (1 - Math.min(1, Math.max(0, progress)));

  // Sculptural longitudinal arcs (3 verticals, no horizontal grid).
  // Each arc is a vertical ellipse-segment hinting at a 3D dome.
  const longitudes = [-0.6, 0, 0.6];

  return (
    <svg
      className="scan-overlay"
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="oval-clip">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
        <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a24b" stopOpacity="0" />
          <stop offset="50%" stopColor="#c9a24b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Progress ring — hairline, continuous (no CSS transition; ride rAF) */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke="rgba(244,236,216,0.04)"
        strokeWidth="0.75"
      />
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke="#c9a24b"
        strokeOpacity="0.7"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray={ringCircumference}
        strokeDashoffset={ringDashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Inner longitudinal arcs — sculptural, not gridded */}
      <g clipPath="url(#oval-clip)" opacity="0.32">
        {longitudes.map((t, i) => {
          const x = cx + t * rx;
          // Vertical arc: ellipse with reduced rx for curvature impression
          return (
            <ellipse
              key={i}
              cx={x}
              cy={cy}
              rx={Math.max(8, rx * 0.25 * (1 - Math.abs(t) * 0.6))}
              ry={ry * 0.98}
              fill="none"
              stroke="#c9a24b"
              strokeWidth="0.35"
            />
          );
        })}
        {/* one horizon line across midface, very faint */}
        <line
          x1={cx - rx}
          y1={cy}
          x2={cx + rx}
          y2={cy}
          stroke="#c9a24b"
          strokeWidth="0.3"
          strokeOpacity="0.6"
        />
      </g>

      {/* Hairline solid oval guide (no dashes — feels less digital) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="#c9a24b"
        strokeOpacity="0.5"
        strokeWidth="0.7"
      />

      {/* Soft scan band, clipped to oval */}
      <g clipPath="url(#oval-clip)">
        <g
          className="scan-overlay__line"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <rect
            x={cx - rx}
            y={cy - 1}
            width={rx * 2}
            height="2"
            fill="url(#line-grad)"
            opacity="0.85"
          />
        </g>
      </g>
    </svg>
  );
}
