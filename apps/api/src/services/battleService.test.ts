import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BattleService } from './battleService';
import { BadRequestError, NotFoundError } from '../lib/errors';
import type { Book } from '@tsundoku-dragon/shared';

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-id-123'),
}));

const mockFindById = vi.fn();
const mockUpdate = vi.fn();
const mockFindLogs = vi.fn();
const mockSaveLog = vi.fn();

vi.mock('../repositories/bookRepository', () => ({
  BookRepository: class {
    findById = mockFindById;
    update = mockUpdate;
    findLogs = mockFindLogs;
    saveLog = mockSaveLog;
  },
}));

const mockFindUserSkillExp = vi.fn();
const mockUpsertUserSkillExp = vi.fn();

vi.mock('../repositories/skillRepository', () => ({
  SkillRepository: class {
    findUserSkillExp = mockFindUserSkillExp;
    upsertUserSkillExp = mockUpsertUserSkillExp;
  },
}));

describe('BattleService', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  let service: BattleService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // デフォルトの経験値モック設定
    mockFindUserSkillExp.mockResolvedValue(null);
    mockUpsertUserSkillExp.mockImplementation(
      async (_userId: string, skillName: string, expToAdd: number) => ({
        name: skillName,
        exp: expToAdd,
        level: expToAdd >= 50 ? 2 : 1,
      })
    );

    service = new BattleService(mockEnv);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getBookLogs', () => {
    const mockBook: Book = {
      id: 'book-123',
      userId: 'user-123',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 0,
      status: 'reading',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('本のログを取得する', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      const mockLogs = {
        logs: [
          {
            id: 'log-1',
            bookId: 'book-123',
            pagesRead: 30,
            createdAt: '2024-01-01T12:00:00Z',
          },
        ],
        nextCursor: undefined,
      };
      mockFindLogs.mockResolvedValueOnce(mockLogs);

      const result = await service.getBookLogs('user-123', 'book-123');

      expect(mockFindLogs).toHaveBeenCalledWith(
        'user-123',
        'book-123',
        undefined
      );
      expect(result?.logs).toHaveLength(1);
    });

    it('存在しない本はNotFoundErrorを投げる', async () => {
      mockFindById.mockResolvedValueOnce(null);

      await expect(
        service.getBookLogs('user-123', 'not-exist')
      ).rejects.toThrow(NotFoundError);
      expect(mockFindLogs).not.toHaveBeenCalled();
    });

    it('オプションを渡せる', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockFindLogs.mockResolvedValueOnce({ logs: [], nextCursor: undefined });

      await service.getBookLogs('user-123', 'book-123', {
        limit: 10,
        cursor: 'abc',
      });

      expect(mockFindLogs).toHaveBeenCalledWith('user-123', 'book-123', {
        limit: 10,
        cursor: 'abc',
      });
    });
  });

  describe('recordBattle', () => {
    const mockReadingBook: Book = {
      id: 'book-123',
      userId: 'user-123',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 50,
      status: 'reading',
      skills: ['TypeScript'],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('ログを記録してcurrentPageを更新する', async () => {
      mockFindById.mockResolvedValueOnce(mockReadingBook);
      const updatedBook = { ...mockReadingBook, currentPage: 80 };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 30,
        memo: 'テストメモ',
      });

      expect(mockSaveLog).toHaveBeenCalledWith('user-123', 'book-123', {
        id: 'generated-id-123',
        bookId: 'book-123',
        pagesRead: 30,
        memo: 'テストメモ',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 80,
        status: 'reading',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.log.pagesRead).toBe(30);
      expect(result?.book.currentPage).toBe(80);
      expect(result?.defeat).toBe(false);
    });

    it('討伐時にstatusがcompletedになる', async () => {
      mockFindById.mockResolvedValueOnce(mockReadingBook);
      const completedBook = {
        ...mockReadingBook,
        currentPage: 100,
        status: 'completed',
      };
      mockUpdate.mockResolvedValueOnce(completedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 50,
      });

      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 100,
        status: 'completed',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.defeat).toBe(true);
    });

    it('pagesReadが残りページを超えた場合、自動補正される', async () => {
      mockFindById.mockResolvedValueOnce(mockReadingBook);
      const completedBook = {
        ...mockReadingBook,
        currentPage: 100,
        status: 'completed',
      };
      mockUpdate.mockResolvedValueOnce(completedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 100,
      });

      expect(mockSaveLog).toHaveBeenCalledWith(
        'user-123',
        'book-123',
        expect.objectContaining({ pagesRead: 50 })
      );
      expect(result?.log.pagesRead).toBe(50);
      expect(result?.defeat).toBe(true);
    });

    it('存在しない本はNotFoundErrorを投げる', async () => {
      mockFindById.mockResolvedValueOnce(null);

      await expect(
        service.recordBattle('user-123', 'not-exist', { pagesRead: 30 })
      ).rejects.toThrow(NotFoundError);
      expect(mockSaveLog).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('reading以外のstatusはエラー', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockReadingBook,
        status: 'completed',
      });

      await expect(
        service.recordBattle('user-123', 'book-123', { pagesRead: 30 })
      ).rejects.toThrow(BadRequestError);
    });

    it('archived状態の本はエラー', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockReadingBook,
        status: 'archived',
      });

      await expect(
        service.recordBattle('user-123', 'book-123', { pagesRead: 30 })
      ).rejects.toThrow(BadRequestError);
    });

    describe('経験値システム', () => {
      it('経験値が各スキルに付与される', async () => {
        mockFindById.mockResolvedValueOnce(mockReadingBook);
        const updatedBook = { ...mockReadingBook, currentPage: 80 };
        mockUpdate.mockResolvedValueOnce(updatedBook);

        const result = await service.recordBattle('user-123', 'book-123', {
          pagesRead: 30,
        });

        expect(mockUpsertUserSkillExp).toHaveBeenCalledWith(
          'user-123',
          'TypeScript',
          30
        );
        expect(result?.expGained).toBe(30);
        expect(result?.defeatBonus).toBe(0);
        expect(result?.skillResults).toHaveLength(1);
        expect(result?.skillResults[0].skillName).toBe('TypeScript');
        expect(result?.skillResults[0].expGained).toBe(30);
      });

      it('討伐時にボーナスが加算される', async () => {
        mockFindById.mockResolvedValueOnce(mockReadingBook);
        const completedBook = {
          ...mockReadingBook,
          currentPage: 100,
          status: 'completed',
        };
        mockUpdate.mockResolvedValueOnce(completedBook);

        const result = await service.recordBattle('user-123', 'book-123', {
          pagesRead: 50,
        });

        // 50ページ読了 + 討伐ボーナス(100 * 0.1 = 10) = 60
        expect(mockUpsertUserSkillExp).toHaveBeenCalledWith(
          'user-123',
          'TypeScript',
          60
        );
        expect(result?.expGained).toBe(60);
        expect(result?.defeatBonus).toBe(10);
      });

      it('レベルアップが正しく検出される', async () => {
        // 既存の経験値: 40（レベル1）
        mockFindUserSkillExp.mockResolvedValueOnce({
          name: 'TypeScript',
          exp: 40,
          level: 1,
        });
        // 更新後: 70exp（レベル2）
        mockUpsertUserSkillExp.mockResolvedValueOnce({
          name: 'TypeScript',
          exp: 70,
          level: 2,
        });

        mockFindById.mockResolvedValueOnce(mockReadingBook);
        const updatedBook = { ...mockReadingBook, currentPage: 80 };
        mockUpdate.mockResolvedValueOnce(updatedBook);

        const result = await service.recordBattle('user-123', 'book-123', {
          pagesRead: 30,
        });

        expect(result?.skillResults[0].previousLevel).toBe(1);
        expect(result?.skillResults[0].currentLevel).toBe(2);
        expect(result?.skillResults[0].leveledUp).toBe(true);
      });

      it('複数スキルが同時にレベルアップする場合', async () => {
        const multiSkillBook: Book = {
          ...mockReadingBook,
          skills: ['TypeScript', 'React'],
        };
        mockFindById.mockResolvedValueOnce(multiSkillBook);
        const updatedBook = { ...multiSkillBook, currentPage: 80 };
        mockUpdate.mockResolvedValueOnce(updatedBook);

        // 両方のスキルが新規（経験値0、レベル1から開始）
        mockFindUserSkillExp.mockResolvedValue(null);
        mockUpsertUserSkillExp.mockImplementation(
          async (_userId: string, skillName: string, expToAdd: number) => ({
            name: skillName,
            exp: expToAdd,
            level: expToAdd >= 50 ? 2 : 1,
          })
        );

        const result = await service.recordBattle('user-123', 'book-123', {
          pagesRead: 60,
        });

        expect(mockUpsertUserSkillExp).toHaveBeenCalledTimes(2);
        expect(mockUpsertUserSkillExp).toHaveBeenCalledWith(
          'user-123',
          'TypeScript',
          60
        );
        expect(mockUpsertUserSkillExp).toHaveBeenCalledWith(
          'user-123',
          'React',
          60
        );
        expect(result?.skillResults).toHaveLength(2);
        expect(result?.skillResults[0].leveledUp).toBe(true);
        expect(result?.skillResults[1].leveledUp).toBe(true);
      });

      it('スキルがない本の場合は経験値更新をスキップ', async () => {
        const noSkillBook: Book = {
          ...mockReadingBook,
          skills: [],
        };
        mockFindById.mockResolvedValueOnce(noSkillBook);
        const updatedBook = { ...noSkillBook, currentPage: 80 };
        mockUpdate.mockResolvedValueOnce(updatedBook);

        const result = await service.recordBattle('user-123', 'book-123', {
          pagesRead: 30,
        });

        expect(mockFindUserSkillExp).not.toHaveBeenCalled();
        expect(mockUpsertUserSkillExp).not.toHaveBeenCalled();
        expect(result?.expGained).toBe(30);
        expect(result?.skillResults).toEqual([]);
      });
    });
  });
});
