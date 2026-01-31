/**
 * 指定レベルで次のレベルに必要な経験値を計算
 * 計算式: floor(Lv^1.5 × 50)
 */
export function expForLevel(level: number): number {
  return Math.floor(Math.pow(level, 1.5) * 50);
}

/**
 * 累計経験値から現在レベル内の進捗を計算
 * @param totalExp - 累計経験値
 * @param level - 現在レベル
 * @returns currentLevelExp: 現在レベル内での経験値, expToNextLevel: 次のレベルに必要な経験値
 */
export function getExpProgress(
  totalExp: number,
  level: number
): {
  currentLevelExp: number;
  expToNextLevel: number;
} {
  // レベル1から現在レベルまでの累計必要経験値を計算
  let accumulated = 0;
  for (let l = 1; l < level; l++) {
    accumulated += expForLevel(l);
  }

  const currentLevelExp = totalExp - accumulated;
  const expToNextLevel = expForLevel(level);

  return { currentLevelExp, expToNextLevel };
}
