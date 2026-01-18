import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getBattleLogs,
  type BattleLog,
  type PaginatedBattleLogs,
} from '../services/bookApi';

interface UseBattleLogsResult {
  logs: BattleLog[];
  pagination: PaginatedBattleLogs['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  goToPage: (page: number) => void;
}

export function useBattleLogs(
  bookId: string,
  limit: number = 20
): UseBattleLogsResult {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedBattleLogs['pagination'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(
    async (page: number) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getBattleLogs(user, bookId, page, limit);
        setLogs(result.logs);
        setPagination(result.pagination);
      } catch {
        setError('戦闘ログの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    [user, bookId, limit]
  );

  useEffect(() => {
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    logs,
    pagination,
    isLoading,
    error,
    currentPage,
    goToPage,
  };
}
