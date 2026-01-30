import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BattleMessage } from './BattleMessage';

describe('BattleMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('メッセージが1文字ずつ表示される', async () => {
    const onComplete = vi.fn();
    render(
      <BattleMessage
        messages={['テスト']}
        onComplete={onComplete}
        typingSpeed={50}
        messageInterval={1000}
      />
    );

    // 初期状態は空（カーソル以外）
    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent?.replace('|', '')).toBe('');

    // 1文字目
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('テ');

    // 2文字目
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('テス');

    // 3文字目
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('テスト');
  });

  it('複数メッセージが順番に表示される', async () => {
    const onComplete = vi.fn();
    render(
      <BattleMessage
        messages={['AB', 'CD']}
        onComplete={onComplete}
        typingSpeed={50}
        messageInterval={100}
      />
    );

    const paragraph = screen.getByRole('paragraph');

    // 1つ目のメッセージをタイピング
    await act(async () => {
      vi.advanceTimersByTime(50); // A
    });
    await act(async () => {
      vi.advanceTimersByTime(50); // B
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('AB');

    // メッセージ間のインターバル
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // 2つ目のメッセージが始まる（リセットされる）
    expect(paragraph.textContent?.replace('|', '')).toBe('');

    // 2つ目のメッセージをタイピング
    await act(async () => {
      vi.advanceTimersByTime(50); // C
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('C');

    await act(async () => {
      vi.advanceTimersByTime(50); // D
    });
    expect(paragraph.textContent?.replace('|', '')).toBe('CD');
  });

  it('全メッセージ完了後に onComplete が呼ばれる', async () => {
    const onComplete = vi.fn();
    render(
      <BattleMessage
        messages={['AB']}
        onComplete={onComplete}
        typingSpeed={50}
        messageInterval={100}
      />
    );

    // タイピング完了
    await act(async () => {
      vi.advanceTimersByTime(50); // A
    });
    await act(async () => {
      vi.advanceTimersByTime(50); // B
    });

    expect(onComplete).not.toHaveBeenCalled();

    // インターバル後に完了
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('aria-live 属性が設定されている', () => {
    render(<BattleMessage messages={['テスト']} onComplete={vi.fn()} />);

    expect(screen.getByRole('paragraph')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });
});
