import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { useAuth } from '../features/auth/hooks/useAuth';
import { BookForm } from '../features/books/components/BookForm';
import { useSkillSuggestions } from '../features/books/hooks/useSkillSuggestions';
import {
  resetFormAtom,
  isSubmittingAtom,
  submitErrorAtom,
  successMessageAtom,
} from '../features/books/stores/bookFormAtoms';
import { createBook, ApiError } from '../features/books/services/bookApi';
import { DQWindow } from '../components/DQWindow';
import styles from './BookRegisterPage.module.css';

interface BookRegisterPageProps {
  onBack: () => void;
}

export function BookRegisterPage({ onBack }: BookRegisterPageProps) {
  const { user } = useAuth();
  const { suggestions, isLoading: isLoadingSuggestions } =
    useSkillSuggestions();
  const resetForm = useSetAtom(resetFormAtom);
  const setIsSubmitting = useSetAtom(isSubmittingAtom);
  const setSubmitError = useSetAtom(submitErrorAtom);
  const setSuccessMessage = useSetAtom(successMessageAtom);
  const [isSubmitting, setLocalSubmitting] = useState(false);
  const [successMessage, setLocalSuccessMessage] = useState<string | null>(
    null
  );
  const [submitError, setLocalSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    title: string;
    isbn?: string;
    totalPages: number;
    skills?: string[];
  }) => {
    if (!user) return;

    setLocalSubmitting(true);
    setIsSubmitting(true);
    setLocalSubmitError(null);
    setSubmitError(null);

    try {
      await createBook(user, data);
      setLocalSuccessMessage('討伐対象に追加しました！');
      setSuccessMessage('討伐対象に追加しました！');
      resetForm();

      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setLocalSuccessMessage(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 400
          ? '入力内容に誤りがあります'
          : '登録に失敗しました。しばらく経ってからお試しください';
      setLocalSubmitError(message);
      setSubmitError(message);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <DQWindow className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← 戻る
        </button>
        <h1 className={styles.title}>本を登録する</h1>
      </DQWindow>

      <main className={styles.main}>
        {successMessage && (
          <div className={styles.successMessage} role="status">
            {successMessage}
          </div>
        )}

        {submitError && (
          <div className={styles.errorMessage} role="alert">
            {submitError}
          </div>
        )}

        <DQWindow className={styles.formContainer}>
          <BookForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            suggestions={suggestions}
            isLoadingSuggestions={isLoadingSuggestions}
          />
        </DQWindow>
      </main>
    </div>
  );
}
