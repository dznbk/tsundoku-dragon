import { useAtom, useAtomValue } from 'jotai';
import { DQWindow } from '../components/DQWindow';
import { DQButton } from '../components/DQButton';
import { BottomActionBar } from '../components/BottomActionBar';
import { BookGrid } from '../features/books/components/BookGrid';
import { CompletedToggle } from '../features/books/components/CompletedToggle';
import { UserStatus } from '../features/books/components/UserStatus';
import { useBooks } from '../features/books/hooks/useBooks';
import { useUserStatus } from '../features/books/hooks/useUserStatus';
import {
  showCompletedAtom,
  filteredBooksAtom,
} from '../features/books/stores/homeAtoms';
import styles from './HomePage.module.css';

interface HomePageProps {
  onNavigateToRegister: () => void;
  onNavigateToBookDetail: (bookId: string) => void;
}

export function HomePage({
  onNavigateToRegister,
  onNavigateToBookDetail,
}: HomePageProps) {
  const { isLoading } = useBooks();
  const { userName, completedCount, totalPagesRead, topSkills } =
    useUserStatus();
  const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);
  const filteredBooks = useAtomValue(filteredBooksAtom);

  return (
    <div className={styles.page}>
      <section className={styles.statusSection}>
        <DQWindow>
          <UserStatus
            userName={userName}
            completedCount={completedCount}
            totalPagesRead={totalPagesRead}
            topSkills={topSkills}
          />
        </DQWindow>
      </section>

      <section className={styles.booksSection}>
        <div className={styles.booksHeader}>
          <h2 className={styles.booksTitle}>討伐リスト</h2>
          <CompletedToggle
            checked={showCompleted}
            onChange={setShowCompleted}
          />
        </div>

        {isLoading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : (
          <BookGrid
            books={filteredBooks}
            onBookClick={onNavigateToBookDetail}
          />
        )}
      </section>

      <BottomActionBar>
        <DQButton onClick={onNavigateToRegister}>本を登録する</DQButton>
      </BottomActionBar>
    </div>
  );
}
