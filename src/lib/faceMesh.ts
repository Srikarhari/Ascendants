import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface StoredFaceMesh {
  // 478 normalized landmarks (x,y,z in [0,1] for x/y; z is relative depth)
  front: NormalizedLandmark[];
  // Aspect ratio (width / height) of the source video at capture time.
  // Lets renderers reproduce the same projection the camera saw.
  sourceAspect: number;
  // Wall-clock capture timestamp; not used for logic yet but useful later.
  capturedAt: number;
  // Number of frames averaged into `front`. Higher = steadier mesh.
  frameCount: number;
}

// Minimum frames required before we trust the average enough to ship a mesh.
// Below this, FaceScan passes null and PostScan falls back to WireframeFace.
export const MIN_FRAMES_FOR_MESH = 8;

// How many of the most recent frames to average. Older frames are dropped
// to keep memory bounded and the mesh fresh.
export const AVERAGE_WINDOW = 30;

// Element-wise mean across N frames. All frames must have the same length.
// Returns null if `frames` is empty.
export function averageLandmarks(
  frames: NormalizedLandmark[][]
): NormalizedLandmark[] | null {
  if (frames.length === 0) return null;
  const ref = frames[0];
  const n = ref.length;
  const out: NormalizedLandmark[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let sx = 0;
    let sy = 0;
    let sz = 0;
    let sv = 0;
    for (let f = 0; f < frames.length; f++) {
      const p = frames[f][i];
      sx += p.x;
      sy += p.y;
      sz += p.z;
      sv += p.visibility ?? 0;
    }
    out[i] = {
      x: sx / frames.length,
      y: sy / frames.length,
      z: sz / frames.length,
      visibility: sv / frames.length,
    };
  }
  return out;
}
