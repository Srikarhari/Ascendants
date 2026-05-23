import { useEffect, useState } from "react";
import WireframeFace from "../components/WireframeFace";
import MeshRender from "../components/MeshRender";
import BackButton from "../components/BackButton";
import { useSwipeBack } from "../hooks/useSwipeBack";
import type { StoredFaceMesh } from "../lib/faceMesh";

interface Props {
  frozenFrame: string | null;
  storedMesh: StoredFaceMesh | null;
  onContinue: () => void;
  onBack: () => void;
  onForward: () => void;
}

export default function PostScan({
  frozenFrame,
  storedMesh,
  onContinue,
  onBack,
  onForward,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  useSwipeBack({ onBack, onForward });

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="postscan"
      style={{
        // Pure black stage — overrides .postscan's #050505 so the frame
        // and the page share one uniform background. Without this, the
        // .postscan__frame box reads as a visible rectangle floating on
        // a near-black page.
        background: "#000",
      }}
    >
      <div className="postscan__frame">
        {storedMesh ? (
          <MeshRender mesh={storedMesh} frozenFrame={frozenFrame} />
        ) : (
          <WireframeFace />
        )}
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

      <BackButton onBack={onBack} />
    </section>
  );
}
