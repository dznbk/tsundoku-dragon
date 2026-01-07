import styles from './BookCoverPreview.module.css';

interface BookCoverPreviewProps {
  coverUrl: string | null;
  isLoading: boolean;
  className?: string;
}

export function BookCoverPreview({
  coverUrl,
  isLoading,
  className,
}: BookCoverPreviewProps) {
  const combinedClassName = [styles.container, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClassName}>
      {isLoading ? (
        <div className={styles.loading}>読込中...</div>
      ) : coverUrl ? (
        <img
          src={coverUrl}
          alt="書影プレビュー"
          className={styles.coverImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const placeholder = parent.querySelector(
                `.${styles.placeholder}`
              );
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex';
              }
            }
          }}
        />
      ) : null}
      <div
        className={styles.placeholder}
        style={{ display: coverUrl && !isLoading ? 'none' : 'flex' }}
      >
        <span className={styles.placeholderText}>書影なし</span>
      </div>
    </div>
  );
}
