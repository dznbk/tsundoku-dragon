import { useState } from 'react';
import { DQWindow } from '../components/DQWindow';
import { DQButton } from '../components/DQButton';
import {
  BookInfo,
  BattleLogList,
  BookEditModal,
} from '../features/books/components';
import { useBookDetail } from '../features/books/hooks/useBookDetail';
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
  const { book, isLoading, error, handleUpdate, handleDelete, handleReset } =
    useBookDetail(bookId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (input: UpdateBookInput) => {
    await handleUpdate(input);
  };

  const handleDeleteClick = async () => {
    if (!confirm('この本を削除しますか？')) {
      return;
    }
    setIsDeleting(true);
    const success = await handleDelete();
    if (success) {
      onBack();
    }
    setIsDeleting(false);
  };

  const handleResetClick = async () => {
    await handleReset();
  };

  const handleBattle = () => {
    onNavigateToBattle(bookId);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error || '本が見つかりませんでした'}
        </div>
        <DQButton onClick={onBack}>戻る</DQButton>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <DQButton onClick={onBack} variant="secondary">
          ← 戻る
        </DQButton>
      </header>

      <DQWindow className={styles.bookSection}>
        <BookInfo
          book={book}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onReset={handleResetClick}
          onBattle={handleBattle}
        />
      </DQWindow>

      <DQWindow className={styles.logsSection}>
        <BattleLogList bookId={bookId} />
      </DQWindow>

      {isDeleting && (
        <div className={styles.overlay}>
          <div className={styles.deletingMessage}>削除中...</div>
        </div>
      )}

      <BookEditModal
        book={book}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
