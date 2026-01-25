import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SkillRepository } from './skillRepository';
import {
  setupTestDB,
  cleanupTestData,
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
    await cleanupTestData();
    resetClients();
  });

  describe('upsertUserSkillExp', () => {
    it('新規スキルの経験値レコードを作成できる', async () => {
      const userId = createUniqueId('user');
      const skillName = 'TypeScript';

      const result = await repository.upsertUserSkillExp(userId, skillName, 50);

      expect(result.name).toBe(skillName);
      expect(result.exp).toBe(50);
      expect(result.level).toBe(2); // 50exp = level 2

      // 確認のため再取得
      const stored = await repository.findUserSkillExp(userId, skillName);
      expect(stored).not.toBeNull();
      expect(stored?.exp).toBe(50);
      expect(stored?.level).toBe(2);
    });

    it('既存スキルの経験値を加算できる', async () => {
      const userId = createUniqueId('user');
      const skillName = 'Go';

      // 初回: 30exp
      await repository.upsertUserSkillExp(userId, skillName, 30);

      // 2回目: +50exp = 80exp
      const result = await repository.upsertUserSkillExp(userId, skillName, 50);

      expect(result.name).toBe(skillName);
      expect(result.exp).toBe(80);
      expect(result.level).toBe(2); // 80exp still level 2 (needs 191 for level 3)

      // 確認のため再取得
      const stored = await repository.findUserSkillExp(userId, skillName);
      expect(stored?.exp).toBe(80);
    });

    it('経験値加算でレベルアップする', async () => {
      const userId = createUniqueId('user');
      const skillName = 'React';

      // 初回: 100exp (level 2)
      const first = await repository.upsertUserSkillExp(userId, skillName, 100);
      expect(first.level).toBe(2);

      // 2回目: +100exp = 200exp (level 3)
      const second = await repository.upsertUserSkillExp(
        userId,
        skillName,
        100
      );
      expect(second.exp).toBe(200);
      expect(second.level).toBe(3); // 200exp > 191 = level 3
    });

    it('複数スキルを独立して更新できる', async () => {
      const userId = createUniqueId('user');

      await repository.upsertUserSkillExp(userId, 'Skill1', 100);
      await repository.upsertUserSkillExp(userId, 'Skill2', 200);

      const skill1 = await repository.findUserSkillExp(userId, 'Skill1');
      const skill2 = await repository.findUserSkillExp(userId, 'Skill2');

      expect(skill1?.exp).toBe(100);
      expect(skill2?.exp).toBe(200);
    });
  });

  describe('findUserSkillExp', () => {
    it('存在しないスキルの場合はnullを返す', async () => {
      const userId = createUniqueId('user');

      const result = await repository.findUserSkillExp(
        userId,
        'NonExistentSkill'
      );

      expect(result).toBeNull();
    });

    it('存在するスキルの経験値を取得できる', async () => {
      const userId = createUniqueId('user');
      const skillName = 'Node.js';

      await repository.upsertUserSkillExp(userId, skillName, 150);

      const result = await repository.findUserSkillExp(userId, skillName);

      expect(result).not.toBeNull();
      expect(result?.name).toBe(skillName);
      expect(result?.exp).toBe(150);
    });
  });
});
