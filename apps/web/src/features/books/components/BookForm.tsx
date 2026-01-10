import { useAtom, useSetAtom } from 'jotai';
import {
  titleAtom,
  isbnAtom,
  totalPagesAtom,
  skillsAtom,
  formErrorsAtom,
  isFormValidAtom,
  coverUrlAtom,
  bookInfoLoadingAtom,
  formDataAtom,
  applySearchResultAtom,
} from '../stores/bookFormAtoms';
import { useBookInfo } from '../hooks/useBookInfo';
import { BookCoverPreview } from './BookCoverPreview';
import { SkillTagInput } from './SkillTagInput';
import { TitleSearchInput } from './TitleSearchInput';
import type { NdlBookSearchResult } from '../services/ndlApi';
import { DQButton } from '../../../components/DQButton';
import styles from './BookForm.module.css';

interface BookFormProps {
  onSubmit: (data: {
    title: string;
    isbn?: string;
    totalPages: number;
    skills?: string[];
  }) => Promise<void>;
  isSubmitting: boolean;
  suggestions: string[];
  isLoadingSuggestions: boolean;
}

export function BookForm({
  onSubmit,
  isSubmitting,
  suggestions,
  isLoadingSuggestions,
}: BookFormProps) {
  const [title, setTitle] = useAtom(titleAtom);
  const [isbn, setIsbn] = useAtom(isbnAtom);
  const [totalPages, setTotalPages] = useAtom(totalPagesAtom);
  const [skills, setSkills] = useAtom(skillsAtom);
  const [errors, setErrors] = useAtom(formErrorsAtom);
  const [isValid] = useAtom(isFormValidAtom);
  const [coverUrl] = useAtom(coverUrlAtom);
  const [isLoadingBookInfo] = useAtom(bookInfoLoadingAtom);
  const [formData] = useAtom(formDataAtom);
  const applySearchResult = useSetAtom(applySearchResultAtom);

  // ISBN入力時の自動取得
  useBookInfo();

  const handleSearchResultSelect = (result: NdlBookSearchResult) => {
    applySearchResult(result);
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; totalPages?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    const pages = parseInt(totalPages, 10);
    if (!totalPages) {
      newErrors.totalPages = 'ページ数は必須です';
    } else if (isNaN(pages) || pages <= 0) {
      newErrors.totalPages = 'ページ数は1以上の整数で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formContainer}>
        <div className={styles.coverSection}>
          <BookCoverPreview coverUrl={coverUrl} isLoading={isLoadingBookInfo} />
        </div>

        <div className={styles.fieldsSection}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              タイトル <span className={styles.required}>*</span>
            </label>
            <TitleSearchInput
              value={title}
              onChange={setTitle}
              onSelect={handleSearchResultSelect}
              error={errors.title}
            />
            {errors.title && (
              <p id="title-error" className={styles.errorMessage} role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="isbn" className={styles.label}>
              ISBN
            </label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className={styles.input}
              placeholder="978-4-xxx-xxxxx-x"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="totalPages" className={styles.label}>
              ページ数 <span className={styles.required}>*</span>
              {isLoadingBookInfo && (
                <span className={styles.autoFetch}>（自動取得中...）</span>
              )}
            </label>
            <div className={styles.pagesInput}>
              <input
                id="totalPages"
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className={styles.input}
                min="1"
                aria-required="true"
                aria-invalid={!!errors.totalPages}
                aria-describedby={
                  errors.totalPages ? 'totalPages-error' : undefined
                }
              />
              <span className={styles.pagesUnit}>ページ</span>
            </div>
            {errors.totalPages && (
              <p
                id="totalPages-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.totalPages}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>スキル</label>
            <SkillTagInput
              value={skills}
              onChange={setSkills}
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
            />
          </div>
        </div>
      </div>

      <div className={styles.submitSection}>
        <DQButton type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? '登録中...' : '討伐対象に追加'}
        </DQButton>
      </div>
    </form>
  );
}
