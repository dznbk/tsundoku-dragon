import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpBar } from './ExpBar';

describe('ExpBar', () => {
  it('経験値が正しく表示される', () => {
    render(<ExpBar current={30} max={100} />);

    expect(screen.getByText('EXP')).toBeInTheDocument();
    expect(screen.getByText('30/100')).toBeInTheDocument();
  });

  it('プログレスバーの幅が正しく設定される', () => {
    render(<ExpBar current={50} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ width: '50%' });
  });

  it('経験値が0の場合、バーの幅は0%', () => {
    render(<ExpBar current={0} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ width: '0%' });
  });

  it('経験値が最大値を超える場合、バーの幅は100%', () => {
    render(<ExpBar current={150} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ width: '100%' });
  });

  it('最大値が0の場合、バーの幅は0%', () => {
    render(<ExpBar current={50} max={0} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ width: '0%' });
  });

  it('aria属性が正しく設定される', () => {
    render(<ExpBar current={30} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '30');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', '経験値 30/100');
  });
});
