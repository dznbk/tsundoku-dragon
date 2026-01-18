import type { Book } from '../services/bookApi';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { DQButton } from '../../../components/DQButton';
import styles from './BookInfo.module.css';

interface BookInfoProps {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onReset: () => void;
  onBattle: () => void;
}

function getCoverUrl(isbn?: string): string {
  if (!isbn) {
    return '/assets/default-cover.png';
  }
  return `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
}

export function BookInfo({
  book,
  onEdit,
  onDelete,
  onReset,
  onBattle,
}: BookInfoProps) {
  const coverUrl = getCoverUrl(book.isbn);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.coverContainer}>
          <img
            src={coverUrl}
            alt={`${book.title}の表紙`}
            className={styles.cover}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== '/assets/default-cover.png') {
                img.src = '/assets/default-cover.png';
              }
            }}
          />
        </div>
        <div className={styles.info}>
          <h2 className={styles.title}>{book.title}</h2>
          <div className={styles.meta}>
            <StatusBadge status={book.status} />
            {book.round > 1 && (
              <span className={styles.round}>{book.round}周目</span>
            )}
          </div>
          <ProgressBar current={book.currentPage} total={book.totalPages} />
          {book.skills.length > 0 && (
            <div className={styles.skills}>
              {book.skills.map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {book.status === 'reading' && (
          <DQButton onClick={onBattle}>戦闘</DQButton>
        )}
        {book.status === 'completed' && (
          <DQButton onClick={onReset}>再戦</DQButton>
        )}
        <DQButton onClick={onEdit} variant="secondary">
          編集
        </DQButton>
        <DQButton onClick={onDelete} variant="danger">
          削除
        </DQButton>
      </div>
    </div>
  );
}
