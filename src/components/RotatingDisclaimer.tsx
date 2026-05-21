import { useEffect, useState } from "react";
import { DISCLAIMERS } from "../data/disclaimers";

interface Props {
  /** ms each line is visible (excluding fade) */
  holdMs?: number;
  /** ms for fade in/out */
  fadeMs?: number;
}

export default function RotatingDisclaimer({
  holdMs = 3500,
  fadeMs = 1200,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tIn = setTimeout(() => !cancelled && setVisible(true), 300);
    return () => {
      cancelled = true;
      clearTimeout(tIn);
    };
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % DISCLAIMERS.length);
        setVisible(true);
      }, fadeMs);
    }, holdMs + fadeMs);
    return () => clearInterval(cycle);
  }, [holdMs, fadeMs]);

  return (
    <div
      className={["disclaimer", visible && "is-visible"]
        .filter(Boolean)
        .join(" ")}
    >
      {DISCLAIMERS[idx]}
    </div>
  );
}
