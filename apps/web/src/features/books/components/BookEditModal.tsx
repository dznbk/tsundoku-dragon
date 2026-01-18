import { useState } from 'react';
import type { Book, UpdateBookInput } from '../services/bookApi';
import { DQButton } from '../../../components/DQButton';
import { DQWindow } from '../../../components/DQWindow';
import styles from './BookEditModal.module.css';

interface BookEditModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateBookInput) => Promise<boolean>;
}

export function BookEditModal({
  book,
  isOpen,
  onClose,
  onSave,
}: BookEditModalProps) {
  const [title, setTitle] = useState(book.title);
  const [totalPages, setTotalPages] = useState(book.totalPages);
  const [skillsInput, setSkillsInput] = useState(book.skills.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (totalPages < 1) {
      setError('ページ数は1以上で入力してください');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setIsSaving(true);
    const success = await onSave({ title: title.trim(), totalPages, skills });
    setIsSaving(false);

    if (success) {
      onClose();
    } else {
      setError('更新に失敗しました');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <DQWindow className={styles.modal}>
        <h2 className={styles.title}>本を編集</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="edit-title" className={styles.label}>
              タイトル
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-totalPages" className={styles.label}>
              総ページ数
            </label>
            <input
              id="edit-totalPages"
              type="number"
              min="1"
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-skills" className={styles.label}>
              スキル（カンマ区切り）
            </label>
            <input
              id="edit-skills"
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="TypeScript, React"
              className={styles.input}
            />
          </div>

          <div className={styles.actions}>
            <DQButton type="button" variant="secondary" onClick={onClose}>
              キャンセル
            </DQButton>
            <DQButton type="submit" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </DQButton>
          </div>
        </form>
      </DQWindow>
    </div>
  );
}
