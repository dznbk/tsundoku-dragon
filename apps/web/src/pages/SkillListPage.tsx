import { useState, useMemo } from 'react';
import { DQWindow } from '../components/DQWindow';
import { SkillCard } from '../features/skills/components';
import { useSkills } from '../features/skills/hooks/useSkills';
import { getExpProgress } from '../features/skills/utils/expCalculator';
import styles from './SkillListPage.module.css';

interface SkillListPageProps {
  onBack: () => void;
}

type SortBy = 'level' | 'name';

export function SkillListPage({ onBack }: SkillListPageProps) {
  const { skills, isLoading, error } = useSkills();
  const [sortBy, setSortBy] = useState<SortBy>('level');
  const [filterText, setFilterText] = useState('');

  const filteredAndSortedSkills = useMemo(() => {
    let result = [...skills];

    // フィルタリング
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      result = result.filter((skill) =>
        skill.name.toLowerCase().includes(lowerFilter)
      );
    }

    // ソート
    if (sortBy === 'level') {
      result.sort((a, b) => {
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.exp - a.exp;
      });
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }

    return result;
  }, [skills, sortBy, filterText]);

  const handleClearFilter = () => {
    setFilterText('');
  };

  return (
    <div className={styles.page}>
      <DQWindow className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← 戻る
        </button>
        <h1 className={styles.title}>スキル一覧</h1>
      </DQWindow>

      <main className={styles.main}>
        <DQWindow className={styles.controls}>
          <div className={styles.filterContainer}>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="スキル名で検索..."
              className={styles.filterInput}
            />
            {filterText && (
              <button
                type="button"
                onClick={handleClearFilter}
                className={styles.clearButton}
                aria-label="検索をクリア"
              >
                ×
              </button>
            )}
          </div>
          <div className={styles.sortContainer}>
            <span className={styles.sortLabel}>ソート:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={styles.sortSelect}
            >
              <option value="level">レベル順</option>
              <option value="name">名前順</option>
            </select>
          </div>
        </DQWindow>

        {isLoading ? (
          <DQWindow className={styles.messageContainer}>
            <p className={styles.message}>読み込み中...</p>
          </DQWindow>
        ) : error ? (
          <DQWindow className={styles.messageContainer}>
            <p className={styles.errorMessage}>{error}</p>
          </DQWindow>
        ) : skills.length === 0 ? (
          <DQWindow className={styles.messageContainer}>
            <p className={styles.message}>
              まだスキルがありません。本を読んでスキルを獲得しましょう！
            </p>
          </DQWindow>
        ) : filteredAndSortedSkills.length === 0 ? (
          <DQWindow className={styles.messageContainer}>
            <p className={styles.message}>該当するスキルがありません</p>
          </DQWindow>
        ) : (
          <div className={styles.skillList}>
            {filteredAndSortedSkills.map((skill) => {
              const { currentLevelExp, expToNextLevel } = getExpProgress(
                skill.exp,
                skill.level
              );
              return (
                <SkillCard
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  currentExp={currentLevelExp}
                  expToNextLevel={expToNextLevel}
                  totalExp={skill.exp}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
