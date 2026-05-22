import { useEffect, useState } from "react";
import { SCAN_STEPS } from "../data/scanSteps";

interface Props {
  intervalMs?: number;
}

export default function ScanInstructions({ intervalMs = 2600 }: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SCAN_STEPS.length);
        setVisible(true);
      }, 600);
    }, intervalMs);
    return () => clearInterval(tick);
  }, [intervalMs]);

  const step = SCAN_STEPS[idx];

  return (
    <div className="scan-instructions" aria-live="polite">
      <div
        className={[
          "scan-instructions__step",
          visible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Step {idx + 1} / {SCAN_STEPS.length}
      </div>
      <div
        className={[
          "scan-instructions__primary",
          visible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {step.primary}
      </div>
      <div
        className={[
          "scan-instructions__sub",
          visible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {step.sub}
      </div>
    </div>
  );
}
