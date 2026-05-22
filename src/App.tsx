import { useCallback, useState } from "react";
import Landing from "./pages/Landing";
import FaceScan from "./pages/FaceScan";
import PostScan from "./pages/PostScan";
import ChoosePath from "./pages/ChoosePath";

export type Page = "landing" | "scan" | "postScan" | "choose";

const PREVIOUS_PAGE: Partial<Record<Page, Page>> = {
  scan: "landing",
  postScan: "scan",
  choose: "postScan",
};

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);

  const goBackFrom = useCallback((current: Page) => {
    const prev = PREVIOUS_PAGE[current];
    if (prev) setPage(prev);
  }, []);

  return (
    <div className="app-shell">
      {page === "landing" && <Landing onBegin={() => setPage("scan")} />}
      {page === "scan" && (
        <FaceScan
          onComplete={(dataUrl) => {
            setFrozenFrame(dataUrl);
            setPage("postScan");
          }}
          onBack={() => goBackFrom("scan")}
        />
      )}
      {page === "postScan" && (
        <PostScan
          frozenFrame={frozenFrame}
          onContinue={() => setPage("choose")}
          onBack={() => goBackFrom("postScan")}
        />
      )}
      {page === "choose" && <ChoosePath onBack={() => goBackFrom("choose")} />}
    </div>
  );
}
