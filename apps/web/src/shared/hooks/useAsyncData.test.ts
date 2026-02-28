import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetch成功時にdataが設定される', async () => {
    const fetcher = vi.fn().mockResolvedValue({ name: 'テスト' });

    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], null, { errorMessage: 'エラー' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ name: 'テスト' });
    expect(result.current.error).toBeNull();
  });

  it('fetch失敗時にerrorが設定される', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], null, { errorMessage: '取得に失敗しました' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('取得に失敗しました');
  });

  it('errorMessage未指定時はデフォルトメッセージが使われる', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useAsyncData(fetcher, [], null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('データの取得に失敗しました');
  });

  it('enabled=falseのときfetchが実行されない', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], null, { enabled: false })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('refetchで再取得できる', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(`data-${callCount}`);
    });

    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], null, { errorMessage: 'エラー' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('data-1');

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe('data-2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('initialDataが初期値として使われる', () => {
    const fetcher = vi.fn().mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAsyncData(fetcher, [], ['初期値']));

    expect(result.current.data).toEqual(['初期値']);
  });

  it('isLoadingの初期値がtrueである', () => {
    const fetcher = vi.fn().mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAsyncData(fetcher, [], null));

    expect(result.current.isLoading).toBe(true);
  });
});
