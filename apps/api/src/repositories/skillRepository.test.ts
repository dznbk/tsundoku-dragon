import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillRepository } from './skillRepository';

vi.mock('../lib/dynamodb', () => ({
  createDynamoDBClient: vi.fn(() => ({
    send: vi.fn(),
  })),
}));

describe('SkillRepository', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  let repository: SkillRepository;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SkillRepository(mockEnv);
    mockSend = vi.mocked(
      (repository as unknown as { client: { send: ReturnType<typeof vi.fn> } })
        .client.send
    );
  });

  describe('findGlobalSkills', () => {
    it('グローバルスキル一覧を取得する', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'GLOBAL',
            SK: 'SKILL#TypeScript',
            category: 'プログラミング言語',
          },
          { PK: 'GLOBAL', SK: 'SKILL#React', category: 'フレームワーク' },
        ],
      });

      const result = await repository.findGlobalSkills();

      expect(mockSend).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'TypeScript',
        category: 'プログラミング言語',
      });
      expect(result[1]).toEqual({ name: 'React', category: 'フレームワーク' });
    });

    it('空の結果を正しく処理する', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await repository.findGlobalSkills();

      expect(result).toEqual([]);
    });
  });

  describe('findUserCustomSkills', () => {
    it('ユーザーのカスタムスキル一覧を取得する', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'USER#user-123',
            SK: 'CUSTOM_SKILL#ニッチな技術',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
      });

      const result = await repository.findUserCustomSkills('user-123');

      expect(mockSend).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'ニッチな技術',
        createdAt: '2024-01-01T00:00:00Z',
      });
    });
  });

  describe('hasGlobalSkill', () => {
    it('存在するグローバルスキルの場合trueを返す', async () => {
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'GLOBAL',
          SK: 'SKILL#TypeScript',
          category: 'プログラミング言語',
        },
      });

      const result = await repository.hasGlobalSkill('TypeScript');

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Key: {
          PK: 'GLOBAL',
          SK: 'SKILL#TypeScript',
        },
      });
      expect(result).toBe(true);
    });

    it('存在しないグローバルスキルの場合falseを返す', async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await repository.hasGlobalSkill('存在しないスキル');

      expect(result).toBe(false);
    });
  });

  describe('hasUserCustomSkill', () => {
    it('存在するカスタムスキルの場合trueを返す', async () => {
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'USER#user-123',
          SK: 'CUSTOM_SKILL#ニッチな技術',
          createdAt: '2024-01-01T00:00:00Z',
        },
      });

      const result = await repository.hasUserCustomSkill(
        'user-123',
        'ニッチな技術'
      );

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Key: {
          PK: 'USER#user-123',
          SK: 'CUSTOM_SKILL#ニッチな技術',
        },
      });
      expect(result).toBe(true);
    });

    it('存在しないカスタムスキルの場合falseを返す', async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await repository.hasUserCustomSkill(
        'user-123',
        '存在しないスキル'
      );

      expect(result).toBe(false);
    });
  });

  describe('saveUserCustomSkill', () => {
    it('カスタムスキルを保存する', async () => {
      mockSend.mockResolvedValueOnce({});
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

      await repository.saveUserCustomSkill('user-123', 'ニッチな技術');

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Item: {
          PK: 'USER#user-123',
          SK: 'CUSTOM_SKILL#ニッチな技術',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      });

      vi.useRealTimers();
    });
  });
});
