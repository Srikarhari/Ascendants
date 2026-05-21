import { useState } from "react";
import Landing from "./pages/Landing";
import FaceScan from "./pages/FaceScan";
import PostScan from "./pages/PostScan";
import ChoosePath from "./pages/ChoosePath";

export type Page = "landing" | "scan" | "postScan" | "choose";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);

  return (
    <div className="app-shell">
      {page === "landing" && <Landing onBegin={() => setPage("scan")} />}
      {page === "scan" && (
        <FaceScan
          onComplete={(dataUrl) => {
            setFrozenFrame(dataUrl);
            setPage("postScan");
          }}
        />
      )}
      {page === "postScan" && (
        <PostScan
          frozenFrame={frozenFrame}
          onContinue={() => setPage("choose")}
        />
      )}
      {page === "choose" && <ChoosePath />}
    </div>
  );
}
