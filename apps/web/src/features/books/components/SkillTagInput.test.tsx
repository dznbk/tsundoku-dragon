import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillTagInput } from './SkillTagInput';

describe('SkillTagInput', () => {
  const defaultProps = {
    value: [],
    onChange: vi.fn(),
    suggestions: ['React', 'TypeScript', 'JavaScript'],
    isLoadingSuggestions: false,
  };

  it('タグを表示する', () => {
    render(<SkillTagInput {...defaultProps} value={['React', 'TypeScript']} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('Enterキーでタグを追加する', () => {
    const onChange = vi.fn();
    render(<SkillTagInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Go' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Go']);
  });

  it('Backspaceキーで末尾のタグを削除する', () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        {...defaultProps}
        value={['React', 'TypeScript']}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('削除ボタンでタグを削除する', () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        {...defaultProps}
        value={['React', 'TypeScript']}
        onChange={onChange}
      />
    );

    const removeButton = screen.getByLabelText('Reactを削除');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['TypeScript']);
  });

  it('重複するタグは追加しない', () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput {...defaultProps} value={['React']} onChange={onChange} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('comboboxのaria属性が設定されている', () => {
    render(<SkillTagInput {...defaultProps} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('フォーカス時に候補を表示する', () => {
    render(<SkillTagInput {...defaultProps} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('ローディング中はローディング表示を出す', () => {
    render(<SkillTagInput {...defaultProps} isLoadingSuggestions={true} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('読込中...')).toBeInTheDocument();
  });

  it('ArrowDownで候補を選択する', () => {
    render(<SkillTagInput {...defaultProps} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('Escapeで候補を閉じる', () => {
    render(<SkillTagInput {...defaultProps} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
