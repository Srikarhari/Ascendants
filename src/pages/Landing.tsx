import { useEffect, useState } from "react";
import LogoIntro from "../components/LogoIntro";

interface Props {
  onBegin: () => void;
}

export default function Landing({ onBegin }: Props) {
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCtaVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="landing">
      <div className="landing__logo-wrap">
        <LogoIntro />
      </div>

      <div
        className={[
          "landing__cta-wrap",
          ctaVisible && "is-visible",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={onBegin}
          aria-label="Begin Ascension"
        >
          Begin Ascension
        </button>
      </div>
    </section>
  );
}
