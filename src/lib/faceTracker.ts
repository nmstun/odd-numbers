import { randomDeathNumber } from "@/lib/randomNumber";
import type { NormalizedBox, TrackedFace } from "@/types/face";

const IOU_MATCH_THRESHOLD = 0.3;
const POSITION_SMOOTHING = 0.5;
const MAX_MISSED_FRAMES = 12;

function iou(a: NormalizedBox, b: NormalizedBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (intersectionArea <= 0) return 0;
  const unionArea = a.width * a.height + b.width * b.height - intersectionArea;
  if (unionArea <= 0) return 0;
  return intersectionArea / unionArea;
}

function smoothed(previous: NormalizedBox, next: NormalizedBox): NormalizedBox {
  const f = POSITION_SMOOTHING;
  return {
    x: previous.x + (next.x - previous.x) * f,
    y: previous.y + (next.y - previous.y) * f,
    width: previous.width + (next.width - previous.width) * f,
    height: previous.height + (next.height - previous.height) * f,
  };
}

/**
 * フレーム間でIoU(重なり率)による対応付けを行い、同一人物には
 * 検出された瞬間に決めたランダムな数字を固定で表示し続けさせる。
 * iOS版の FaceTracker.swift と同じロジックの移植。
 */
export class FaceTracker {
  private faces: TrackedFace[] = [];

  update(boxes: NormalizedBox[]): TrackedFace[] {
    const remaining = boxes.slice();
    const result: TrackedFace[] = [];

    for (const face of this.faces) {
      const matchIndex = this.bestMatchIndex(face.box, remaining);
      if (matchIndex !== null) {
        const [matchedBox] = remaining.splice(matchIndex, 1);
        result.push({
          ...face,
          box: smoothed(face.box, matchedBox),
          framesSinceSeen: 0,
        });
      } else {
        const framesSinceSeen = face.framesSinceSeen + 1;
        if (framesSinceSeen <= MAX_MISSED_FRAMES) {
          result.push({ ...face, framesSinceSeen });
        }
      }
    }

    for (const box of remaining) {
      result.push({
        id: crypto.randomUUID(),
        number: randomDeathNumber(),
        box,
        framesSinceSeen: 0,
      });
    }

    this.faces = result;
    return result;
  }

  private bestMatchIndex(box: NormalizedBox, candidates: NormalizedBox[]): number | null {
    let bestIndex: number | null = null;
    let bestIoU = IOU_MATCH_THRESHOLD;
    candidates.forEach((candidate, index) => {
      const overlap = iou(box, candidate);
      if (overlap > bestIoU) {
        bestIoU = overlap;
        bestIndex = index;
      }
    });
    return bestIndex;
  }
}
