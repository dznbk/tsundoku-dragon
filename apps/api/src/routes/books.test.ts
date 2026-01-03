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

vi.mock('../repositories/bookRepository', () => ({
  BookRepository: class {
    save = mockSave;
    findByUserId = mockFindByUserId;
    findById = mockFindById;
  },
}));

describe('Books Routes', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
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
            'X-User-Id': 'test-user',
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

    it('X-User-Idがない場合はdev-user-001を使う', async () => {
      mockSave.mockResolvedValueOnce(undefined);

      const res = await app.request(
        '/books',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'テスト本', totalPages: 100 }),
        },
        mockEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as Book;
      expect(body.userId).toBe('dev-user-001');
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

      const res = await app.request(
        '/books',
        {
          headers: { 'X-User-Id': 'test-user' },
        },
        mockEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as { books: Book[] };
      expect(body.books).toHaveLength(1);
      expect(body.books[0].title).toBe('本1');
    });

    it('空の一覧を返す', async () => {
      mockFindByUserId.mockResolvedValueOnce([]);

      const res = await app.request(
        '/books',
        {
          headers: { 'X-User-Id': 'test-user' },
        },
        mockEnv
      );

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

      const res = await app.request(
        '/books/book-123',
        {
          headers: { 'X-User-Id': 'test-user' },
        },
        mockEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.id).toBe('book-123');
      expect(body.title).toBe('テスト本');
    });

    it('存在しない本は404を返す', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await app.request(
        '/books/not-exist',
        {
          headers: { 'X-User-Id': 'test-user' },
        },
        mockEnv
      );

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });
  });
});
