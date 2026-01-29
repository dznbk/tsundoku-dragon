import { useState, useEffect, useRef } from 'react';
import styles from './HpBar.module.css';

interface HpBarProps {
  current: number;
  max: number;
  animateTo?: number;
  animationDuration?: number;
  onAnimationComplete?: () => void;
}

export function HpBar({
  current,
  max,
  animateTo,
  animationDuration = 500,
  onAnimationComplete,
}: HpBarProps) {
  const [displayCurrent, setDisplayCurrent] = useState(current);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(current);

  // アニメーション処理
  useEffect(() => {
    if (animateTo === undefined || animateTo === displayCurrent) {
      return;
    }

    startValueRef.current = displayCurrent;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);

      // イージング（ease-out）
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newValue =
        startValueRef.current +
        (animateTo - startValueRef.current) * easeProgress;

      setDisplayCurrent(Math.round(newValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayCurrent(animateTo);
        onAnimationComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateTo, animationDuration, onAnimationComplete]);

  // animateTo が指定されていない場合は current を直接使用
  useEffect(() => {
    if (animateTo === undefined) {
      setDisplayCurrent(current);
    }
  }, [current, animateTo]);

  const percentage = max > 0 ? Math.min((displayCurrent / max) * 100, 100) : 0;
  const remainingPages = max - displayCurrent;

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
