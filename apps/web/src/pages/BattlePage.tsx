import { useState, useCallback } from 'react';
import { useBook } from '../features/books/hooks/useBook';
import { useBattle } from '../features/books/hooks/useBattle';
import { EnemyDisplay } from '../features/books/components/EnemyDisplay';
import { BattleInput } from '../features/books/components/BattleInput';
import { BattleTransition } from '../features/books/components/BattleTransition';
import { BattleMessage } from '../features/books/components/BattleMessage';
import { VictoryScreen } from '../features/books/components/VictoryScreen';
import { getDragonRank } from '../features/books/utils/dragonRank';
import { DQWindow } from '../components/DQWindow';
import type { RecordBattleResult } from '../features/books/services/bookApi';
import styles from './BattlePage.module.css';

type BattleState =
  | 'transition'
  | 'idle'
  | 'attacking'
  | 'animating'
  | 'victory';

interface BattlePageProps {
  bookId: string;
  onBack: () => void;
  onDefeat: () => void;
}

interface AttackResult {
  pagesRead: number;
  newCurrentPage: number;
  isDefeat: boolean;
}

function generateAttackMessages(bookTitle: string, damage: number): string[] {
  return ['あなたのこうげき！', `${bookTitle} に ${damage} のダメージ！`];
}

export function BattlePage({ bookId, onBack, onDefeat }: BattlePageProps) {
  const { book, isLoading, error: bookError, refetch } = useBook(bookId);
  const {
    attack,
    isLoading: isAttacking,
    error: battleError,
  } = useBattle(bookId);

  const [battleState, setBattleState] = useState<BattleState>('transition');
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);
  const [battleResult, setBattleResult] = useState<RecordBattleResult | null>(
    null
  );
  const [displayCurrentPage, setDisplayCurrentPage] = useState<number | null>(
    null
  );

  const handleTransitionComplete = useCallback(() => {
    setBattleState('idle');
  }, []);

  const handleAttack = async (pagesRead: number, memo?: string) => {
    const result = await attack(pagesRead, memo);
    if (result) {
      const newCurrentPage = (book?.currentPage ?? 0) + pagesRead;
      setAttackResult({
        pagesRead,
        newCurrentPage,
        isDefeat: result.defeat,
      });
      if (result.defeat) {
        setBattleResult(result);
      }
      setBattleState('attacking');
    }
  };

  const handleMessageComplete = useCallback(() => {
    setBattleState('animating');
  }, []);

  const handleAnimationComplete = useCallback(async () => {
    if (attackResult?.isDefeat) {
      setBattleState('victory');
    } else {
      setDisplayCurrentPage(null);
      setAttackResult(null);
      await refetch();
      setBattleState('idle');
    }
  }, [attackResult, refetch]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <DQWindow className={styles.header}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            ← 戻る
          </button>
          <h1 className={styles.title}>読み込み中...</h1>
        </DQWindow>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className={styles.page}>
        <DQWindow className={styles.header}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            ← 戻る
          </button>
          <h1 className={styles.title}>エラー</h1>
        </DQWindow>
        <main className={styles.main}>
          <DQWindow className={styles.errorWindow}>
            <p>{bookError || '本が見つかりませんでした'}</p>
          </DQWindow>
        </main>
      </div>
    );
  }

  const rank = getDragonRank(book.totalPages);

  // トランジション状態
  if (battleState === 'transition') {
    return (
      <div className={styles.page}>
        <BattleTransition
          isbn={book.isbn}
          rank={rank}
          onComplete={handleTransitionComplete}
        />
      </div>
    );
  }

  // 討伐演出状態
  if (battleState === 'victory' && battleResult) {
    return (
      <div className={styles.page}>
        <DQWindow className={styles.header}>
          <h1 className={styles.title}>討伐完了</h1>
        </DQWindow>
        <main className={styles.main}>
          <VictoryScreen
            bookTitle={book.title}
            expGained={battleResult.expGained}
            defeatBonus={battleResult.defeatBonus}
            skillResults={battleResult.skillResults}
            onGoHome={onDefeat}
          />
        </main>
      </div>
    );
  }

  const currentPage = displayCurrentPage ?? book.currentPage;
  const remainingPages = book.totalPages - currentPage;
  const isInputDisabled =
    isAttacking || book.status !== 'reading' || battleState !== 'idle';

  return (
    <div className={styles.page}>
      <DQWindow className={styles.header}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          disabled={battleState !== 'idle'}
        >
          ← 戻る
        </button>
        <h1 className={styles.title}>戦闘</h1>
      </DQWindow>

      <main className={styles.main}>
        <DQWindow className={styles.enemySection}>
          <EnemyDisplay
            title={book.title}
            currentHp={currentPage}
            maxHp={book.totalPages}
            rank={rank}
            animateTo={
              battleState === 'animating' && attackResult
                ? attackResult.newCurrentPage
                : undefined
            }
            onAnimationComplete={
              battleState === 'animating' ? handleAnimationComplete : undefined
            }
          />
        </DQWindow>

        {battleState === 'attacking' && attackResult && (
          <BattleMessage
            messages={generateAttackMessages(
              book.title,
              attackResult.pagesRead
            )}
            onComplete={handleMessageComplete}
          />
        )}

        <DQWindow className={styles.inputSection}>
          {battleError && <p className={styles.errorMessage}>{battleError}</p>}
          <BattleInput
            remainingPages={remainingPages}
            onAttack={handleAttack}
            disabled={isInputDisabled}
          />
          {book.status !== 'reading' && (
            <p className={styles.statusMessage}>この本は既に討伐済みです</p>
          )}
        </DQWindow>
      </main>
    </div>
  );
}
