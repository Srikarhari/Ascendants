import { useRef } from "react";
import type { AscensionPath } from "../data/paths";

interface Props {
  path: AscensionPath;
  index: number;
  isExpanded: boolean;
  onTap: (p: AscensionPath) => void;
}

export default function PathCard({ path, isExpanded, onTap }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  // Subtle pointer tilt on desktop — does not affect expansion.
  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.setProperty("--tilt-x", `${(-dy * 2.5).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(dx * 2.5).toFixed(2)}deg`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <button
      ref={ref}
      type="button"
      className={["path-card", isExpanded && "is-expanded"]
        .filter(Boolean)
        .join(" ")}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={() => onTap(path)}
      aria-expanded={isExpanded}
    >
      <div className="path-card__top">
        <div className="path-card__title">{path.title}</div>
        <div className="path-card__score">
          {path.score}
          <span className="path-card__score-total"> / 100</span>
        </div>
      </div>

      <div className="path-card__bar">
        <div
          className="path-card__bar-fill"
          style={{ width: `${path.score}%` }}
        />
      </div>

      <div className="path-card__reveal" aria-hidden={!isExpanded}>
        <div className="path-card__reveal-inner">
          <div className="path-card__subtitle">{path.subtitle}</div>
          <div className="path-card__markers">
            {path.markers.map((m) => (
              <span key={m} className="path-card__chip">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="path-card__footer">{path.footer}</div>
    </button>
  );
}
