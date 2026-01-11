import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookService } from './bookService';
import type { Book } from '@tsundoku-dragon/shared';

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-id-123'),
}));

const mockSave = vi.fn();
const mockFindByUserId = vi.fn();
const mockFindById = vi.fn();

vi.mock('../repositories/bookRepository', () => ({
  BookRepository: class {
    save = mockSave;
    findByUserId = mockFindByUserId;
    findById = mockFindById;
  },
}));

const mockHasGlobalSkill = vi.fn();
const mockHasUserCustomSkill = vi.fn();
const mockSaveUserCustomSkill = vi.fn();

vi.mock('../repositories/skillRepository', () => ({
  SkillRepository: class {
    hasGlobalSkill = mockHasGlobalSkill;
    hasUserCustomSkill = mockHasUserCustomSkill;
    saveUserCustomSkill = mockSaveUserCustomSkill;
  },
}));

describe('BookService', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  let service: BookService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    service = new BookService(mockEnv);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createBook', () => {
    const input = {
      title: 'テスト本',
      totalPages: 100,
      skills: ['TypeScript'],
    };

    it('IDを生成する', async () => {
      const book = await service.createBook('user-123', input);

      expect(book.id).toBe('generated-id-123');
    });

    it('currentPageを0で初期化する', async () => {
      const book = await service.createBook('user-123', input);

      expect(book.currentPage).toBe(0);
    });

    it('statusをreadingで初期化する', async () => {
      const book = await service.createBook('user-123', input);

      expect(book.status).toBe('reading');
    });

    it('roundを1で初期化する', async () => {
      const book = await service.createBook('user-123', input);

      expect(book.round).toBe(1);
    });

    it('createdAt/updatedAtを設定する', async () => {
      const book = await service.createBook('user-123', input);

      expect(book.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(book.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('skillsが未指定の場合は空配列', async () => {
      const book = await service.createBook('user-123', {
        title: 'テスト本',
        totalPages: 100,
      });

      expect(book.skills).toEqual([]);
    });

    it('入力値を正しく設定する', async () => {
      const book = await service.createBook('user-123', {
        title: 'テスト本',
        isbn: '9784774183169',
        totalPages: 350,
        skills: ['DB', '設計'],
      });

      expect(book.title).toBe('テスト本');
      expect(book.isbn).toBe('9784774183169');
      expect(book.totalPages).toBe(350);
      expect(book.skills).toEqual(['DB', '設計']);
      expect(book.userId).toBe('user-123');
    });

    it('リポジトリのsaveを呼び出す', async () => {
      await service.createBook('user-123', input);

      expect(mockSave).toHaveBeenCalledOnce();
    });

    describe('カスタムスキル自動登録', () => {
      it('新規スキルをカスタムスキルとして登録する', async () => {
        mockHasGlobalSkill.mockResolvedValue(false);
        mockHasUserCustomSkill.mockResolvedValue(false);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['ニッチな技術'],
        });

        expect(mockHasGlobalSkill).toHaveBeenCalledWith('ニッチな技術');
        expect(mockHasUserCustomSkill).toHaveBeenCalledWith(
          'user-123',
          'ニッチな技術'
        );
        expect(mockSaveUserCustomSkill).toHaveBeenCalledWith(
          'user-123',
          'ニッチな技術'
        );
      });

      it('グローバルスキルに存在する場合はカスタムスキルに登録しない', async () => {
        mockHasGlobalSkill.mockResolvedValue(true);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['TypeScript'],
        });

        expect(mockHasGlobalSkill).toHaveBeenCalledWith('TypeScript');
        expect(mockHasUserCustomSkill).not.toHaveBeenCalled();
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('カスタムスキルに既に存在する場合は重複登録しない', async () => {
        mockHasGlobalSkill.mockResolvedValue(false);
        mockHasUserCustomSkill.mockResolvedValue(true);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['既存のカスタムスキル'],
        });

        expect(mockHasGlobalSkill).toHaveBeenCalledWith('既存のカスタムスキル');
        expect(mockHasUserCustomSkill).toHaveBeenCalledWith(
          'user-123',
          '既存のカスタムスキル'
        );
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('スキルが空の場合は何もしない', async () => {
        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: [],
        });

        expect(mockHasGlobalSkill).not.toHaveBeenCalled();
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('skillsが未指定の場合は何もしない', async () => {
        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
        });

        expect(mockHasGlobalSkill).not.toHaveBeenCalled();
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });
    });
  });

  describe('listBooks', () => {
    it('リポジトリから取得した本を返す', async () => {
      const mockBooks: Book[] = [
        {
          id: 'book-1',
          userId: 'user-123',
          title: '本1',
          totalPages: 100,
          currentPage: 0,
          status: 'reading',
          skills: [],
          round: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      mockFindByUserId.mockResolvedValueOnce(mockBooks);

      const result = await service.listBooks('user-123');

      expect(mockFindByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockBooks);
    });
  });

  describe('getBook', () => {
    it('存在する本を返す', async () => {
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
      mockFindById.mockResolvedValueOnce(mockBook);

      const result = await service.getBook('user-123', 'book-123');

      expect(mockFindById).toHaveBeenCalledWith('user-123', 'book-123');
      expect(result).toEqual(mockBook);
    });

    it('存在しない本はnullを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.getBook('user-123', 'not-exist');

      expect(result).toBeNull();
    });
  });
});
