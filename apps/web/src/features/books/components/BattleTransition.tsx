import { useState, useEffect, useMemo } from 'react';
import { getCoverUrl } from '../utils/coverUrl';
import { getDragonColor, type DragonRank } from '../utils/dragonRank';
import styles from './BattleTransition.module.css';

interface BattleTransitionProps {
  isbn?: string;
  rank: DragonRank;
  onComplete: () => void;
}

type TransitionPhase = 'cover' | 'crossfade' | 'dragon' | 'complete';

const COVER_DURATION = 1000;
const CROSSFADE_DURATION = 500;
const DRAGON_DURATION = 500;

export function BattleTransition({
  isbn,
  rank,
  onComplete,
}: BattleTransitionProps) {
  const [phase, setPhase] = useState<TransitionPhase>(
    isbn ? 'cover' : 'dragon'
  );
  const dragonColor = getDragonColor(rank);

  const coverUrl = useMemo(() => getCoverUrl(isbn), [isbn]);

  // フェーズ遷移
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'cover':
        timer = setTimeout(() => setPhase('crossfade'), COVER_DURATION);
        break;
      case 'crossfade':
        timer = setTimeout(() => setPhase('dragon'), CROSSFADE_DURATION);
        break;
      case 'dragon':
        timer = setTimeout(() => setPhase('complete'), DRAGON_DURATION);
        break;
      case 'complete':
        onComplete();
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  return (
    <div className={styles.container} aria-label="戦闘開始演出">
      {/* 書影 */}
      {isbn && (phase === 'cover' || phase === 'crossfade') && (
        <div
          className={`${styles.coverWrapper} ${phase === 'crossfade' ? styles.fadeOut : ''}`}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="書影"
              className={styles.coverImage}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>書影なし</span>
            </div>
          )}
        </div>
      )}

      {/* ドラゴン */}
      {(phase === 'crossfade' ||
        phase === 'dragon' ||
        phase === 'complete') && (
        <div
          className={`${styles.dragonWrapper} ${phase === 'crossfade' ? styles.fadeIn : ''}`}
          style={{ backgroundColor: dragonColor }}
        >
          <span className={styles.dragonEmoji}>🐉</span>
          <span className={styles.rankBadge}>Rank {rank}</span>
        </div>
      )}
    </div>
  );
}
