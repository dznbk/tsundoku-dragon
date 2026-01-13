import { useEffect, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useAuth } from '../../auth/hooks/useAuth';
import { getBooks } from '../services/bookApi';
import {
  booksAtom,
  booksLoadingAtom,
  booksErrorAtom,
} from '../stores/homeAtoms';

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useAtom(booksAtom);
  const [isLoading, setIsLoading] = useAtom(booksLoadingAtom);
  const setError = useSetAtom(booksErrorAtom);

  const fetchBooks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedBooks = await getBooks(user);
      setBooks(fetchedBooks);
    } catch {
      setError('本の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user, setBooks, setIsLoading, setError]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    isLoading,
    refetch: fetchBooks,
  };
}
