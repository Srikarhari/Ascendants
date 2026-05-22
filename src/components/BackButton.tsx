interface Props {
  onBack: () => void;
  label?: string;
}

export default function BackButton({ onBack, label = "Back" }: Props) {
  return (
    <button
      type="button"
      className="back-button"
      onClick={onBack}
      aria-label={label}
    >
      <span className="back-button__glyph" aria-hidden="true">
        ‹
      </span>
    </button>
  );
}
