import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleSearchInput } from './TitleSearchInput';
import * as useTitleSearchModule from '../hooks/useTitleSearch';

vi.mock('../hooks/useTitleSearch', () => ({
  useTitleSearch: vi.fn(),
}));

describe('TitleSearchInput', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();
  const mockSearchTitle = vi.fn();
  const mockClearResults = vi.fn();

  const defaultMockHook = {
    searchResults: [],
    isSearching: false,
    searchTitle: mockSearchTitle,
    clearResults: mockClearResults,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue(
      defaultMockHook
    );
  });

  it('入力欄にタイトルを入力できる', async () => {
    const user = userEvent.setup();

    render(
      <TitleSearchInput
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'テスト');

    expect(mockOnChange).toHaveBeenCalledWith('テ');
    expect(mockOnChange).toHaveBeenCalledWith('ス');
    expect(mockOnChange).toHaveBeenCalledWith('ト');
  });

  it('検索結果がドロップダウンで表示される', async () => {
    const mockResults = [
      {
        title: 'テスト書籍1',
        author: '著者1',
        isbn: '1234567890123',
        totalPages: 200,
        coverUrl: 'https://example.com/cover1.jpg',
      },
      {
        title: 'テスト書籍2',
        author: '著者2',
        isbn: '1234567890124',
        totalPages: 300,
        coverUrl: 'https://example.com/cover2.jpg',
      },
    ];

    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      searchResults: mockResults,
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('テスト書籍1')).toBeInTheDocument();
    expect(screen.getByText('テスト書籍2')).toBeInTheDocument();
    expect(screen.getByText('著者1')).toBeInTheDocument();
    expect(screen.getByText('200p')).toBeInTheDocument();
  });

  it('候補をクリックするとonSelectが呼ばれる', async () => {
    const mockResult = {
      title: 'テスト書籍',
      author: '著者名',
      isbn: '1234567890123',
      totalPages: 200,
      coverUrl: 'https://example.com/cover.jpg',
    };

    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      searchResults: [mockResult],
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const option = screen.getByText('テスト書籍');
    fireEvent.click(option);

    expect(mockOnSelect).toHaveBeenCalledWith(mockResult);
    expect(mockOnChange).toHaveBeenCalledWith('テスト書籍');
    expect(mockClearResults).toHaveBeenCalled();
  });

  it('矢印キーで候補を選択できる', async () => {
    const mockResults = [
      {
        title: '書籍1',
        author: null,
        isbn: null,
        totalPages: null,
        coverUrl: null,
      },
      {
        title: '書籍2',
        author: null,
        isbn: null,
        totalPages: null,
        coverUrl: null,
      },
    ];

    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      searchResults: mockResults,
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    // 下矢印で1つ目を選択
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    // 下矢印で2つ目を選択
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    // 上矢印で1つ目に戻る
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('Enterキーで選択中の候補を確定できる', async () => {
    const mockResult = {
      title: 'テスト書籍',
      author: null,
      isbn: '1234567890123',
      totalPages: 200,
      coverUrl: null,
    };

    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      searchResults: [mockResult],
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockResult);
  });

  it('Escapeキーでドロップダウンを閉じる', async () => {
    const mockResults = [
      {
        title: 'テスト書籍',
        author: null,
        isbn: null,
        totalPages: null,
        coverUrl: null,
      },
    ];

    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      searchResults: mockResults,
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('検索中は「検索中...」と表示される', () => {
    vi.mocked(useTitleSearchModule.useTitleSearch).mockReturnValue({
      ...defaultMockHook,
      isSearching: true,
    });

    render(
      <TitleSearchInput
        value="テスト"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('検索中...')).toBeInTheDocument();
  });

  it('エラー状態が正しく表示される', () => {
    render(
      <TitleSearchInput
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        error="タイトルは必須です"
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
