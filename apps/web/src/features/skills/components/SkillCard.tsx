import { ExpBar } from './ExpBar';
import styles from './SkillCard.module.css';

interface SkillCardProps {
  name: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  totalExp: number;
}

export function SkillCard({
  name,
  level,
  currentExp,
  expToNextLevel,
  totalExp,
}: SkillCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.level}>Lv.{level}</span>
      </div>
      <ExpBar current={currentExp} max={expToNextLevel} />
      <div className={styles.totalExp}>
        累計: {totalExp.toLocaleString()} exp
      </div>
    </div>
  );
}
