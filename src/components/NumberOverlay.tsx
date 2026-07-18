"use client";

import { useEffect, useState, type RefObject } from "react";
import { ShinigamiNumber } from "./ShinigamiNumber";
import type { TrackedFace } from "@/types/face";

const HEAD_MARGIN_PX = 12;

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  trackedFaces: TrackedFace[];
}

/**
 * video要素は object-fit: cover で表示されているため、動画のピクセル座標を
 * そのまま使うと表示位置とずれる。表示サイズとの拡大率・トリミング量を
 * 計算してから正規化座標を画面座標に変換する。
 */
export function NumberOverlay({ videoRef, trackedFaces }: Props) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateVideoSize = () => {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
    };
    updateVideoSize();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    resizeObserver.observe(video);

    video.addEventListener("loadedmetadata", updateVideoSize);
    video.addEventListener("resize", updateVideoSize);

    return () => {
      resizeObserver.disconnect();
      video.removeEventListener("loadedmetadata", updateVideoSize);
      video.removeEventListener("resize", updateVideoSize);
    };
  }, [videoRef]);

  if (!videoSize.width || !videoSize.height || containerSize.width === 0) return null;

  const scale = Math.max(
    containerSize.width / videoSize.width,
    containerSize.height / videoSize.height,
  );
  const displayedWidth = videoSize.width * scale;
  const displayedHeight = videoSize.height * scale;
  const offsetX = (containerSize.width - displayedWidth) / 2;
  const offsetY = (containerSize.height - displayedHeight) / 2;

  return (
    <div className="pointer-events-none absolute inset-0">
      {trackedFaces.map((face) => {
        const centerX = offsetX + (face.box.x + face.box.width / 2) * displayedWidth;
        const topY = offsetY + face.box.y * displayedHeight - HEAD_MARGIN_PX;

        return (
          <div
            key={face.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: centerX, top: topY }}
          >
            <ShinigamiNumber value={face.number} />
          </div>
        );
      })}
    </div>
  );
}
