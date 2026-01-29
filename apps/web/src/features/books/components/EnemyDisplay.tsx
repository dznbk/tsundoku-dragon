import { HpBar } from './HpBar';
import { getDragonColor, type DragonRank } from '../utils/dragonRank';
import styles from './EnemyDisplay.module.css';

interface EnemyDisplayProps {
  title: string;
  currentHp: number;
  maxHp: number;
  rank: DragonRank;
  animateTo?: number;
  onAnimationComplete?: () => void;
}

export function EnemyDisplay({
  title,
  currentHp,
  maxHp,
  rank,
  animateTo,
  onAnimationComplete,
}: EnemyDisplayProps) {
  const dragonColor = getDragonColor(rank);

  return (
    <div className={styles.container}>
      <div className={styles.dragonContainer}>
        <div
          className={styles.dragonPlaceholder}
          style={{ backgroundColor: dragonColor }}
          aria-label={`ランク${rank}のドラゴン`}
        >
          <span className={styles.dragonEmoji}>🐉</span>
          <span className={styles.rankBadge}>Rank {rank}</span>
        </div>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.hpContainer}>
        <HpBar
          current={currentHp}
          max={maxHp}
          animateTo={animateTo}
          onAnimationComplete={onAnimationComplete}
        />
      </div>
    </div>
  );
}
