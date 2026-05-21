import { useEffect } from "react";

interface Props {
  category: string;
  onClose: () => void;
}

export default function ProtocolModal({ category, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${category} Protocol`}
      onClick={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__eyebrow">Protocol</div>
        <div className="modal__title">{category} Protocol</div>
        <div className="modal__body">
          This protocol will be constructed next.
        </div>
        <button type="button" className="modal__return" onClick={onClose}>
          Return
        </button>
      </div>
    </div>
  );
}
