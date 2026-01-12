import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.barBackground}>
        <div
          className={styles.barFill}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${current}/${total}ページ読了`}
        />
      </div>
      <span className={styles.text}>
        {current}/{total}
      </span>
    </div>
  );
}
