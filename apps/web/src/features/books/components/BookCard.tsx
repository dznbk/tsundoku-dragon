import type { Book } from '../services/bookApi';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

function getCoverUrl(isbn?: string): string {
  if (!isbn) {
    return '/assets/default-cover.png';
  }
  return `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const coverUrl = getCoverUrl(book.isbn);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
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
        <h3 className={styles.title}>{book.title}</h3>
        <ProgressBar current={book.currentPage} total={book.totalPages} />
        <div className={styles.badgeContainer}>
          <StatusBadge status={book.status} />
        </div>
      </div>
    </article>
  );
}
