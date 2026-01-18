import { useState } from 'react';
import { useBook } from '../features/books/hooks/useBook';
import { BookInfo } from '../features/books/components/BookInfo';
import { BattleLogList } from '../features/books/components/BattleLogList';
import { BookEditModal } from '../features/books/components/BookEditModal';
import { DQWindow } from '../components/DQWindow';
import type { UpdateBookInput } from '../features/books/services/bookApi';
import styles from './BookDetailPage.module.css';

interface BookDetailPageProps {
  bookId: string;
  onBack: () => void;
  onNavigateToBattle: (bookId: string) => void;
}

export function BookDetailPage({
  bookId,
  onBack,
  onNavigateToBattle,
}: BookDetailPageProps) {
  const { book, isLoading, error, updateBook, deleteBook, resetBook } =
    useBook(bookId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: UpdateBookInput): Promise<boolean> => {
    return updateBook(data);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    const success = await deleteBook();
    if (success) {
      onBack();
    }
  };

  const handleReset = async () => {
    await resetBook();
  };

  const handleBattle = () => {
    onNavigateToBattle(bookId);
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

  if (error || !book) {
    return (
      <div className={styles.page}>
        <DQWindow className={styles.header}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            ← 戻る
          </button>
          <h1 className={styles.title}>エラー</h1>
        </DQWindow>
        <main className={styles.main}>
          <DQWindow>
            <p>{error || '本が見つかりませんでした'}</p>
          </DQWindow>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <DQWindow className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← 戻る
        </button>
        <h1 className={styles.title}>本の詳細</h1>
      </DQWindow>

      <main className={styles.main}>
        <DQWindow className={styles.infoSection}>
          <BookInfo
            book={book}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReset={handleReset}
            onBattle={handleBattle}
          />
          {deleteConfirm && (
            <div className={styles.deleteConfirm}>
              <p>本当に削除しますか？もう一度「削除」を押すと削除されます。</p>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className={styles.cancelButton}
              >
                キャンセル
              </button>
            </div>
          )}
        </DQWindow>

        <DQWindow className={styles.logsSection}>
          <BattleLogList bookId={bookId} />
        </DQWindow>
      </main>

      {book && (
        <BookEditModal
          book={book}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
