import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HpBar } from './HpBar';

describe('HpBar', () => {
  it('HPラベルが表示される', () => {
    render(<HpBar current={50} max={100} />);
    expect(screen.getByText('HP')).toBeInTheDocument();
  });

  it('残りHP/最大HPが正しく表示される', () => {
    render(<HpBar current={30} max={100} />);
    // current=30は読んだページ数なので、残りHP = 100-30 = 70
    expect(screen.getByText('70/100')).toBeInTheDocument();
  });

  it('全ページ読了時は残りHP 0が表示される', () => {
    render(<HpBar current={100} max={100} />);
    expect(screen.getByText('0/100')).toBeInTheDocument();
  });

  it('まだ読んでいない場合は最大HPが残りHPとして表示される', () => {
    render(<HpBar current={0} max={350} />);
    expect(screen.getByText('350/350')).toBeInTheDocument();
  });

  it('progressbar roleが設定されている', () => {
    render(<HpBar current={50} max={100} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('バーの幅が進捗に応じて設定される', () => {
    render(<HpBar current={25} max={100} />);
    const progressbar = screen.getByRole('progressbar');
    // current=25、残りは75。バーは残りの割合なので75%になる
    // ただし実装上はcurrent/maxの割合なので25%
    expect(progressbar).toHaveStyle({ width: '25%' });
  });

  describe('アニメーション', () => {
    it('animateTo に向かってアニメーションする', async () => {
      render(
        <HpBar current={0} max={100} animateTo={50} animationDuration={50} />
      );

      // 初期状態
      expect(screen.getByText('100/100')).toBeInTheDocument();

      // アニメーション完了後（waitForで待機）
      await waitFor(
        () => {
          expect(screen.getByText('50/100')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('アニメーション完了後に onAnimationComplete が呼ばれる', async () => {
      const onAnimationComplete = vi.fn();
      render(
        <HpBar
          current={0}
          max={100}
          animateTo={50}
          animationDuration={50}
          onAnimationComplete={onAnimationComplete}
        />
      );

      expect(onAnimationComplete).not.toHaveBeenCalled();

      // アニメーション完了まで待機
      await waitFor(
        () => {
          expect(onAnimationComplete).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });
});
