import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getBookLogs, type BattleLog } from '../services/bookApi';

export function useBattleLogs(bookId: string) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getBookLogs(user, bookId, { limit: 20 });
      setLogs(result.logs);
      setNextCursor(result.nextCursor);
    } catch {
      setError('戦闘ログの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user, bookId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const loadMore = useCallback(async () => {
    if (!user || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const result = await getBookLogs(user, bookId, {
        limit: 20,
        cursor: nextCursor,
      });
      setLogs((prev) => [...prev, ...result.logs]);
      setNextCursor(result.nextCursor);
    } catch {
      setError('戦闘ログの取得に失敗しました');
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, bookId, nextCursor, isLoadingMore]);

  return {
    logs,
    isLoading,
    isLoadingMore,
    error,
    hasMore: !!nextCursor,
    loadMore,
    refetch: fetchLogs,
  };
}
