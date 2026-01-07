import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  isbnAtom,
  totalPagesAtom,
  coverUrlAtom,
  bookInfoLoadingAtom,
} from '../stores/bookFormAtoms';
import { fetchBookInfoByIsbn } from '../services/ndlApi';

const DEBOUNCE_MS = 500;

export function useBookInfo() {
  const [isbn] = useAtom(isbnAtom);
  const setTotalPages = useSetAtom(totalPagesAtom);
  const setCoverUrl = useSetAtom(coverUrlAtom);
  const setLoading = useSetAtom(bookInfoLoadingAtom);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 前回のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cleanIsbn = isbn.replace(/-/g, '');

    // ISBNが空または不正な場合は何もしない
    if (!cleanIsbn || !/^\d{10}$|^\d{13}$/.test(cleanIsbn)) {
      setCoverUrl(null);
      return;
    }

    // debounce
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const bookInfo = await fetchBookInfoByIsbn(isbn);

        if (bookInfo.totalPages) {
          setTotalPages(String(bookInfo.totalPages));
        }
        if (bookInfo.coverUrl) {
          setCoverUrl(bookInfo.coverUrl);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isbn, setTotalPages, setCoverUrl, setLoading]);
}
