import { useEffect, useState } from "react";
import WireframeFace from "../components/WireframeFace";

interface Props {
  frozenFrame: string | null;
  onContinue: () => void;
}

export default function PostScan({ frozenFrame, onContinue }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 1600);
    return () => clearTimeout(t);
  }, []);

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

      <div
        className={["postscan__status", revealed && "is-visible"]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        Ascension profile generated
      </div>

      <button
        type="button"
        className={[
          "btn-primary",
          "postscan__cta",
          revealed && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onContinue}
        disabled={!revealed}
      >
        View Ascension Paths
      </button>
    </section>
  );
}
