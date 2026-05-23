import { useCallback, useState } from "react";
import Landing from "./pages/Landing";
import FaceScan from "./pages/FaceScan";
import PostScan from "./pages/PostScan";
import ChoosePath from "./pages/ChoosePath";
import type { StoredFaceMesh } from "./lib/faceMesh";

export type Page = "landing" | "scan" | "postScan" | "choose";

const PREVIOUS_PAGE: Partial<Record<Page, Page>> = {
  scan: "landing",
  postScan: "scan",
  choose: "postScan",
};

const NEXT_PAGE: Partial<Record<Page, Page>> = {
  scan: "postScan",
  postScan: "choose",
};

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [storedMesh, setStoredMesh] = useState<StoredFaceMesh | null>(null);

  const goBackFrom = useCallback((current: Page) => {
    const prev = PREVIOUS_PAGE[current];
    if (prev) setPage(prev);
  }, []);

  const goForwardFrom = useCallback((current: Page) => {
    const next = NEXT_PAGE[current];
    if (next) setPage(next);
  }, []);

  return (
    <div className="app-shell">
      {page === "landing" && <Landing onBegin={() => setPage("scan")} />}
      {page === "scan" && (
        <FaceScan
          onComplete={(dataUrl, mesh) => {
            setFrozenFrame(dataUrl);
            setStoredMesh(mesh);
            setPage("postScan");
          }}
          onBack={() => goBackFrom("scan")}
          onForward={() => goForwardFrom("scan")}
        />
      )}
      {page === "postScan" && (
        <PostScan
          frozenFrame={frozenFrame}
          storedMesh={storedMesh}
          onContinue={() => setPage("choose")}
          onBack={() => goBackFrom("postScan")}
          onForward={() => goForwardFrom("postScan")}
        />
      )}
      {page === "choose" && <ChoosePath onBack={() => goBackFrom("choose")} />}
    </div>
  );
}
