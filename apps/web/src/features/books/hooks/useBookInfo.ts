import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  isbnAtom,
  titleAtom,
  totalPagesAtom,
  coverUrlAtom,
  bookInfoLoadingAtom,
} from '../stores/bookFormAtoms';
import { fetchBookInfoByIsbn } from '../services/ndlApi';

const DEBOUNCE_MS = 500;

export function useBookInfo() {
  const [isbn] = useAtom(isbnAtom);
  const [title] = useAtom(titleAtom);
  const setTitle = useSetAtom(titleAtom);
  const setTotalPages = useSetAtom(totalPagesAtom);
  const setCoverUrl = useSetAtom(coverUrlAtom);
  const setLoading = useSetAtom(bookInfoLoadingAtom);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // タイトルの現在値をrefで保持（useEffect内で参照しつつ依存配列から除外）
  const titleRef = useRef(title);
  titleRef.current = title;

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

        // タイトルが空の場合のみ自動入力（ユーザー入力を上書きしない）
        if (bookInfo.title && !titleRef.current.trim()) {
          setTitle(bookInfo.title);
        }
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
  }, [isbn, setTitle, setTotalPages, setCoverUrl, setLoading]);
}
