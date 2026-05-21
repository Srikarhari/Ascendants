import { useEffect, useMemo, useState } from "react";

interface Pt { x: number; y: number }

/**
 * Sculptural wireframe — concentric ring topology, hairline strokes,
 * no fills, slow drift. Reads closer to a biometric mould than CG.
 */
export default function WireframeFace() {
  const cx = 180;
  const cy = 240;

  const ringSpec = useMemo(
    () => [
      { ry: 215, rx: 128, n: 22, yOff: -2 },
      { ry: 165, rx: 100, n: 18, yOff: -8 },
      { ry: 115, rx: 72, n: 14, yOff: -14 },
      { ry: 68, rx: 42, n: 10, yOff: -20 },
    ],
    []
  );

  const baseRings = useMemo<Pt[][]>(() => {
    return ringSpec.map(({ rx, ry, n, yOff }) => {
      const pts: Pt[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + yOff + Math.sin(a) * ry });
      }
      return pts;
    });
  }, [ringSpec]);

  // Feature anchors — eyes, nose, mouth — kept minimal and subtle.
  const features = useMemo<Pt[]>(
    () => [
      { x: 152, y: 216 }, { x: 162, y: 212 }, { x: 172, y: 216 }, { x: 162, y: 220 },
      { x: 188, y: 216 }, { x: 198, y: 212 }, { x: 208, y: 216 }, { x: 198, y: 220 },
      { x: 180, y: 232 }, { x: 178, y: 252 }, { x: 182, y: 258 }, { x: 180, y: 264 },
      { x: 168, y: 284 }, { x: 180, y: 282 }, { x: 192, y: 284 }, { x: 180, y: 289 },
    ],
    []
  );

  // Slow, almost imperceptible drift — closer to breath than jitter.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const driftedRings = useMemo<Pt[][]>(() => {
    const seed = tick;
    return baseRings.map((ring, ri) =>
      ring.map((p, pi) => {
        const t = Math.sin(seed * 0.7 + ri * 3.1 + pi * 1.3);
        const u = Math.cos(seed * 0.9 + ri * 1.7 + pi * 2.1);
        return { x: p.x + t * 0.4, y: p.y + u * 0.4 };
      })
    );
  }, [baseRings, tick]);

  // Triangles between adjacent rings
  const triangles: Array<[Pt, Pt, Pt]> = [];
  for (let r = 0; r < driftedRings.length - 1; r++) {
    const a = driftedRings[r];
    const b = driftedRings[r + 1];
    const n = a.length;
    const m = b.length;
    for (let i = 0; i < n; i++) {
      const a1 = a[i];
      const a2 = a[(i + 1) % n];
      const bi = Math.floor((i / n) * m);
      const b1 = b[bi];
      const b2 = b[(bi + 1) % m];
      triangles.push([a1, a2, b1]);
      triangles.push([a2, b2, b1]);
    }
  }

  return (
    <svg
      className="wireframe"
      viewBox="0 0 360 480"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Hairline edges, no fills */}
      <g
        stroke="#c9a24b"
        strokeWidth="0.35"
        strokeOpacity="0.55"
        fill="none"
        style={{ mixBlendMode: "screen" }}
      >
        {triangles.map((t, i) => (
          <polygon
            key={`e-${i}`}
            points={`${t[0].x},${t[0].y} ${t[1].x},${t[1].y} ${t[2].x},${t[2].y}`}
          />
        ))}
      </g>

      {/* Vertices — pinpricks */}
      <g fill="#c9a24b" opacity="0.6">
        {driftedRings.flat().map((p, i) => (
          <circle key={`v-${i}`} cx={p.x} cy={p.y} r="0.7" />
        ))}
      </g>

      {/* Feature anchors — softer cream */}
      <g fill="#e6dcc4" opacity="0.75">
        {features.map((p, i) => (
          <circle key={`fa-${i}`} cx={p.x} cy={p.y} r="0.9" />
        ))}
      </g>

      {/* Feature contours, very thin */}
      <g
        stroke="#c9a24b"
        strokeWidth="0.35"
        strokeOpacity="0.6"
        fill="none"
      >
        <polygon points="152,216 162,212 172,216 162,220" />
        <polygon points="188,216 198,212 208,216 198,220" />
        <polyline points="180,232 178,252 182,258 180,264" />
        <polygon points="168,284 180,282 192,284 180,289" />
      </g>
    </svg>
  );
}
