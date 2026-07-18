"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { FaceTracker } from "@/lib/faceTracker";
import type { NormalizedBox, TrackedFace } from "@/types/face";

const WASM_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

export type DetectorStatus = "loading" | "ready" | "error";

export function useFaceTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [status, setStatus] = useState<DetectorStatus>("loading");
  const detectorRef = useRef<FaceDetector | null>(null);
  const trackerRef = useRef(new FaceTracker());

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
        const detector = await FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
        });
        if (cancelled) {
          detector.close();
          return;
        }
        detectorRef.current = detector;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    setup();

    return () => {
      cancelled = true;
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !active) return;

    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector) return;

    let rafId: number;

    const loop = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        const result = detector.detectForVideo(video, performance.now());
        const boxes: NormalizedBox[] = result.detections
          .map((detection) => detection.boundingBox)
          .filter((box): box is NonNullable<typeof box> => box != null)
          .map((box) => ({
            x: box.originX / video.videoWidth,
            y: box.originY / video.videoHeight,
            width: box.width / video.videoWidth,
            height: box.height / video.videoHeight,
          }));
        setTrackedFaces(trackerRef.current.update(boxes));
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [status, active, videoRef]);

  return { trackedFaces, status };
}
