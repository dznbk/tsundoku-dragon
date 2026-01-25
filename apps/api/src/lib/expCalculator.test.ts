import { describe, it, expect } from 'vitest';
import { expForLevel, levelFromExp, defeatBonus } from './expCalculator';

describe('expCalculator', () => {
  describe('expForLevel', () => {
    it('expForLevel(1) = 50', () => {
      expect(expForLevel(1)).toBe(50);
    });

    it('expForLevel(2) = 141 (floor(2^1.5 * 50))', () => {
      // 2^1.5 = 2.828..., 2.828 * 50 = 141.42...
      expect(expForLevel(2)).toBe(141);
    });

    it('expForLevel(10) = 1581 (floor(10^1.5 * 50))', () => {
      // 10^1.5 = 31.622..., 31.622 * 50 = 1581.13...
      expect(expForLevel(10)).toBe(1581);
    });

    it('expForLevel(0) = 0', () => {
      expect(expForLevel(0)).toBe(0);
    });

    it('expForLevel(-1) = 0', () => {
      expect(expForLevel(-1)).toBe(0);
    });
  });

  describe('levelFromExp', () => {
    it('levelFromExp(0) = 1', () => {
      expect(levelFromExp(0)).toBe(1);
    });

    it('levelFromExp(49) = 1 (not enough for level 2)', () => {
      expect(levelFromExp(49)).toBe(1);
    });

    it('levelFromExp(50) = 2 (exactly enough for level 2)', () => {
      expect(levelFromExp(50)).toBe(2);
    });

    it('levelFromExp(51) = 2 (slightly over level 2 threshold)', () => {
      expect(levelFromExp(51)).toBe(2);
    });

    it('levelFromExp(190) = 2 (not enough for level 3)', () => {
      // 50 (lv1->2) + 141 (lv2->3) = 191
      expect(levelFromExp(190)).toBe(2);
    });

    it('levelFromExp(191) = 3 (exactly enough for level 3)', () => {
      expect(levelFromExp(191)).toBe(3);
    });

    it('negative exp returns level 1', () => {
      expect(levelFromExp(-100)).toBe(1);
    });
  });

  describe('defeatBonus', () => {
    it('defeatBonus(350) = 35', () => {
      expect(defeatBonus(350)).toBe(35);
    });

    it('defeatBonus(99) = 9', () => {
      expect(defeatBonus(99)).toBe(9);
    });

    it('defeatBonus(100) = 10', () => {
      expect(defeatBonus(100)).toBe(10);
    });

    it('defeatBonus(0) = 0', () => {
      expect(defeatBonus(0)).toBe(0);
    });

    it('defeatBonus(-10) = 0', () => {
      expect(defeatBonus(-10)).toBe(0);
    });
  });
});
