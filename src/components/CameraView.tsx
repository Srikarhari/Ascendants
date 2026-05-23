import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CameraViewHandle {
  captureFrame: () => string | null;
  getVideoEl: () => HTMLVideoElement | null;
}

const CameraView = forwardRef<CameraViewHandle>((_props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setDenied(true);
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => undefined);
        }
      } catch {
        setDenied(true);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const v = videoRef.current;
      if (v) v.srcObject = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      captureFrame: () => {
        const v = videoRef.current;
        if (!v || !v.videoWidth) return null;
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        try {
          return canvas.toDataURL("image/jpeg", 0.82);
        } catch {
          return null;
        }
      },
      getVideoEl: () => videoRef.current,
    }),
    []
  );

  return (
    <div className="camera-view">
      {!denied ? (
        <video
          ref={videoRef}
          className="camera-view__video"
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className="camera-view__placeholder">camera unavailable</div>
      )}
    </div>
  );
});

CameraView.displayName = "CameraView";

export default CameraView;
