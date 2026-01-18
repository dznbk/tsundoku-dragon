import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getBook,
  updateBook,
  deleteBook,
  resetBook,
  type Book,
  type UpdateBookInput,
} from '../services/bookApi';

interface UseBookDetailResult {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleUpdate: (input: UpdateBookInput) => Promise<Book | null>;
  handleDelete: () => Promise<boolean>;
  handleReset: () => Promise<Book | null>;
}

export function useBookDetail(bookId: string): UseBookDetailResult {
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedBook = await getBook(user, bookId);
      setBook(fetchedBook);
    } catch {
      setError('本の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user, bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleUpdate = useCallback(
    async (input: UpdateBookInput): Promise<Book | null> => {
      if (!user) return null;

      try {
        const updatedBook = await updateBook(user, bookId, input);
        setBook(updatedBook);
        return updatedBook;
      } catch {
        setError('本の更新に失敗しました');
        return null;
      }
    },
    [user, bookId]
  );

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      await deleteBook(user, bookId);
      return true;
    } catch {
      setError('本の削除に失敗しました');
      return false;
    }
  }, [user, bookId]);

  const handleReset = useCallback(async (): Promise<Book | null> => {
    if (!user) return null;

    try {
      const resetedBook = await resetBook(user, bookId);
      setBook(resetedBook);
      return resetedBook;
    } catch {
      setError('再戦に失敗しました');
      return null;
    }
  }, [user, bookId]);

  return {
    book,
    isLoading,
    error,
    refetch: fetchBook,
    handleUpdate,
    handleDelete,
    handleReset,
  };
}
