import { useBattleLogs } from '../hooks/useBattleLogs';
import { Pagination } from './Pagination';
import styles from './BattleLogList.module.css';

interface BattleLogListProps {
  bookId: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BattleLogList({ bookId }: BattleLogListProps) {
  const { logs, pagination, isLoading, error, currentPage, goToPage } =
    useBattleLogs(bookId);

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (logs.length === 0) {
    return <div className={styles.empty}>戦闘ログはありません</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>戦闘ログ</h3>
      <ul className={styles.list}>
        {logs.map((log) => (
          <li key={log.id} className={styles.item}>
            <span className={styles.date}>{formatDate(log.createdAt)}</span>
            <span className={styles.pages}>+{log.pagesRead}ページ</span>
            {log.memo && <span className={styles.memo}>{log.memo}</span>}
          </li>
        ))}
      </ul>
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
