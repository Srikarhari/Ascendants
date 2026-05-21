import { useState } from "react";
import PathCard from "../components/PathCard";
import ProtocolModal from "../components/ProtocolModal";
import { PATHS, type AscensionPath } from "../data/paths";

export default function ChoosePath() {
  const [active, setActive] = useState<AscensionPath | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardTap = (path: AscensionPath) => {
    if (expandedId === path.id) {
      // Already expanded → second tap commits to the protocol modal.
      setActive(path);
    } else {
      // First tap reveals the card's contents.
      setExpandedId(path.id);
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
    </section>
  );
}
