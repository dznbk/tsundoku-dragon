import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillCard } from './SkillCard';

describe('SkillCard', () => {
  it('スキル名が表示される', () => {
    render(
      <SkillCard
        name="TypeScript"
        level={5}
        currentExp={200}
        expToNextLevel={500}
        totalExp={1200}
      />
    );

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('レベルが正しく表示される', () => {
    render(
      <SkillCard
        name="React"
        level={10}
        currentExp={300}
        expToNextLevel={1000}
        totalExp={5000}
      />
    );

    expect(screen.getByText('Lv.10')).toBeInTheDocument();
  });

  it('経験値バーが表示される', () => {
    render(
      <SkillCard
        name="Node.js"
        level={3}
        currentExp={100}
        expToNextLevel={200}
        totalExp={400}
      />
    );

    expect(screen.getByText('EXP')).toBeInTheDocument();
    expect(screen.getByText('100/200')).toBeInTheDocument();
  });

  it('累計経験値が正しくフォーマットされて表示される', () => {
    render(
      <SkillCard
        name="Python"
        level={15}
        currentExp={500}
        expToNextLevel={2000}
        totalExp={12345}
      />
    );

    expect(screen.getByText('累計: 12,345 exp')).toBeInTheDocument();
  });

  it('累計経験値が0の場合も正しく表示される', () => {
    render(
      <SkillCard
        name="Rust"
        level={1}
        currentExp={0}
        expToNextLevel={50}
        totalExp={0}
      />
    );

    expect(screen.getByText('累計: 0 exp')).toBeInTheDocument();
  });
});
