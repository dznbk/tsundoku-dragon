import { useState, useRef, useCallback } from 'react';
import { fetchBooksByTitle } from '../services/ndlApi';
import type { NdlBookSearchResult } from '../services/ndlApi';

const DEBOUNCE_MS = 500;

export function useTitleSearch() {
  const [searchResults, setSearchResults] = useState<NdlBookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchTitle = useCallback((title: string) => {
    // 前回のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedTitle = title.trim();

    // 空文字の場合は検索しない
    if (!trimmedTitle) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // debounce
    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      abortControllerRef.current = new AbortController();

      try {
        const results = await fetchBooksByTitle(trimmedTitle);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearResults = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return {
    searchResults,
    isSearching,
    searchTitle,
    clearResults,
  };
}
