import { useState, useEffect, useCallback, type DependencyList } from 'react';

interface UseAsyncDataOptions {
  errorMessage?: string;
  enabled?: boolean;
}

interface UseAsyncDataResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  initialData: T,
  options?: UseAsyncDataOptions
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;
  const errorMessage = options?.errorMessage ?? 'データの取得に失敗しました';

  // 呼び出し側がdepsでfetch再実行のタイミングを制御する設計
  const fetch = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch {
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
