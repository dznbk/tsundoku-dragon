/**
 * 経験値・レベル計算ユーティリティ
 *
 * 計算式: 必要経験値 = floor(Lv^1.5 × 50)
 * レベル上限: 9999
 */

const MAX_LEVEL = 9999;

/**
 * 指定レベルから次のレベルに上がるのに必要な経験値
 * 計算式: floor(Lv^1.5 × 50)
 */
export function expForLevel(level: number): number {
  if (level < 1) return 0;
  return Math.floor(Math.pow(level, 1.5) * 50);
}

/**
 * 累計経験値からレベルを計算
 * レベル1から開始し、経験値が足りなくなるまでレベルを上げる
 */
export function levelFromExp(totalExp: number): number {
  if (totalExp < 0) return 1;

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
 * 討伐ボーナスを計算（総ページ数の10%、端数切り捨て）
 */
export function defeatBonus(totalPages: number): number {
  if (totalPages < 0) return 0;
  return Math.floor(totalPages * 0.1);
}
