"use client";

import { useCamera } from "@/hooks/useCamera";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { CameraStatusNotice } from "./CameraStatusNotice";
import { NumberOverlay } from "./NumberOverlay";

export function CameraStage() {
  const { videoRef, status: cameraStatus, errorMessage, facingMode, toggleFacingMode } =
    useCamera();
  const isLive = cameraStatus === "granted";
  const { trackedFaces, status: detectorStatus } = useFaceTracking(videoRef, isLive);
  const mirrored = facingMode === "user";

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-black">
      <div
        className="h-full w-full"
        style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {isLive && (
          <NumberOverlay videoRef={videoRef} trackedFaces={trackedFaces} mirrored={mirrored} />
        )}
      </div>

      {isLive && (
        <button
          type="button"
          onClick={toggleFacingMode}
          aria-label="カメラを切り替え"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur-sm active:bg-white/20"
        >
          🔄
        </button>
      )}

      {isLive && detectorStatus === "loading" && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60">
          顔を探しています…
        </p>
      )}

      {isLive && detectorStatus === "error" && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-400">
          顔検出モデルの読み込みに失敗しました。通信環境を確認してください。
        </p>
      )}

      {!isLive && (
        <CameraStatusNotice cameraStatus={cameraStatus} errorMessage={errorMessage} />
      )}
    </div>
  );
}
