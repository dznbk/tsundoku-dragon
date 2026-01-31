import styles from './ExpBar.module.css';

interface ExpBarProps {
  current: number;
  max: number;
}

export function ExpBar({ current, max }: ExpBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className={styles.container}>
      <span className={styles.label}>EXP</span>
      <div className={styles.barBackground}>
        <div
          className={styles.barFill}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`経験値 ${current}/${max}`}
        />
      </div>
      <span className={styles.text}>
        {current}/{max}
      </span>
    </div>
  );
}
