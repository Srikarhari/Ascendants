import { useEffect, useState } from "react";

const LOGO_URL = "/ascendants-logo.png";

interface Props {
  onSequenceComplete?: () => void;
}

export default function LogoIntro({ onSequenceComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [illuminated, setIlluminated] = useState(false);
  const [wordmark, setWordmark] = useState(false);

  useEffect(() => {
    const tFade = setTimeout(() => setVisible(true), 80);
    const tMark = setTimeout(() => setWordmark(true), 900);
    const tGlow = setTimeout(() => setIlluminated(true), 1300);
    const tDone = setTimeout(() => onSequenceComplete?.(), 2200);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tMark);
      clearTimeout(tGlow);
      clearTimeout(tDone);
    };
  }, [onSequenceComplete]);

  const cls = [
    "logo-intro",
    visible && "is-visible",
    illuminated && "is-illuminated",
    wordmark && "is-wordmark",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <img
        className="logo-intro__img"
        src={LOGO_URL}
        alt="Ascendants"
        draggable={false}
      />
    </div>
  );
}
