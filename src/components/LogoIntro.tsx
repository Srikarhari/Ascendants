import { useEffect, useRef, useState } from "react";

const LOGO_URL = "/ascendants-logo.png";

interface Props {
  onSequenceComplete?: () => void;
}

export default function LogoIntro({ onSequenceComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [illuminated, setIlluminated] = useState(false);
  const [wordmark, setWordmark] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tFade = setTimeout(() => setVisible(true), 120);
    const tGlow = setTimeout(() => setIlluminated(true), 1600);
    const tMark = setTimeout(() => setWordmark(true), 2800);
    const tDone = setTimeout(() => onSequenceComplete?.(), 4400);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tGlow);
      clearTimeout(tMark);
      clearTimeout(tDone);
    };
  }, [onSequenceComplete]);

  // Lightweight pointer parallax — disabled on touch / reduced motion.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || isCoarse) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tx = Math.max(-1, Math.min(1, dx)) * 1.6;
      ty = Math.max(-1, Math.min(1, dy)) * 1.6;
      if (!raf) {
        raf = requestAnimationFrame(apply);
      }
    };
    const apply = () => {
      raf = 0;
      node.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const cls = [
    "logo-intro",
    visible && "is-visible",
    illuminated && "is-illuminated",
    wordmark && "is-wordmark",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wrapRef} className={cls}>
      <img
        className="logo-intro__img"
        src={LOGO_URL}
        alt="Ascendants"
        draggable={false}
      />
    </div>
  );
}
