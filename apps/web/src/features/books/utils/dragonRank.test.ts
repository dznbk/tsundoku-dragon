import { describe, it, expect } from 'vitest';
import { getDragonRank, getDragonColor } from './dragonRank';

describe('getDragonRank', () => {
  it('200ページ以下はランク1を返す', () => {
    expect(getDragonRank(1)).toBe(1);
    expect(getDragonRank(100)).toBe(1);
    expect(getDragonRank(200)).toBe(1);
  });

  it('201〜300ページはランク2を返す', () => {
    expect(getDragonRank(201)).toBe(2);
    expect(getDragonRank(250)).toBe(2);
    expect(getDragonRank(300)).toBe(2);
  });

  it('301〜500ページはランク3を返す', () => {
    expect(getDragonRank(301)).toBe(3);
    expect(getDragonRank(400)).toBe(3);
    expect(getDragonRank(500)).toBe(3);
  });

  it('501〜700ページはランク4を返す', () => {
    expect(getDragonRank(501)).toBe(4);
    expect(getDragonRank(600)).toBe(4);
    expect(getDragonRank(700)).toBe(4);
  });

  it('701ページ以上はランク5を返す', () => {
    expect(getDragonRank(701)).toBe(5);
    expect(getDragonRank(1000)).toBe(5);
    expect(getDragonRank(2000)).toBe(5);
  });
});

describe('getDragonColor', () => {
  it('各ランクに対応した色を返す', () => {
    expect(getDragonColor(1)).toBe('#27ae60'); // 緑
    expect(getDragonColor(2)).toBe('#3498db'); // 青
    expect(getDragonColor(3)).toBe('#9b59b6'); // 紫
    expect(getDragonColor(4)).toBe('#e74c3c'); // 赤
    expect(getDragonColor(5)).toBe('#f1c40f'); // 金
  });
});
