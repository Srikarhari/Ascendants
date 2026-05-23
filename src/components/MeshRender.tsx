import { useEffect, useMemo, useRef } from "react";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import type { StoredFaceMesh } from "../lib/faceMesh";

interface Props {
  mesh: StoredFaceMesh;
  // Used only as a hidden source texture for the scan surface — never shown
  // as a recognizable webcam photo.
  frozenFrame: string | null;
}

const FACE_OVAL_INDICES: number[] = (() => {
  const set = new Set<number>();
  FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.forEach((c) => {
    set.add(c.start);
    set.add(c.end);
  });
  return Array.from(set);
})();

const FEATURE_CONNECTORS = [
  ...FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
  ...FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
  ...FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
  ...FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
  ...FaceLandmarker.FACE_LANDMARKS_LIPS,
  ...FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
  ...FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
];

// Renders the captured mesh as a standalone digitized face object: the
// frozen frame is consumed as a hidden source texture, clipped to the
// face oval, desaturated and warm-tinted via SVG filters, then overlaid
// with a faint scan-mesh accent. No visible webcam photo, no synthetic
// hair lines. Mirrored + parallax-tilted for a floating 3D feel.
export default function MeshRender({ mesh, frozenFrame }: Props) {
  // 3:4 viewBox matches .postscan__frame.
  const vbW = 1000;
  const vbH = 1333;

  const projection = useMemo(
    () => buildProjection(mesh, vbW, vbH),
    [mesh, vbW, vbH]
  );

  const {
    points,
    ovalPath,
    faceHalfW,
    faceHalfH,
    zMin,
    zRange,
    image,
  } = projection;

  // Parallax: damped tween, written straight to the SVG ref to avoid React
  // re-rendering every frame. Stronger range than before now that the
  // mesh is the dominant visual.
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const state = { tRx: 0, tRy: 0, cRx: 0, cRy: 0 };
    let raf = 0;

    const handleMouse = (e: MouseEvent) => {
      const xMid = window.innerWidth / 2;
      const yMid = window.innerHeight / 2;
      const nx = clamp((e.clientX - xMid) / xMid, -1, 1);
      const ny = clamp((e.clientY - yMid) / yMid, -1, 1);
      // Signs: face appears to "look toward" the cursor in selfie view.
      state.tRy = -nx * 10;
      state.tRx = -ny * 6;
    };

    const handleOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      state.tRy = (clamp(e.gamma, -30, 30) / 30) * 12;
      state.tRx = ((clamp(e.beta, -10, 60) - 25) / 35) * 6;
    };

    const animate = () => {
      const k = 0.15;
      state.cRx += (state.tRx - state.cRx) * k;
      state.cRy += (state.tRy - state.cRy) * k;
      const el = svgRef.current;
      if (el) {
        el.style.transform =
          `perspective(700px) ` +
          `rotateX(${state.cRx.toFixed(2)}deg) ` +
          `rotateY(${state.cRy.toFixed(2)}deg) ` +
          `scaleX(-1)`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("deviceorientation", handleOrient, {
      passive: true,
    });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("deviceorientation", handleOrient);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        transform: "perspective(700px) scaleX(-1)",
        willChange: "transform",
      }}
    >
      <defs>
        {/* Clip the frozen frame to the face oval — image only appears
            within the face silhouette, never as a rectangle. */}
        <clipPath id="ascendants-face-clip" clipPathUnits="userSpaceOnUse">
          <polygon points={ovalPath} />
        </clipPath>

        {/* Stylize the texture: desaturate, warm-tint, soft blur. Output
            looks like a scanned surface, not a photograph. */}
        <filter
          id="ascendants-face-fx"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix type="saturate" values="0.18" />
          <feColorMatrix
            type="matrix"
            values="
              1.25 0 0 0 -0.08
              1.05 0 0 0 -0.10
              0.55 0 0 0 -0.10
              0    0 0 1  0
            "
          />
          <feGaussianBlur stdDeviation="2.4" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.05" intercept="0" />
            <feFuncG type="linear" slope="1.0" intercept="0" />
            <feFuncB type="linear" slope="0.95" intercept="0" />
          </feComponentTransfer>
        </filter>

        {/* Soft head/bust halo — implies cranial volume without faking
            hair or neck detection. */}
        <radialGradient id="ascendants-mesh-halo" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.13" />
          <stop offset="55%" stopColor="#c9a24b" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
        </radialGradient>

        {/* Rim shade — radial darkening inside the face oval to suggest
            curvature, like a soft sphere. */}
        <radialGradient
          id="ascendants-rim-shade"
          cx="50%"
          cy="48%"
          r="58%"
        >
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="58%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.78" />
        </radialGradient>

        {/* Center highlight — adds a soft specular bloom to read as
            volumetric instead of flat. */}
        <radialGradient
          id="ascendants-face-highlight"
          cx="50%"
          cy="42%"
          r="34%"
        >
          <stop offset="0%" stopColor="#e6dcc4" stopOpacity="0.16" />
          <stop offset="70%" stopColor="#e6dcc4" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#e6dcc4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Head / bust halo, behind everything. Slightly biased downward so
          the silhouette feels bust-like without explicit neck lines. */}
      <ellipse
        cx={vbW / 2}
        cy={vbH / 2 + faceHalfH * 0.45}
        rx={faceHalfW * 1.45}
        ry={faceHalfH * 2.05}
        fill="url(#ascendants-mesh-halo)"
      />

      {/* Textured scan surface from the frozen frame, clipped to the
          face oval and run through the stylize filter. */}
      {frozenFrame && (
        <g clipPath="url(#ascendants-face-clip)">
          <image
            href={frozenFrame}
            x={image.x}
            y={image.y}
            width={image.width}
            height={image.height}
            preserveAspectRatio="none"
            filter="url(#ascendants-face-fx)"
          />
          {/* Rim darkening — pulls the edges into shadow, gives volume. */}
          <rect
            x={0}
            y={0}
            width={vbW}
            height={vbH}
            fill="url(#ascendants-rim-shade)"
          />
          {/* Soft center bloom — specular hint over the cheek/forehead. */}
          <rect
            x={0}
            y={0}
            width={vbW}
            height={vbH}
            fill="url(#ascendants-face-highlight)"
            style={{ mixBlendMode: "screen" }}
          />
        </g>
      )}

      {/* If we have no texture, fall back to a warm-tinted face surface
          fill so the silhouette still reads as a face object. */}
      {!frozenFrame && (
        <polygon
          points={ovalPath}
          fill="url(#ascendants-face-highlight)"
          opacity={0.9}
        />
      )}

      {/* Subtle tessellation accent — the "scan mesh" hint. Much fainter
          than before so the surface dominates. */}
      <g
        stroke="#c9a24b"
        strokeWidth={vbW * 0.0005}
        strokeOpacity={0.14}
        fill="none"
        style={{ mixBlendMode: "screen" }}
      >
        {FaceLandmarker.FACE_LANDMARKS_TESSELATION.map((c, i) => {
          const a = points[c.start];
          const b = points[c.end];
          if (!a || !b) return null;
          return (
            <line key={`t-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </g>

      {/* Feature contours — eyes, brows, lips, irises. Brighter so the
          face reads as a face even through the soft texture. */}
      <g
        stroke="#f0e7cf"
        strokeWidth={vbW * 0.001}
        strokeOpacity={0.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ mixBlendMode: "screen" }}
      >
        {FEATURE_CONNECTORS.map((c, i) => {
          const a = points[c.start];
          const b = points[c.end];
          if (!a || !b) return null;
          return (
            <line key={`f-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </g>

      {/* Front-most landmark pinpricks — z-depth gated, so they only
          appear on the foreground of the face. Reads as scan vertices. */}
      <g fill="#f0e7cf" style={{ mixBlendMode: "screen" }}>
        {points.map((p, i) => {
          const zn = 1 - (p.z - zMin) / zRange; // 1 = closest, 0 = farthest
          if (zn < 0.55) return null;
          const r = vbW * 0.0009 * (0.4 + zn * 1.0);
          const op = (zn - 0.55) * 0.95;
          return (
            <circle key={`v-${i}`} cx={p.x} cy={p.y} r={r} opacity={op} />
          );
        })}
      </g>
    </svg>
  );
}

type Pt = { x: number; y: number; z: number };

interface Projection {
  points: Pt[];
  ovalPath: string;
  faceHalfW: number;
  faceHalfH: number;
  zMin: number;
  zRange: number;
  // Where to draw the full frozen frame (in viewBox units) so its raw
  // pixel grid lines up with the projected landmarks.
  image: { x: number; y: number; width: number; height: number };
}

// Centers the face in the viewBox using physical (aspect-corrected)
// landmark units so face proportions stay correct on any video aspect.
function buildProjection(
  mesh: StoredFaceMesh,
  vbW: number,
  vbH: number
): Projection {
  const sa = mesh.sourceAspect;
  // Landmarks are normalized [0,1] but x is relative to videoWidth and y
  // to videoHeight. Multiply x by sourceAspect so a unit of x and a unit
  // of y represent the same physical distance.
  const physX = (lx: number) => lx * sa;

  let minPx = Infinity;
  let maxPx = -Infinity;
  let minPy = Infinity;
  let maxPy = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of mesh.front) {
    const px = physX(p.x);
    if (px < minPx) minPx = px;
    if (px > maxPx) maxPx = px;
    if (p.y < minPy) minPy = p.y;
    if (p.y > maxPy) maxPy = p.y;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }
  const faceWPhys = maxPx - minPx || 1;
  const faceHPhys = maxPy - minPy || 1;
  const faceCxPhys = (minPx + maxPx) / 2;
  const faceCyPhys = (minPy + maxPy) / 2;

  // Tight padding — face is the main object, not a small asset.
  const PADDING = 0.07;
  const availW = vbW * (1 - 2 * PADDING);
  const availH = vbH * (1 - 2 * PADDING);
  const s = Math.min(availW / faceWPhys, availH / faceHPhys);

  const viewCx = vbW / 2;
  const viewCy = vbH / 2;

  const points: Pt[] = mesh.front.map((p) => ({
    x: viewCx + (physX(p.x) - faceCxPhys) * s,
    y: viewCy + (p.y - faceCyPhys) * s,
    z: p.z,
  }));

  // Closed face-oval path, sorted by angle around oval centroid.
  const ovalPts = FACE_OVAL_INDICES.map((i) => points[i]).filter(
    (p): p is Pt => !!p
  );
  let ocx = 0;
  let ocy = 0;
  for (const p of ovalPts) {
    ocx += p.x;
    ocy += p.y;
  }
  ocx /= ovalPts.length;
  ocy /= ovalPts.length;
  const ovalSorted = [...ovalPts].sort(
    (a, b) =>
      Math.atan2(a.y - ocy, a.x - ocx) - Math.atan2(b.y - ocy, b.x - ocx)
  );
  const ovalPath = ovalSorted.map((p) => `${p.x},${p.y}`).join(" ");

  // Image layout: full frozen frame spans landmark [0,1] in both axes,
  // which in physical units = [0..sa] × [0..1]. Map that into viewBox.
  const image = {
    x: viewCx + (0 - faceCxPhys) * s,
    y: viewCy + (0 - faceCyPhys) * s,
    width: sa * s,
    height: 1 * s,
  };

  return {
    points,
    ovalPath,
    faceHalfW: (faceWPhys * s) / 2,
    faceHalfH: (faceHPhys * s) / 2,
    zMin: minZ,
    zRange: maxZ - minZ || 1,
    image,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
