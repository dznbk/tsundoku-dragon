import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BattleTransition } from './BattleTransition';

describe('BattleTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('書影→ドラゴンのフェード遷移が行われる', async () => {
    const onComplete = vi.fn();
    render(
      <BattleTransition isbn="9784123456789" rank={3} onComplete={onComplete} />
    );

    // 初期状態: 書影が表示される
    expect(screen.getByRole('img', { name: '書影' })).toBeInTheDocument();

    // 書影表示期間 (1000ms)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // クロスフェード中: ドラゴンも表示開始
    expect(screen.getByText('🐉')).toBeInTheDocument();

    // クロスフェード完了 (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // ドラゴン表示期間 (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // 完了
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('ISBNがない場合はドラゴンのみ表示', async () => {
    const onComplete = vi.fn();
    render(<BattleTransition rank={2} onComplete={onComplete} />);

    // 書影は表示されない
    expect(screen.queryByRole('img', { name: '書影' })).not.toBeInTheDocument();

    // ドラゴンが表示される
    expect(screen.getByText('🐉')).toBeInTheDocument();
    expect(screen.getByText('Rank 2')).toBeInTheDocument();

    // ドラゴン表示期間後に完了
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('aria-label が設定されている', () => {
    render(<BattleTransition rank={1} onComplete={vi.fn()} />);

    expect(screen.getByLabelText('戦闘開始演出')).toBeInTheDocument();
  });

  it('ランクに応じたバッジが表示される', () => {
    render(<BattleTransition rank={5} onComplete={vi.fn()} />);

    expect(screen.getByText('Rank 5')).toBeInTheDocument();
  });
});
