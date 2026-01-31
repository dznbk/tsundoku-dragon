import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VictoryScreen } from './VictoryScreen';
import type { SkillResult } from './VictoryScreen';

describe('VictoryScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    bookTitle: 'テストの本',
    expGained: 100,
    defeatBonus: 0,
    skillResults: [] as SkillResult[],
    onGoHome: vi.fn(),
  };

  async function advanceTypingAndInterval(
    text: string,
    typingSpeed = 50,
    messageInterval = 1000
  ) {
    // タイピングを進める
    for (let i = 0; i < text.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(typingSpeed);
      });
    }
    // メッセージ間のインターバル
    await act(async () => {
      vi.advanceTimersByTime(messageInterval);
    });
  }

  it('討伐メッセージが表示される', async () => {
    render(<VictoryScreen {...defaultProps} />);

    // タイピングを進める（インターバルなしでテキストだけ確認）
    const defeatMessage = 'テストの本 を たおした！';
    for (let i = 0; i < defeatMessage.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
    }

    // 「を たおした！」が含まれているか確認
    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent).toContain('テストの本 を たおした！');
  });

  it('経験値が正しく表示される', async () => {
    render(<VictoryScreen {...defaultProps} expGained={150} />);

    // 1つ目のメッセージを完了
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）をタイピング
    const expMessage = 'けいけんち 150 ポイント かくとく！';
    for (let i = 0; i < expMessage.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
    }

    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent).toContain(
      'けいけんち 150 ポイント かくとく！'
    );
  });

  it('討伐ボーナスがある場合のみボーナスメッセージが表示される', async () => {
    render(<VictoryScreen {...defaultProps} defeatBonus={50} />);

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // 3つ目のメッセージ（ボーナス）をタイピング
    const bonusMessage = 'とうばつボーナス 50 ポイント！';
    for (let i = 0; i < bonusMessage.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
    }

    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent).toContain('とうばつボーナス 50 ポイント！');
  });

  it('討伐ボーナスがない場合はボーナスメッセージが表示されない', async () => {
    const onGoHome = vi.fn();
    render(
      <VictoryScreen {...defaultProps} defeatBonus={0} onGoHome={onGoHome} />
    );

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // ボーナスメッセージがなく、演出完了後にボタンが表示される
    expect(
      screen.getByRole('button', { name: 'ホームへもどる' })
    ).toBeInTheDocument();
  });

  it('レベルアップしたスキルが全て表示される', async () => {
    const skillResults: SkillResult[] = [
      {
        skillName: 'TypeScript',
        expGained: 50,
        previousLevel: 2,
        currentLevel: 3,
        currentExp: 10,
        leveledUp: true,
      },
    ];

    render(<VictoryScreen {...defaultProps} skillResults={skillResults} />);

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // 3つ目のメッセージ（レベルアップ）をタイピング
    const levelUpMessage = `スキル『TypeScript』が レベル3 に あがった！`;
    for (let i = 0; i < levelUpMessage.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
    }

    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent).toContain(
      `スキル『TypeScript』が レベル3 に あがった！`
    );
  });

  it('複数スキルがレベルアップした場合、順番に表示される', async () => {
    const skillResults: SkillResult[] = [
      {
        skillName: 'TypeScript',
        expGained: 50,
        previousLevel: 2,
        currentLevel: 3,
        currentExp: 10,
        leveledUp: true,
      },
      {
        skillName: 'React',
        expGained: 50,
        previousLevel: 1,
        currentLevel: 2,
        currentExp: 5,
        leveledUp: true,
      },
    ];

    render(<VictoryScreen {...defaultProps} skillResults={skillResults} />);

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // 3つ目のメッセージ（TypeScript レベルアップ）
    await advanceTypingAndInterval(
      `スキル『TypeScript』が レベル3 に あがった！`
    );

    // 4つ目のメッセージ（React レベルアップ）をタイピング
    const reactLevelUpMessage = `スキル『React』が レベル2 に あがった！`;
    for (let i = 0; i < reactLevelUpMessage.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
    }

    const paragraph = screen.getByRole('paragraph');
    expect(paragraph.textContent).toContain(
      `スキル『React』が レベル2 に あがった！`
    );
  });

  it('全演出完了後に「ホームへもどる」ボタンが表示される', async () => {
    render(<VictoryScreen {...defaultProps} />);

    // 最初はボタンがない
    expect(
      screen.queryByRole('button', { name: 'ホームへもどる' })
    ).not.toBeInTheDocument();

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // ボタンが表示される
    expect(
      screen.getByRole('button', { name: 'ホームへもどる' })
    ).toBeInTheDocument();
  });

  it('ボタンクリックで onGoHome が呼ばれる', async () => {
    vi.useRealTimers(); // userEvent のために real timers に戻す
    const user = userEvent.setup();
    const onGoHome = vi.fn();

    vi.useFakeTimers();
    render(<VictoryScreen {...defaultProps} onGoHome={onGoHome} />);

    // 演出を完了させる
    await advanceTypingAndInterval('テストの本 を たおした！');
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    vi.useRealTimers();

    // ボタンをクリック
    const button = screen.getByRole('button', { name: 'ホームへもどる' });
    await user.click(button);

    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('レベルアップしていないスキルは表示されない', async () => {
    const skillResults: SkillResult[] = [
      {
        skillName: 'TypeScript',
        expGained: 50,
        previousLevel: 2,
        currentLevel: 2, // レベルアップしていない
        currentExp: 80,
        leveledUp: false,
      },
    ];

    render(<VictoryScreen {...defaultProps} skillResults={skillResults} />);

    // 1つ目のメッセージ（討伐）
    await advanceTypingAndInterval('テストの本 を たおした！');

    // 2つ目のメッセージ（経験値）
    await advanceTypingAndInterval('けいけんち 100 ポイント かくとく！');

    // レベルアップメッセージがなく、ボタンが表示される
    expect(
      screen.getByRole('button', { name: 'ホームへもどる' })
    ).toBeInTheDocument();
  });
});
