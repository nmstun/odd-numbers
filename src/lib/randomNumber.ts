const MIN_DIGITS = 1;
const MAX_DIGITS = 8;

/**
 * 先に桁数をランダムに選んでから数字を生成する。単純に1〜99,999,999の範囲で
 * 一様乱数を取ると桁数の多い数字ばかりになる(8桁の当選確率が99,999,999/8 で
 * 支配的になる)ため、桁数から先に選ぶことで1桁のような極端に小さい数字も
 * 均等に出現するようにしている。
 */
export function randomDeathNumber(): number {
  const digits = MIN_DIGITS + Math.floor(Math.random() * (MAX_DIGITS - MIN_DIGITS + 1));
  if (digits === 1) {
    return Math.floor(Math.random() * 10);
  }
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return min + Math.floor(Math.random() * (max - min + 1));
}
