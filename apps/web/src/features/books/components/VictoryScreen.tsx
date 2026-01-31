import { useState, useCallback } from 'react';
import { BattleMessage } from './BattleMessage';
import { DQWindow } from '../../../components/DQWindow';
import styles from './VictoryScreen.module.css';

export interface SkillResult {
  skillName: string;
  expGained: number;
  previousLevel: number;
  currentLevel: number;
  currentExp: number;
  leveledUp: boolean;
}

interface VictoryScreenProps {
  bookTitle: string;
  expGained: number;
  defeatBonus: number;
  skillResults: SkillResult[];
  onGoHome: () => void;
}

function generateVictoryMessages(
  bookTitle: string,
  expGained: number,
  defeatBonus: number,
  skillResults: SkillResult[]
): string[] {
  const messages: string[] = [
    `${bookTitle} を たおした！`,
    `けいけんち ${expGained} ポイント かくとく！`,
  ];

  if (defeatBonus > 0) {
    messages.push(`とうばつボーナス ${defeatBonus} ポイント！`);
  }

  const leveledUpSkills = skillResults.filter((s) => s.leveledUp);
  for (const skill of leveledUpSkills) {
    messages.push(
      `スキル『${skill.skillName}』が レベル${skill.currentLevel} に あがった！`
    );
  }

  return messages;
}

export function VictoryScreen({
  bookTitle,
  expGained,
  defeatBonus,
  skillResults,
  onGoHome,
}: VictoryScreenProps) {
  const [isComplete, setIsComplete] = useState(false);

  const messages = generateVictoryMessages(
    bookTitle,
    expGained,
    defeatBonus,
    skillResults
  );

  const handleMessageComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  return (
    <div className={styles.container}>
      {!isComplete ? (
        <BattleMessage messages={messages} onComplete={handleMessageComplete} />
      ) : (
        <DQWindow className={styles.completeWindow}>
          <button
            type="button"
            className={styles.homeButton}
            onClick={onGoHome}
          >
            ホームへもどる
          </button>
        </DQWindow>
      )}
    </div>
  );
}
