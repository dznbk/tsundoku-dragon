import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SkillRepository } from './skillRepository';
import {
  setupTestDB,
  createTestEnv,
  resetClients,
} from '../test-utils/dynamodb-helper';

/**
 * ユニークIDを生成
 * テスト間の独立性を確保するため、各テストで一意のIDを使用
 */
const createUniqueId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

describe('SkillRepository Integration', () => {
  let repository: SkillRepository;

  beforeAll(async () => {
    await setupTestDB();
    const env = createTestEnv();
    repository = new SkillRepository(env);
  });

  afterAll(async () => {
    resetClients();
  });

  describe('upsertUserSkillExp', () => {
    it('新規スキル経験値を作成できる', async () => {
      const userId = createUniqueId('user');
      const skillName = 'TypeScript';
      const expToAdd = 50;

      const result = await repository.upsertUserSkillExp(
        userId,
        skillName,
        expToAdd
      );

      expect(result.name).toBe(skillName);
      expect(result.exp).toBe(50);
      expect(result.level).toBe(2); // 50exp = レベル2

      // 保存されたデータを確認
      const saved = await repository.findUserSkillExp(userId, skillName);
      expect(saved).not.toBeNull();
      expect(saved?.exp).toBe(50);
      expect(saved?.level).toBe(2);
    });

    it('既存スキル経験値を更新できる', async () => {
      const userId = createUniqueId('user');
      const skillName = 'React';

      // 初回: 40exp 追加
      const first = await repository.upsertUserSkillExp(userId, skillName, 40);
      expect(first.exp).toBe(40);
      expect(first.level).toBe(1);

      // 2回目: 20exp 追加（合計60exp）
      const second = await repository.upsertUserSkillExp(userId, skillName, 20);
      expect(second.exp).toBe(60);
      expect(second.level).toBe(2); // 60exp = レベル2

      // 保存されたデータを確認
      const saved = await repository.findUserSkillExp(userId, skillName);
      expect(saved?.exp).toBe(60);
      expect(saved?.level).toBe(2);
    });

    it('複数のスキルを独立して管理できる', async () => {
      const userId = createUniqueId('user');

      await repository.upsertUserSkillExp(userId, 'JavaScript', 100);
      await repository.upsertUserSkillExp(userId, 'Python', 50);

      const js = await repository.findUserSkillExp(userId, 'JavaScript');
      const py = await repository.findUserSkillExp(userId, 'Python');

      expect(js?.exp).toBe(100);
      expect(py?.exp).toBe(50);
    });

    it('レベルアップの境界値を正しく計算する', async () => {
      const userId = createUniqueId('user');
      const skillName = 'LevelTest';

      // 49exp: レベル1
      const lv1 = await repository.upsertUserSkillExp(userId, skillName, 49);
      expect(lv1.level).toBe(1);

      // +1exp（合計50exp）: レベル2
      const lv2 = await repository.upsertUserSkillExp(userId, skillName, 1);
      expect(lv2.exp).toBe(50);
      expect(lv2.level).toBe(2);
    });
  });

  describe('findUserSkillExp', () => {
    it('存在しないスキルでnullを返す', async () => {
      const userId = createUniqueId('user');

      const result = await repository.findUserSkillExp(userId, 'NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('findUserSkillExps', () => {
    it('ユーザーの全スキル経験値を取得できる', async () => {
      const userId = createUniqueId('user');

      await repository.upsertUserSkillExp(userId, 'Skill1', 100);
      await repository.upsertUserSkillExp(userId, 'Skill2', 200);
      await repository.upsertUserSkillExp(userId, 'Skill3', 50);

      const result = await repository.findUserSkillExps(userId);

      expect(result).toHaveLength(3);
      const names = result.map((s) => s.name).sort();
      expect(names).toEqual(['Skill1', 'Skill2', 'Skill3']);
    });

    it('他ユーザーのスキル経験値は含まれない', async () => {
      const userId1 = createUniqueId('user');
      const userId2 = createUniqueId('user');

      await repository.upsertUserSkillExp(userId1, 'User1Skill', 100);
      await repository.upsertUserSkillExp(userId2, 'User2Skill', 200);

      const result1 = await repository.findUserSkillExps(userId1);
      const result2 = await repository.findUserSkillExps(userId2);

      expect(result1).toHaveLength(1);
      expect(result1[0].name).toBe('User1Skill');

      expect(result2).toHaveLength(1);
      expect(result2[0].name).toBe('User2Skill');
    });
  });
});
