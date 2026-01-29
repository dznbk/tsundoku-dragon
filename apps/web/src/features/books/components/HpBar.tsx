import styles from './HpBar.module.css';

interface HpBarProps {
  current: number;
  max: number;
}

export function HpBar({ current, max }: HpBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const remainingPages = max - current;

  return (
    <div className={styles.container}>
      <span className={styles.label}>HP</span>
      <div className={styles.barBackground}>
        <div
          className={styles.barFill}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={remainingPages}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`残りHP ${remainingPages}/${max}`}
        />
      </div>
      <span className={styles.text}>
        {remainingPages}/{max}
      </span>
    </div>
  );
}
