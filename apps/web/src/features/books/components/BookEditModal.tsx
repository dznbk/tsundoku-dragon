import { useState } from 'react';
import type { Book, UpdateBookInput } from '../services/bookApi';
import { DQWindow } from '../../../components/DQWindow';
import { DQButton } from '../../../components/DQButton';
import { SkillTagInput } from './SkillTagInput';
import styles from './BookEditModal.module.css';

interface BookEditModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdateBookInput) => Promise<void>;
}

export function BookEditModal({
  book,
  isOpen,
  onClose,
  onSave,
}: BookEditModalProps) {
  const [title, setTitle] = useState(book.title);
  const [totalPages, setTotalPages] = useState(book.totalPages.toString());
  const [skills, setSkills] = useState<string[]>(book.skills);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages < 1) {
      setError('ページ数は1以上の数値を入力してください');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        totalPages: pages,
        skills,
      });
      onClose();
    } catch {
      setError('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setSkills(newSkills);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <DQWindow className={styles.modal}>
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <h2 className={styles.title}>本の編集</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
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
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-pages" className={styles.label}>
                総ページ数
              </label>
              <input
                id="edit-pages"
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className={styles.input}
                min="1"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>スキル</label>
              <SkillTagInput
                value={skills}
                onChange={handleSkillsChange}
                suggestions={[]}
                isLoadingSuggestions={false}
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
              <DQButton type="button" variant="secondary" onClick={onClose}>
                キャンセル
              </DQButton>
              <DQButton type="submit" disabled={isSaving}>
                {isSaving ? '保存中...' : '保存'}
              </DQButton>
            </div>
          </form>
        </div>
      </DQWindow>
    </div>
  );
}
