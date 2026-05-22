import { useEffect, useState } from "react";
import PathCard from "../components/PathCard";
import ProtocolModal from "../components/ProtocolModal";
import BackButton from "../components/BackButton";
import { useSwipeBack } from "../hooks/useSwipeBack";
import { PATHS, type AscensionPath } from "../data/paths";

interface Props {
  onBack: () => void;
}

export default function ChoosePath({ onBack }: Props) {
  const [active, setActive] = useState<AscensionPath | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const modalOpen = active !== null;

  // Disable swipe-back while modal is open — first swipe should not navigate away.
  useSwipeBack({ onBack, disabled: modalOpen });

  // Escape closes the modal first; if no modal, escape goes back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modalOpen) {
        setActive(null);
      } else {
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, onBack]);

  const handleCardTap = (path: AscensionPath) => {
    if (expandedId === path.id) {
      // Already expanded → second tap commits to the protocol modal.
      setActive(path);
    } else {
      // First tap reveals the card's contents.
      setExpandedId(path.id);
    }
  };

  // Back arrow: close modal first if open; else navigate back.
  const handleBack = () => {
    if (modalOpen) {
      setActive(null);
    } else {
      onBack();
    }
  };

  return (
    <section className="choose">
      <header className="choose__header">
        <div className="choose__eyebrow">Ascension Profile Generated</div>
        <h1 className="choose__title">Choose Your Next Ascension</h1>
        <div className="choose__profile">
          <span className="choose__profile-label">Current Profile:</span>{" "}
          <span className="choose__profile-value">Emergent</span>
        </div>
      </header>

      {PATHS.map((p, i) => (
        <PathCard
          key={p.id}
          path={p}
          index={i}
          isExpanded={expandedId === p.id}
          onTap={handleCardTap}
        />
      ))}

      {active && (
        <ProtocolModal
          category={active.title.replace(/ Ascension$/, "")}
          onClose={() => setActive(null)}
        />
      )}

      <BackButton onBack={handleBack} />
    </section>
  );
}
