import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import books from './books';
import type { Book } from '@tsundoku-dragon/shared';

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'generated-id-123'),
}));

const mockSave = vi.fn();
const mockFindByUserId = vi.fn();
const mockFindById = vi.fn();
const mockUpdate = vi.fn();
const mockFindLogs = vi.fn();

vi.mock('../repositories/bookRepository', () => ({
  BookRepository: class {
    save = mockSave;
    findByUserId = mockFindByUserId;
    findById = mockFindById;
    update = mockUpdate;
    findLogs = mockFindLogs;
  },
}));

// Firebase Auth のモック
vi.mock('../middleware/auth', () => ({
  getAuthUserId: vi.fn(() => 'test-user'),
  authMiddleware: vi.fn(),
  getFirebaseToken: vi.fn(),
}));

describe('Books Routes', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  const app = new Hono().route('/books', books);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('POST /books', () => {
    it('201と作成した本を返す', async () => {
      mockSave.mockResolvedValueOnce(undefined);

      const res = await app.request(
        '/books',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'テスト本', totalPages: 100 }),
        },
        mockEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as Book;
      expect(body.id).toBe('generated-id-123');
      expect(body.title).toBe('テスト本');
      expect(body.totalPages).toBe(100);
      expect(body.userId).toBe('test-user');
      expect(body.currentPage).toBe(0);
      expect(body.status).toBe('reading');
    });

    it('titleがない場合は400を返す', async () => {
      const res = await app.request(
        '/books',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalPages: 100 }),
        },
        mockEnv
      );

      expect(res.status).toBe(400);
    });

    it('totalPagesがない場合は400を返す', async () => {
      const res = await app.request(
        '/books',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'テスト本' }),
        },
        mockEnv
      );

      expect(res.status).toBe(400);
    });

    it('totalPagesが0以下の場合は400を返す', async () => {
      const res = await app.request(
        '/books',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'テスト本', totalPages: 0 }),
        },
        mockEnv
      );

      expect(res.status).toBe(400);
    });
  });

  describe('GET /books', () => {
    it('本の一覧を返す', async () => {
      const mockBooks: Book[] = [
        {
          id: 'book-1',
          userId: 'test-user',
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

      const res = await app.request('/books', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as { books: Book[] };
      expect(body.books).toHaveLength(1);
      expect(body.books[0].title).toBe('本1');
    });

    it('空の一覧を返す', async () => {
      mockFindByUserId.mockResolvedValueOnce([]);

      const res = await app.request('/books', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as { books: Book[] };
      expect(body.books).toEqual([]);
    });
  });

  describe('GET /books/:id', () => {
    it('存在する本を返す', async () => {
      const mockBook: Book = {
        id: 'book-123',
        userId: 'test-user',
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

      const res = await app.request('/books/book-123', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.id).toBe('book-123');
      expect(body.title).toBe('テスト本');
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request('/books/not-exist', {}, mockEnv);

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });
  });

  describe('PUT /books/:id', () => {
    const mockBook: Book = {
      id: 'book-123',
      userId: 'test-user',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 0,
      status: 'reading',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('本を更新して返す', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      const updatedBook = { ...mockBook, title: '更新後' };
      mockUpdate.mockResolvedValueOnce(updatedBook);

      const res = await app.request(
        '/books/book-123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後' }),
        },
        mockEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.title).toBe('更新後');
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request(
        '/books/not-exist',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後' }),
        },
        mockEnv
      );

      expect(res.status).toBe(404);
    });

    it('アーカイブ済みの本は400を返す', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      const res = await app.request(
        '/books/book-123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後' }),
        },
        mockEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Cannot update archived book');
    });
  });

  describe('DELETE /books/:id', () => {
    const mockBook: Book = {
      id: 'book-123',
      userId: 'test-user',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 0,
      status: 'reading',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('本を削除して204を返す', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockUpdate.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      const res = await app.request(
        '/books/book-123',
        { method: 'DELETE' },
        mockEnv
      );

      expect(res.status).toBe(204);
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request(
        '/books/not-exist',
        { method: 'DELETE' },
        mockEnv
      );

      expect(res.status).toBe(404);
    });

    it('既にアーカイブ済みの本は400を返す', async () => {
      mockFindById.mockResolvedValueOnce({ ...mockBook, status: 'archived' });

      const res = await app.request(
        '/books/book-123',
        { method: 'DELETE' },
        mockEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book is already archived');
    });
  });

  describe('POST /books/:id/reset', () => {
    const mockCompletedBook: Book = {
      id: 'book-123',
      userId: 'test-user',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 100,
      status: 'completed',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('本をリセットして返す', async () => {
      mockFindById.mockResolvedValueOnce(mockCompletedBook);
      const resetBook = {
        ...mockCompletedBook,
        currentPage: 0,
        round: 2,
        status: 'reading',
      };
      mockUpdate.mockResolvedValueOnce(resetBook);

      const res = await app.request(
        '/books/book-123/reset',
        { method: 'POST' },
        mockEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.currentPage).toBe(0);
      expect(body.round).toBe(2);
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request(
        '/books/not-exist/reset',
        { method: 'POST' },
        mockEnv
      );

      expect(res.status).toBe(404);
    });

    it('戦闘中の本は400を返す', async () => {
      mockFindById.mockResolvedValueOnce({
        ...mockCompletedBook,
        status: 'reading',
      });

      const res = await app.request(
        '/books/book-123/reset',
        { method: 'POST' },
        mockEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Can only reset completed books');
    });
  });

  describe('GET /books/:id/logs', () => {
    const mockBook: Book = {
      id: 'book-123',
      userId: 'test-user',
      title: 'テスト本',
      totalPages: 100,
      currentPage: 0,
      status: 'reading',
      skills: [],
      round: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('ログ一覧を返す', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockFindLogs.mockResolvedValueOnce({
        logs: [
          {
            id: 'log-1',
            bookId: 'book-123',
            pagesRead: 30,
            createdAt: '2024-01-01T12:00:00Z',
          },
        ],
        nextCursor: undefined,
      });

      const res = await app.request('/books/book-123/logs', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        logs: unknown[];
        nextCursor?: string;
      };
      expect(body.logs).toHaveLength(1);
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request('/books/not-exist/logs', {}, mockEnv);

      expect(res.status).toBe(404);
    });

    it('limitとcursorをクエリパラメータで受け取る', async () => {
      mockFindById.mockResolvedValueOnce(mockBook);
      mockFindLogs.mockResolvedValueOnce({ logs: [], nextCursor: undefined });

      const res = await app.request(
        '/books/book-123/logs?limit=10&cursor=abc',
        {},
        mockEnv
      );

      expect(res.status).toBe(200);
      expect(mockFindLogs).toHaveBeenCalledWith('test-user', 'book-123', {
        limit: 10,
        cursor: 'abc',
      });
    });
  });
});
