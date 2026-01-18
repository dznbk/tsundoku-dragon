import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={styles.pagination} aria-label="ページネーション">
      <button
        type="button"
        className={styles.button}
        onClick={handlePrev}
        disabled={currentPage <= 1}
        aria-label="前のページ"
      >
        &lt;
      </button>
      <span className={styles.pageInfo}>
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        aria-label="次のページ"
      >
        &gt;
      </button>
    </nav>
  );
}
