import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Pinned WASM bundle on jsDelivr. Must match the @mediapipe/tasks-vision
// version in package.json so the JS shim and WASM agree on ABI.
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";

export type LandmarkerStatus = "loading" | "ready" | "error";

export interface UseFaceLandmarker {
  landmarker: FaceLandmarker | null;
  status: LandmarkerStatus;
}

export function useFaceLandmarker(): UseFaceLandmarker {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [status, setStatus] = useState<LandmarkerStatus>("loading");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    let created: FaceLandmarker | null = null;

    const modelAssetPath = `${import.meta.env.BASE_URL}models/face_landmarker.task`;

    const load = async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

        const createWith = (delegate: "GPU" | "CPU") =>
          FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath, delegate },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });

        try {
          created = await createWith("GPU");
        } catch {
          created = await createWith("CPU");
        }

        if (cancelledRef.current) {
          created.close();
          return;
        }
        setLandmarker(created);
        setStatus("ready");
      } catch {
        if (cancelledRef.current) return;
        setStatus("error");
      }
    };

    load();

    return () => {
      cancelledRef.current = true;
      if (created) {
        try {
          created.close();
        } catch {
          // ignore double-close on hot reload
        }
      }
    };
  }, []);

  return { landmarker, status };
}
