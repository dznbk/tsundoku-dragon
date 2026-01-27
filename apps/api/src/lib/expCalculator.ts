const MAX_LEVEL = 9999;

/**
 * 指定レベルに到達するために必要な経験値を計算
 * 計算式: floor(Lv^1.5 × 50)
 */
export function expForLevel(level: number): number {
  return Math.floor(Math.pow(level, 1.5) * 50);
}

/**
 * 累計経験値から現在のレベルを計算
 * レベル1から始まり、経験値が次のレベルの閾値に達するとレベルアップ
 */
export function levelFromExp(totalExp: number): number {
  let level = 1;
  let expNeeded = 0;

  while (level < MAX_LEVEL) {
    expNeeded += expForLevel(level);
    if (totalExp < expNeeded) break;
    level++;
  }

  return level;
}

/**
 * 討伐ボーナス計算
 * 総ページ数の10%（端数切り捨て）
 */
export function defeatBonus(totalPages: number): number {
  return Math.floor(totalPages * 0.1);
}
