export interface NormalizedBox {
  /** 左端(0〜1、動画フレーム幅に対する比率) */
  x: number;
  /** 上端(0〜1、動画フレーム高さに対する比率) */
  y: number;
  width: number;
  height: number;
}

export interface TrackedFace {
  id: string;
  /** 検出された瞬間に一度だけ決まり、以後その人物に固定される数字 */
  number: number;
  box: NormalizedBox;
  framesSinceSeen: number;
}
