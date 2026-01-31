import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillListPage } from './SkillListPage';

// useSkills フックをモック
vi.mock('../features/skills/hooks/useSkills', () => ({
  useSkills: vi.fn(),
}));

import { useSkills } from '../features/skills/hooks/useSkills';

const mockUseSkills = vi.mocked(useSkills);

describe('SkillListPage', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('読み込み中の状態が表示される', () => {
    mockUseSkills.mockReturnValue({
      skills: [],
      isLoading: true,
      error: null,
    });

    render(<SkillListPage onBack={mockOnBack} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態が表示される', () => {
    mockUseSkills.mockReturnValue({
      skills: [],
      isLoading: false,
      error: 'スキルの取得に失敗しました',
    });

    render(<SkillListPage onBack={mockOnBack} />);

    expect(screen.getByText('スキルの取得に失敗しました')).toBeInTheDocument();
  });

  it('スキルがない場合のメッセージが表示される', () => {
    mockUseSkills.mockReturnValue({
      skills: [],
      isLoading: false,
      error: null,
    });

    render(<SkillListPage onBack={mockOnBack} />);

    expect(
      screen.getByText(
        'まだスキルがありません。本を読んでスキルを獲得しましょう！'
      )
    ).toBeInTheDocument();
  });

  it('スキル一覧が表示される', () => {
    mockUseSkills.mockReturnValue({
      skills: [
        { name: 'TypeScript', level: 5, exp: 1200 },
        { name: 'React', level: 3, exp: 400 },
      ],
      isLoading: false,
      error: null,
    });

    render(<SkillListPage onBack={mockOnBack} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('戻るボタンをクリックすると onBack が呼ばれる', () => {
    mockUseSkills.mockReturnValue({
      skills: [],
      isLoading: false,
      error: null,
    });

    render(<SkillListPage onBack={mockOnBack} />);

    fireEvent.click(screen.getByText('← 戻る'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  describe('ソート機能', () => {
    beforeEach(() => {
      mockUseSkills.mockReturnValue({
        skills: [
          { name: 'TypeScript', level: 5, exp: 1200 },
          { name: 'React', level: 3, exp: 400 },
          { name: 'Node.js', level: 5, exp: 1500 },
        ],
        isLoading: false,
        error: null,
      });
    });

    it('デフォルトでレベル順（降順）でソートされる', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const cards = screen.getAllByText(/Lv\.\d+/);
      // Node.js (Lv.5, exp 1500) が先
      // TypeScript (Lv.5, exp 1200) が次
      // React (Lv.3) が最後
      expect(cards[0]).toHaveTextContent('Lv.5');
      expect(cards[1]).toHaveTextContent('Lv.5');
      expect(cards[2]).toHaveTextContent('Lv.3');
    });

    it('名前順でソートできる', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'name' } });

      const skillNames = screen
        .getAllByText(/TypeScript|React|Node\.js/)
        .filter((el) => el.className.includes('name'));

      // アルファベット順: Node.js, React, TypeScript
      expect(skillNames[0]).toHaveTextContent('Node.js');
      expect(skillNames[1]).toHaveTextContent('React');
      expect(skillNames[2]).toHaveTextContent('TypeScript');
    });
  });

  describe('フィルタ機能', () => {
    beforeEach(() => {
      mockUseSkills.mockReturnValue({
        skills: [
          { name: 'TypeScript', level: 5, exp: 1200 },
          { name: 'React', level: 3, exp: 400 },
          { name: 'Node.js', level: 7, exp: 2000 },
        ],
        isLoading: false,
        error: null,
      });
    });

    it('スキル名でフィルタリングできる', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText('スキル名で検索...');
      fireEvent.change(input, { target: { value: 'type' } });

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    });

    it('大文字小文字を区別せずフィルタリングできる', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText('スキル名で検索...');
      fireEvent.change(input, { target: { value: 'REACT' } });

      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('該当なしの場合メッセージが表示される', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText('スキル名で検索...');
      fireEvent.change(input, { target: { value: 'xyz' } });

      expect(
        screen.getByText('該当するスキルがありません')
      ).toBeInTheDocument();
    });

    it('クリアボタンでフィルタをリセットできる', () => {
      render(<SkillListPage onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText('スキル名で検索...');
      fireEvent.change(input, { target: { value: 'type' } });

      expect(screen.queryByText('React')).not.toBeInTheDocument();

      const clearButton = screen.getByLabelText('検索をクリア');
      fireEvent.click(clearButton);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });
});
