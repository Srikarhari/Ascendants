import { useEffect, useRef, useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import CameraView, { CameraViewHandle } from "../components/CameraView";
import ScanOverlay from "../components/ScanOverlay";
import ScanInstructions from "../components/ScanInstructions";
import RotatingDisclaimer from "../components/RotatingDisclaimer";
import BackButton from "../components/BackButton";
import { useSwipeBack } from "../hooks/useSwipeBack";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import {
  AVERAGE_WINDOW,
  MIN_FRAMES_FOR_MESH,
  StoredFaceMesh,
  averageLandmarks,
} from "../lib/faceMesh";

interface Props {
  onComplete: (
    frozenFrameDataUrl: string | null,
    storedMesh: StoredFaceMesh | null
  ) => void;
  onBack: () => void;
  onForward: () => void;
}

const TOTAL_MS = 18_000;

export default function FaceScan({ onComplete, onBack, onForward }: Props) {
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef<CameraViewHandle>(null);
  const framesRef = useRef<NormalizedLandmark[][]>([]);

  useSwipeBack({ onBack, onForward });

  const { landmarker, status } = useFaceLandmarker();

  // Opportunistic landmark detection — runs in parallel with the timer.
  // Any failure is swallowed so the scan completes identically to the mock.
  useEffect(() => {
    if (status !== "ready" || !landmarker) return;
    const video = cameraRef.current?.getVideoEl();
    if (!video) return;

    let cancelled = false;
    let raf = 0;
    let lastVideoTime = -1;

    const tick = () => {
      if (cancelled) return;
      try {
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result.faceLandmarks?.[0];
          if (landmarks && landmarks.length > 0) {
            framesRef.current.push(landmarks);
            if (framesRef.current.length > AVERAGE_WINDOW) {
              framesRef.current.shift();
            }
          }
        }
      } catch {
        // ignore — never block the scan on detection errors
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [landmarker, status]);

  // The existing 18s timer — unchanged in timing or behavior.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / TOTAL_MS);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        const frame = cameraRef.current?.captureFrame() ?? null;
        const mesh = buildStoredMesh(framesRef.current, cameraRef.current);
        onComplete(frame, mesh);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <section className="scan">
      <CameraView ref={cameraRef} />
      <div className="scan__vignette" />
      <ScanOverlay progress={progress} />
      <ScanInstructions />
      <RotatingDisclaimer />
      <BackButton onBack={onBack} />
    </section>
  );
}

function buildStoredMesh(
  frames: NormalizedLandmark[][],
  camera: CameraViewHandle | null
): StoredFaceMesh | null {
  if (frames.length < MIN_FRAMES_FOR_MESH) return null;
  const front = averageLandmarks(frames);
  if (!front) return null;
  const video = camera?.getVideoEl();
  const sourceAspect =
    video && video.videoWidth && video.videoHeight
      ? video.videoWidth / video.videoHeight
      : 3 / 4;
  return {
    front,
    sourceAspect,
    capturedAt: Date.now(),
    frameCount: frames.length,
  };
}
