import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnemyDisplay } from './EnemyDisplay';

describe('EnemyDisplay', () => {
  it('本のタイトルが表示される', () => {
    render(
      <EnemyDisplay title="テスト本" currentHp={50} maxHp={100} rank={1} />
    );
    expect(screen.getByText('テスト本')).toBeInTheDocument();
  });

  it('ランクバッジが表示される', () => {
    render(
      <EnemyDisplay title="テスト本" currentHp={50} maxHp={100} rank={3} />
    );
    expect(screen.getByText('Rank 3')).toBeInTheDocument();
  });

  it('HPバーが表示される', () => {
    render(
      <EnemyDisplay title="テスト本" currentHp={50} maxHp={100} rank={1} />
    );
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
  });

  it('ドラゴンのaria-labelにランクが含まれる', () => {
    render(
      <EnemyDisplay title="テスト本" currentHp={50} maxHp={100} rank={5} />
    );
    expect(screen.getByLabelText('ランク5のドラゴン')).toBeInTheDocument();
  });

  it.each([
    [1, '#27ae60'],
    [2, '#3498db'],
    [3, '#9b59b6'],
    [4, '#e74c3c'],
    [5, '#f1c40f'],
  ] as const)('ランク%iでドラゴンの背景色が%sになる', (rank, expectedColor) => {
    render(
      <EnemyDisplay title="テスト本" currentHp={50} maxHp={100} rank={rank} />
    );
    const dragon = screen.getByLabelText(`ランク${rank}のドラゴン`);
    expect(dragon).toHaveStyle({ backgroundColor: expectedColor });
  });
});
