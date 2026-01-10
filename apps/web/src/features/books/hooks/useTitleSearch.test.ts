import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTitleSearch } from './useTitleSearch';
import * as ndlApi from '../services/ndlApi';

vi.mock('../services/ndlApi', () => ({
  fetchBooksByTitle: vi.fn(),
}));

describe('useTitleSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('初期状態では空の結果と非検索状態', () => {
    const { result } = renderHook(() => useTitleSearch());

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('searchTitleを呼び出すと500ms後に検索が実行される', async () => {
    const mockResults = [
      {
        title: 'テスト書籍',
        author: '著者名',
        isbn: '1234567890123',
        totalPages: 200,
        coverUrl: 'https://example.com/cover.jpg',
      },
    ];

    vi.mocked(ndlApi.fetchBooksByTitle).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('テスト');
    });

    // 500ms経過前は検索が実行されない
    expect(ndlApi.fetchBooksByTitle).not.toHaveBeenCalled();

    // 500ms経過後に検索が実行される
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(ndlApi.fetchBooksByTitle).toHaveBeenCalledWith('テスト');
    expect(result.current.searchResults).toEqual(mockResults);
  });

  it('空文字の場合は検索を実行しない', async () => {
    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(ndlApi.fetchBooksByTitle).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it('スペースのみの場合は検索を実行しない', async () => {
    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('   ');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(ndlApi.fetchBooksByTitle).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it('連続入力時は最後の入力のみ検索される（debounce）', async () => {
    vi.mocked(ndlApi.fetchBooksByTitle).mockResolvedValue([]);

    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('テ');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.searchTitle('テス');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.searchTitle('テスト');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // 最後の入力のみ検索される
    expect(ndlApi.fetchBooksByTitle).toHaveBeenCalledTimes(1);
    expect(ndlApi.fetchBooksByTitle).toHaveBeenCalledWith('テスト');
  });

  it('clearResultsで検索結果をクリアする', async () => {
    const mockResults = [
      {
        title: 'テスト書籍',
        author: null,
        isbn: null,
        totalPages: null,
        coverUrl: null,
      },
    ];

    vi.mocked(ndlApi.fetchBooksByTitle).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('テスト');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.searchResults).toEqual(mockResults);

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('検索エラー時は空配列を返す', async () => {
    vi.mocked(ndlApi.fetchBooksByTitle).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useTitleSearch());

    act(() => {
      result.current.searchTitle('テスト');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });
});
