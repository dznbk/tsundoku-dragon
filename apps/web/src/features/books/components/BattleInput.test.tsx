import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BattleInput } from './BattleInput';

describe('BattleInput', () => {
  it('読んだページ数の入力欄が表示される', () => {
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);
    expect(screen.getByLabelText('読んだページ数')).toBeInTheDocument();
  });

  it('メモの入力欄が表示される', () => {
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);
    expect(screen.getByLabelText('メモ（任意）')).toBeInTheDocument();
  });

  it('こうげきボタンが表示される', () => {
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'こうげき' })
    ).toBeInTheDocument();
  });

  it('ページ数が空の場合、ボタンが無効になる', () => {
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'こうげき' });
    expect(button).toBeDisabled();
  });

  it('ページ数を入力すると、ボタンが有効になる', async () => {
    const user = userEvent.setup();
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, '50');

    const button = screen.getByRole('button', { name: 'こうげき' });
    expect(button).not.toBeDisabled();
  });

  it('ボタンをクリックするとonAttackが呼ばれる', async () => {
    const user = userEvent.setup();
    const onAttack = vi.fn();
    render(<BattleInput remainingPages={100} onAttack={onAttack} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, '50');

    const button = screen.getByRole('button', { name: 'こうげき' });
    await user.click(button);

    expect(onAttack).toHaveBeenCalledWith(50, undefined);
  });

  it('メモも一緒に送信される', async () => {
    const user = userEvent.setup();
    const onAttack = vi.fn();
    render(<BattleInput remainingPages={100} onAttack={onAttack} />);

    const pageInput = screen.getByLabelText('読んだページ数');
    await user.type(pageInput, '30');

    const memoInput = screen.getByLabelText('メモ（任意）');
    await user.type(memoInput, 'テストメモ');

    const button = screen.getByRole('button', { name: 'こうげき' });
    await user.click(button);

    expect(onAttack).toHaveBeenCalledWith(30, 'テストメモ');
  });

  it('残りページ数を超えた場合、自動補正ヒントが表示される', async () => {
    const user = userEvent.setup();
    render(<BattleInput remainingPages={50} onAttack={vi.fn()} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, '100');

    expect(
      screen.getByText(/残りページ数（50）に自動補正されます/)
    ).toBeInTheDocument();
  });

  it('残りページ数を超えた値は自動補正されてonAttackが呼ばれる', async () => {
    const user = userEvent.setup();
    const onAttack = vi.fn();
    render(<BattleInput remainingPages={50} onAttack={onAttack} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, '100');

    const button = screen.getByRole('button', { name: 'こうげき' });
    await user.click(button);

    expect(onAttack).toHaveBeenCalledWith(50, undefined);
  });

  it('数字以外は入力できない', async () => {
    const user = userEvent.setup();
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, 'abc123xyz');

    expect(input).toHaveValue('123');
  });

  it('disabled=trueの場合、入力が無効になる', () => {
    render(<BattleInput remainingPages={100} onAttack={vi.fn()} disabled />);

    const pageInput = screen.getByLabelText('読んだページ数');
    const memoInput = screen.getByLabelText('メモ（任意）');
    const button = screen.getByRole('button', { name: 'こうげき' });

    expect(pageInput).toBeDisabled();
    expect(memoInput).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('残りページが0の場合、ボタンが無効になる', async () => {
    const user = userEvent.setup();
    render(<BattleInput remainingPages={0} onAttack={vi.fn()} />);

    const input = screen.getByLabelText('読んだページ数');
    await user.type(input, '10');

    const button = screen.getByRole('button', { name: 'こうげき' });
    expect(button).toBeDisabled();
  });

  it('フォーム送信でもonAttackが呼ばれる', async () => {
    const onAttack = vi.fn();
    render(<BattleInput remainingPages={100} onAttack={onAttack} />);

    const input = screen.getByLabelText('読んだページ数');
    fireEvent.change(input, { target: { value: '25' } });

    const form = screen
      .getByRole('button', { name: 'こうげき' })
      .closest('form');
    fireEvent.submit(form!);

    expect(onAttack).toHaveBeenCalledWith(25, undefined);
  });
});
