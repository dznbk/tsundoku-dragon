import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookService } from './bookService';
import type { Book } from '@tsundoku-dragon/shared';

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-id-123'),
}));

const mockSave = vi.fn();
const mockFindByUserId = vi.fn();
const mockFindById = vi.fn();
const mockUpdate = vi.fn();
const mockFindLogs = vi.fn();
const mockSaveLog = vi.fn();

vi.mock('../repositories/bookRepository', () => ({
  BookRepository: class {
    save = mockSave;
    findByUserId = mockFindByUserId;
    findById = mockFindById;
    update = mockUpdate;
    findLogs = mockFindLogs;
    saveLog = mockSaveLog;
  },
}));

const mockFindGlobalSkills = vi.fn();
const mockFindUserCustomSkills = vi.fn();
const mockSaveUserCustomSkill = vi.fn();

vi.mock('../repositories/skillRepository', () => ({
  SkillRepository: class {
    findGlobalSkills = mockFindGlobalSkills;
    findUserCustomSkills = mockFindUserCustomSkills;
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

    // デフォルトのモック設定（スキルを持つテストがエラーにならないように）
    mockFindGlobalSkills.mockResolvedValue([]);
    mockFindUserCustomSkills.mockResolvedValue([]);

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
        mockFindGlobalSkills.mockResolvedValue([]);
        mockFindUserCustomSkills.mockResolvedValue([]);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['ニッチな技術'],
        });

        expect(mockFindGlobalSkills).toHaveBeenCalledOnce();
        expect(mockFindUserCustomSkills).toHaveBeenCalledWith('user-123');
        expect(mockSaveUserCustomSkill).toHaveBeenCalledWith(
          'user-123',
          'ニッチな技術'
        );
      });

      it('グローバルスキルに存在する場合はカスタムスキルに登録しない', async () => {
        mockFindGlobalSkills.mockResolvedValue([
          { name: 'TypeScript', category: 'プログラミング言語' },
        ]);
        mockFindUserCustomSkills.mockResolvedValue([]);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['TypeScript'],
        });

        expect(mockFindGlobalSkills).toHaveBeenCalledOnce();
        expect(mockFindUserCustomSkills).toHaveBeenCalledWith('user-123');
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('カスタムスキルに既に存在する場合は重複登録しない', async () => {
        mockFindGlobalSkills.mockResolvedValue([]);
        mockFindUserCustomSkills.mockResolvedValue([
          { name: '既存のカスタムスキル', createdAt: '2024-01-01T00:00:00Z' },
        ]);

        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: ['既存のカスタムスキル'],
        });

        expect(mockFindGlobalSkills).toHaveBeenCalledOnce();
        expect(mockFindUserCustomSkills).toHaveBeenCalledWith('user-123');
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('スキルが空の場合は何もしない', async () => {
        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
          skills: [],
        });

        expect(mockFindGlobalSkills).not.toHaveBeenCalled();
        expect(mockFindUserCustomSkills).not.toHaveBeenCalled();
        expect(mockSaveUserCustomSkill).not.toHaveBeenCalled();
      });

      it('skillsが未指定の場合は何もしない', async () => {
        await service.createBook('user-123', {
          title: 'テスト本',
          totalPages: 100,
        });

        expect(mockFindGlobalSkills).not.toHaveBeenCalled();
        expect(mockFindUserCustomSkills).not.toHaveBeenCalled();
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

  describe('updateBook', () => {
    const mockBook: Book = {
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

    it('本を更新する', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      const updatedBook = { ...mockBook, title: '更新後タイトル' };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const result = await service.updateBook('user-123', 'book-123', {
        title: '更新後タイトル',
      });

      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        title: '更新後タイトル',
        totalPages: undefined,
        skills: undefined,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.title).toBe('更新後タイトル');
    });

    it('存在しない本はnullを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.updateBook('user-123', 'not-exist', {
        title: '更新後',
      });

      expect(result).toBeNull();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('アーカイブ済みの本は更新できない', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      await expect(
        service.updateBook('user-123', 'book-123', { title: '更新後' })
      ).rejects.toThrow('Cannot update archived book');
    });

    it('新規スキルをカスタムスキルに登録する', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockUpdate.mockResolvedValueOnce({ ...mockBook, skills: ['新スキル'] });
      mockFindGlobalSkills.mockResolvedValue([]);
      mockFindUserCustomSkills.mockResolvedValue([]);

      await service.updateBook('user-123', 'book-123', {
        skills: ['新スキル'],
      });

      expect(mockSaveUserCustomSkill).toHaveBeenCalledWith(
        'user-123',
        '新スキル'
      );
    });
  });

  describe('archiveBook', () => {
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

    it('本をアーカイブする', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockUpdate.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      const result = await service.archiveBook('user-123', 'book-123');

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        status: 'archived',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('存在しない本はfalseを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.archiveBook('user-123', 'not-exist');

      expect(result).toBe(false);
    });

    it('既にアーカイブ済みの本はエラー', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      await expect(service.archiveBook('user-123', 'book-123')).rejects.toThrow(
        'Book is already archived'
      );
    });
  });

  describe('resetBook', () => {
    const mockCompletedBook: Book = {
      id: 'book-123',
      userId: 'user-123',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 100,
      status: 'completed',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('討伐済みの本をリセットする', async () => {
      mockFindById.mockResolvedValueOnce(mockCompletedBook);
      const resetBook = {
        ...mockCompletedBook,
        currentPage: 0,
        round: 2,
        status: 'reading',
      };
      mockUpdate.mockResolvedValueOnce(resetBook);

      const result = await service.resetBook('user-123', 'book-123');

      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 0,
        round: 2,
        status: 'reading',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.round).toBe(2);
      expect(result?.currentPage).toBe(0);
    });

    it('存在しない本はnullを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.resetBook('user-123', 'not-exist');

      expect(result).toBeNull();
    });

    it('戦闘中の本はリセットできない', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockCompletedBook,
        status: 'reading',
      });

      await expect(service.resetBook('user-123', 'book-123')).rejects.toThrow(
        'Can only reset completed books'
      );
    });
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

    it('存在しない本はnullを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.getBookLogs('user-123', 'not-exist');

      expect(result).toBeNull();
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
    const mockBook: Book = {
      id: 'book-123',
      userId: 'user-123',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 30,
      status: 'reading',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('ログを記録しcurrentPageを更新する', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      const updatedBook = { ...mockBook, currentPage: 50 };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 20,
      });

      expect(mockSaveLog).toHaveBeenCalledWith(
        'user-123',
        'book-123',
        expect.objectContaining({
          id: 'generated-id-123',
          bookId: 'book-123',
          pagesRead: 20,
          createdAt: '2024-01-01T00:00:00.000Z',
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 50,
        status: 'reading',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.log.pagesRead).toBe(20);
      expect(result?.book.currentPage).toBe(50);
      expect(result?.defeat).toBe(false);
    });

    it('討伐時にstatusがcompletedになる', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, currentPage: 80 });
      const updatedBook = {
        ...mockBook,
        currentPage: 100,
        status: 'completed' as const,
      };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 20,
      });

      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 100,
        status: 'completed',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.defeat).toBe(true);
      expect(result?.book.status).toBe('completed');
    });

    it('pagesReadが残りページを超えた場合、自動補正される', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, currentPage: 90 });
      const updatedBook = {
        ...mockBook,
        currentPage: 100,
        status: 'completed' as const,
      };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const result = await service.recordBattle('user-123', 'book-123', {
        pagesRead: 50,
      });

      expect(mockSaveLog).toHaveBeenCalledWith(
        'user-123',
        'book-123',
        expect.objectContaining({
          pagesRead: 10,
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith('user-123', 'book-123', {
        currentPage: 100,
        status: 'completed',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result?.log.pagesRead).toBe(10);
      expect(result?.defeat).toBe(true);
    });

    it('memoを記録できる', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockUpdate.mockResolvedValueOnce({ ...mockBook, currentPage: 50 });

      await service.recordBattle('user-123', 'book-123', {
        pagesRead: 20,
        memo: 'テストメモ',
      });

      expect(mockSaveLog).toHaveBeenCalledWith(
        'user-123',
        'book-123',
        expect.objectContaining({
          memo: 'テストメモ',
        })
      );
    });

    it('存在しない本はnullを返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const result = await service.recordBattle('user-123', 'not-exist', {
        pagesRead: 20,
      });

      expect(result).toBeNull();
      expect(mockSaveLog).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('reading以外のstatusはエラー', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockBook,
        status: 'completed',
      });

      await expect(
        service.recordBattle('user-123', 'book-123', { pagesRead: 20 })
      ).rejects.toThrow('Book is not in reading status');

      expect(mockSaveLog).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('archivedの本もエラー', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockBook,
        status: 'archived',
      });

      await expect(
        service.recordBattle('user-123', 'book-123', { pagesRead: 20 })
      ).rejects.toThrow('Book is not in reading status');
    });
  });
});
