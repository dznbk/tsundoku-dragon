import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { recordBattle, type RecordBattleResult } from '../services/bookApi';

export interface UseBattleResult {
  attack: (
    pagesRead: number,
    memo?: string
  ) => Promise<RecordBattleResult | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useBattle(bookId: string): UseBattleResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attack = useCallback(
    async (
      pagesRead: number,
      memo?: string
    ): Promise<RecordBattleResult | null> => {
      if (!user) {
        setError('ログインが必要です');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await recordBattle(user, bookId, { pagesRead, memo });
        return result;
      } catch {
        setError('攻撃に失敗しました');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user, bookId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    attack,
    isLoading,
    error,
    clearError,
  };
}
