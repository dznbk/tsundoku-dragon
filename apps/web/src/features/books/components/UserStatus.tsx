import type { UserSkillExp } from '../services/skillApi';
import styles from './UserStatus.module.css';

interface UserStatusProps {
  userName: string;
  completedCount: number;
  totalPagesRead: number;
  topSkills: UserSkillExp[];
  onSkillListClick?: () => void;
}

export function UserStatus({
  userName,
  completedCount,
  totalPagesRead,
  topSkills,
  onSkillListClick,
}: UserStatusProps) {
  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        <span className={styles.userName}>{userName}</span>
        <span className={styles.suffix}>の冒険記録</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>総討伐数</span>
          <span className={styles.statValue}>{completedCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>総読了ページ</span>
          <span className={styles.statValue}>
            {totalPagesRead.toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.skills}>
        <div className={styles.skillsHeader}>
          <span className={styles.skillsLabel}>上位スキル</span>
          {onSkillListClick && (
            <button
              type="button"
              onClick={onSkillListClick}
              className={styles.skillListLink}
            >
              一覧を見る →
            </button>
          )}
        </div>
        {topSkills.length > 0 ? (
          <div className={styles.skillsList}>
            {topSkills.map((skill) => (
              <span key={skill.name} className={styles.skillTag}>
                {skill.name} Lv.{skill.level}
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.noSkills}>まだスキルがありません</span>
        )}
      </div>
    </div>
  );
}
