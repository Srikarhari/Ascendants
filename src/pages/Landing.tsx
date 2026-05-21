import { useEffect, useState } from "react";
import LogoIntro from "../components/LogoIntro";

interface Props {
  onBegin: () => void;
}

export default function Landing({ onBegin }: Props) {
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCtaVisible(true), 4800);
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
          aria-label="Begin Ascension Scan"
        >
          Begin Ascension Scan
        </button>
        <div className="landing__cadence">Daily protocol · ~2 min</div>
      </div>

      <div className="landing__footer">v3.0 Experimental Protocol</div>
    </section>
  );
}
