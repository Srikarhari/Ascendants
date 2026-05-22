import { useEffect, useRef, useState } from "react";
import CameraView, { CameraViewHandle } from "../components/CameraView";
import ScanOverlay from "../components/ScanOverlay";
import ScanInstructions from "../components/ScanInstructions";
import RotatingDisclaimer from "../components/RotatingDisclaimer";
import BackButton from "../components/BackButton";
import { useSwipeBack } from "../hooks/useSwipeBack";

interface Props {
  onComplete: (frozenFrameDataUrl: string | null) => void;
  onBack: () => void;
  onForward: () => void;
}

const TOTAL_MS = 18_000;

export default function FaceScan({ onComplete, onBack, onForward }: Props) {
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef<CameraViewHandle>(null);

  useSwipeBack({ onBack, onForward });

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
        onComplete(frame);
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
