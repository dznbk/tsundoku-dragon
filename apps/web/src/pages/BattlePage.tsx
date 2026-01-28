import { useBook } from '../features/books/hooks/useBook';
import { useBattle } from '../features/books/hooks/useBattle';
import { EnemyDisplay } from '../features/books/components/EnemyDisplay';
import { BattleInput } from '../features/books/components/BattleInput';
import { getDragonRank } from '../features/books/utils/dragonRank';
import { DQWindow } from '../components/DQWindow';
import styles from './BattlePage.module.css';

interface BattlePageProps {
  bookId: string;
  onBack: () => void;
  onDefeat: () => void;
}

export function BattlePage({ bookId, onBack, onDefeat }: BattlePageProps) {
  const { book, isLoading, error: bookError, refetch } = useBook(bookId);
  const {
    attack,
    isLoading: isAttacking,
    error: battleError,
  } = useBattle(bookId);

  const handleAttack = async (pagesRead: number, memo?: string) => {
    const result = await attack(pagesRead, memo);
    if (result) {
      if (result.defeat) {
        onDefeat();
      } else {
        // 本の情報を再取得して表示を更新
        await refetch();
      }
    }
  };

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

  const remainingPages = book.totalPages - book.currentPage;
  const rank = getDragonRank(book.totalPages);

  return (
    <div className={styles.page}>
      <DQWindow className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← 戻る
        </button>
        <h1 className={styles.title}>戦闘</h1>
      </DQWindow>

      <main className={styles.main}>
        <DQWindow className={styles.enemySection}>
          <EnemyDisplay
            title={book.title}
            currentHp={book.currentPage}
            maxHp={book.totalPages}
            rank={rank}
          />
        </DQWindow>

        <DQWindow className={styles.inputSection}>
          {battleError && <p className={styles.errorMessage}>{battleError}</p>}
          <BattleInput
            remainingPages={remainingPages}
            onAttack={handleAttack}
            disabled={isAttacking || book.status !== 'reading'}
          />
          {book.status !== 'reading' && (
            <p className={styles.statusMessage}>この本は既に討伐済みです</p>
          )}
        </DQWindow>
      </main>
    </div>
  );
}
