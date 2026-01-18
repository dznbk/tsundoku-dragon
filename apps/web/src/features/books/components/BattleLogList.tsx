import { useBattleLogs } from '../hooks/useBattleLogs';
import { DQButton } from '../../../components/DQButton';
import styles from './BattleLogList.module.css';

interface BattleLogListProps {
  bookId: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BattleLogList({ bookId }: BattleLogListProps) {
  const { logs, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useBattleLogs(bookId);

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (logs.length === 0) {
    return (
      <div className={styles.empty}>
        <p>まだ戦闘記録がありません</p>
        <p className={styles.emptyHint}>戦闘してダメージを与えよう！</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>戦闘記録</h3>
      <ul className={styles.list}>
        {logs.map((log) => (
          <li key={log.id} className={styles.item}>
            <span className={styles.date}>{formatDate(log.createdAt)}</span>
            <span className={styles.pages}>+{log.pagesRead}ページ</span>
            {log.memo && <span className={styles.memo}>{log.memo}</span>}
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className={styles.loadMore}>
          <DQButton
            onClick={loadMore}
            variant="secondary"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? '読み込み中...' : 'もっと見る'}
          </DQButton>
        </div>
      )}
    </div>
  );
}
