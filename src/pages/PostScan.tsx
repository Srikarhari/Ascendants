import { useEffect, useState } from "react";
import WireframeFace from "../components/WireframeFace";

interface Props {
  frozenFrame: string | null;
  onContinue: () => void;
}

const CONVERSION_STEPS = ["Face", "Profile", "Projection", "Ascension"] as const;

export default function PostScan({ frozenFrame, onContinue }: Props) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i <= CONVERSION_STEPS.length; i++) {
      timers.push(
        window.setTimeout(() => setRevealedCount(i), 900 + i * 900)
      );
    }
    const done = window.setTimeout(
      onContinue,
      900 + CONVERSION_STEPS.length * 900 + 3200
    );
    timers.push(done);
    return () => timers.forEach(clearTimeout);
  }, [onContinue]);

  return (
    <section className="postscan">
      <div className="postscan__frame">
        {frozenFrame ? (
          <img
            className="postscan__frozen"
            src={frozenFrame}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <div className="postscan__frozen-placeholder" />
        )}
        <WireframeFace />
      </div>

      <div className="conversion" aria-live="polite">
        {CONVERSION_STEPS.map((label, i) => {
          const visible = revealedCount > i;
          const isFinal = i === CONVERSION_STEPS.length - 1;
          return (
            <span key={label} style={{ display: "contents" }}>
              {i > 0 && (
                <span
                  className={[
                    "conversion__arrow",
                    visible && "is-visible",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  ↓
                </span>
              )}
              <span
                className={[
                  "conversion__step",
                  isFinal && "is-final",
                  visible && "is-visible",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {label}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
