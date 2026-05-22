import { useEffect, useState } from "react";

const FACE_URL = `${import.meta.env.BASE_URL}Ascendants_face.png`;
const NAME_URL = `${import.meta.env.BASE_URL}Ascendants_name.png`;

interface Props {
  onSequenceComplete?: () => void;
}

export default function LogoIntro({ onSequenceComplete }: Props) {
  const [faceVisible, setFaceVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  useEffect(() => {
    const tFace = setTimeout(() => setFaceVisible(true), 80);
    // small pause (~300ms) after the face fade settles, then reveal the name
    const tName = setTimeout(() => setNameVisible(true), 1100);
    const tDone = setTimeout(() => onSequenceComplete?.(), 2000);
    return () => {
      clearTimeout(tFace);
      clearTimeout(tName);
      clearTimeout(tDone);
    };
  }, [onSequenceComplete]);

  return (
    <div className="logo-intro">
      <img
        className={[
          "logo-intro__face",
          faceVisible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
        src={FACE_URL}
        alt="Ascendants"
        draggable={false}
      />
      <img
        className={[
          "logo-intro__name",
          nameVisible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
        src={NAME_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}
