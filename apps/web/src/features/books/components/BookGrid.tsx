import type { Book } from '../services/bookApi';
import { BookCard } from './BookCard';
import styles from './BookGrid.module.css';

interface BookGridProps {
  books: Book[];
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>まだ本が登録されていません</p>
        <p className={styles.emptyHint}>新しいドラゴンを討伐しよう！</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
