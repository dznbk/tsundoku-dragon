import { describe, it, expect } from 'vitest';
import { expForLevel, levelFromExp, defeatBonus } from './expCalculator';

describe('expCalculator', () => {
  describe('expForLevel', () => {
    it('レベル1の必要経験値は50', () => {
      expect(expForLevel(1)).toBe(50);
    });

    it('レベル2の必要経験値は141 (floor(2^1.5 * 50))', () => {
      // 2^1.5 = 2.828..., 2.828... * 50 = 141.42...
      expect(expForLevel(2)).toBe(141);
    });

    it('レベル3の必要経験値は259 (floor(3^1.5 * 50))', () => {
      // 3^1.5 = 5.196..., 5.196... * 50 = 259.8...
      expect(expForLevel(3)).toBe(259);
    });

    it('レベル10の必要経験値は1581 (floor(10^1.5 * 50))', () => {
      // 10^1.5 = 31.62..., 31.62... * 50 = 1581.1...
      expect(expForLevel(10)).toBe(1581);
    });
  });

  describe('levelFromExp', () => {
    it('経験値0はレベル1', () => {
      expect(levelFromExp(0)).toBe(1);
    });

    it('経験値49はレベル1（まだレベル2に達していない）', () => {
      expect(levelFromExp(49)).toBe(1);
    });

    it('経験値50はレベル2（ちょうどレベル2に到達）', () => {
      expect(levelFromExp(50)).toBe(2);
    });

    it('経験値51はレベル2', () => {
      expect(levelFromExp(51)).toBe(2);
    });

    it('経験値190はレベル2（まだレベル3に達していない: 50+141=191）', () => {
      expect(levelFromExp(190)).toBe(2);
    });

    it('経験値191はレベル3（50+141=191でレベル3に到達）', () => {
      expect(levelFromExp(191)).toBe(3);
    });
  });

  describe('defeatBonus', () => {
    it('350ページの本の討伐ボーナスは35', () => {
      expect(defeatBonus(350)).toBe(35);
    });

    it('99ページの本の討伐ボーナスは9', () => {
      expect(defeatBonus(99)).toBe(9);
    });

    it('100ページの本の討伐ボーナスは10', () => {
      expect(defeatBonus(100)).toBe(10);
    });

    it('1ページの本の討伐ボーナスは0', () => {
      expect(defeatBonus(1)).toBe(0);
    });

    it('10ページの本の討伐ボーナスは1', () => {
      expect(defeatBonus(10)).toBe(1);
    });
  });
});
