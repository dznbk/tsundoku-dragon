export type DragonRank = 1 | 2 | 3 | 4 | 5;

/**
 * ページ数からドラゴンランクを計算する
 * @param totalPages 総ページ数
 * @returns ドラゴンランク（1-5）
 */
export function getDragonRank(totalPages: number): DragonRank {
  if (totalPages <= 200) return 1;
  if (totalPages <= 300) return 2;
  if (totalPages <= 500) return 3;
  if (totalPages <= 700) return 4;
  return 5;
}

/**
 * ドラゴンランクに対応する色を取得する
 * @param rank ドラゴンランク
 * @returns カラーコード
 */
export function getDragonColor(rank: DragonRank): string {
  const colors: Record<DragonRank, string> = {
    1: '#27ae60', // 緑系
    2: '#3498db', // 青系
    3: '#9b59b6', // 紫系
    4: '#e74c3c', // 赤系
    5: '#f1c40f', // 金系
  };
  return colors[rank];
}
