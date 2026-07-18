"use client";

import { useEffect, useState } from "react";

const NUMBER_RANGE: [number, number] = [1_000_000, 99_999_999];
const REVEAL_STEPS = 7;
const REVEAL_INTERVAL_MS = 45;

function randomDisplayNumber(): number {
  const [min, max] = NUMBER_RANGE;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Props {
  value: number;
}

/**
 * 死神の目風に赤くにじんで浮かぶ数字。マウント時だけ数字がスロットのように
 * 一瞬揺れてから本当の数字に収束する(iOS版 ShinigamiNumberView.swift の移植)。
 */
export function ShinigamiNumber({ value }: Props) {
  const [display, setDisplay] = useState(randomDisplayNumber);

  useEffect(() => {
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= REVEAL_STEPS) {
        setDisplay(value);
        window.clearInterval(timer);
      } else {
        setDisplay(randomDisplayNumber());
      }
    }, REVEAL_INTERVAL_MS);

    return () => window.clearInterval(timer);
    // valueは同一人物なら不変(FaceTrackerが固定するため)、マウント時に一度だけ演出する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span className="shinigami-number">{display}</span>;
}
