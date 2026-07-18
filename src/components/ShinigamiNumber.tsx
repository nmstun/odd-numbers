"use client";

import { useEffect, useState } from "react";
import { randomDeathNumber } from "@/lib/randomNumber";

const REVEAL_STEPS = 7;
const REVEAL_INTERVAL_MS = 45;

interface Props {
  value: number;
  /** 前面カメラの鏡像表示時、文字だけ読める向きに戻すため反転させる */
  mirrored?: boolean;
}

/**
 * 死神の目風に赤くにじんで浮かぶ数字。マウント時だけ数字がスロットのように
 * 一瞬揺れてから本当の数字に収束する(iOS版 ShinigamiNumberView.swift の移植)。
 */
export function ShinigamiNumber({ value, mirrored }: Props) {
  const [display, setDisplay] = useState(randomDeathNumber);

  useEffect(() => {
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= REVEAL_STEPS) {
        setDisplay(value);
        window.clearInterval(timer);
      } else {
        setDisplay(randomDeathNumber());
      }
    }, REVEAL_INTERVAL_MS);

    return () => window.clearInterval(timer);
    // valueは同一人物なら不変(FaceTrackerが固定するため)、マウント時に一度だけ演出する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      className="shinigami-number"
      style={mirrored ? { display: "inline-block", transform: "scaleX(-1)" } : undefined}
    >
      {display}
    </span>
  );
}
