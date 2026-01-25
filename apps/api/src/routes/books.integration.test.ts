import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import { Hono } from 'hono';
import type { Book, BattleLog } from '@tsundoku-dragon/shared';
import books from './books';
import {
  setupTestDB,
  cleanupTestData,
  createTestEnv,
  resetClients,
  seedTestBooks,
} from '../test-utils/dynamodb-helper';
import { BookRepository } from '../repositories/bookRepository';

// Firebase Auth のみモック（他は実際の実装を使用）
vi.mock('../middleware/auth', () => ({
  getAuthUserId: vi.fn(() => 'test-user'),
  authMiddleware: vi.fn(),
  getFirebaseToken: vi.fn(),
}));

/**
 * ユニークIDを生成
 * テスト間の独立性を確保するため、各テストで一意のIDを使用
 */
const createUniqueId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

/**
 * テスト用の本データを生成
 */
const createTestBook = (overrides?: Partial<Book>): Book => ({
  id: createUniqueId('book'),
  userId: 'test-user',
  title: 'テスト本',
  totalPages: 100,
  currentPage: 0,
  status: 'reading',
  skills: ['TypeScript'],
  round: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Books Routes Integration', () => {
  let testEnv: ReturnType<typeof createTestEnv>;
  let repository: BookRepository;

  const app = new Hono().route('/books', books);

  beforeAll(async () => {
    await setupTestDB();
    testEnv = createTestEnv();
    repository = new BookRepository(testEnv);
  });

  afterAll(async () => {
    await cleanupTestData();
    resetClients();
  });

  beforeEach(async () => {
    // 各テスト前にデータをクリーンアップ
    await cleanupTestData();
  });

  describe('PUT /books/:id', () => {
    it('本を更新してDBに永続化される', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後のタイトル', totalPages: 200 }),
        },
        testEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.title).toBe('更新後のタイトル');
      expect(body.totalPages).toBe(200);

      // DBに永続化されたことを確認
      const savedBook = await repository.findById('test-user', book.id);
      expect(savedBook).not.toBeNull();
      expect(savedBook?.title).toBe('更新後のタイトル');
      expect(savedBook?.totalPages).toBe(200);
    });

    it('存在しない本は404を返す', async () => {
      const res = await app.request(
        '/books/non-existent-id',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後' }),
        },
        testEnv
      );

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });

    it('アーカイブ済みの本は400を返す', async () => {
      const book = createTestBook({ status: 'archived' });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '更新後' }),
        },
        testEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Cannot update archived book');
    });
  });

  describe('DELETE /books/:id', () => {
    it('本をソフトデリート(archived)してDBに永続化される', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}`,
        { method: 'DELETE' },
        testEnv
      );

      expect(res.status).toBe(204);

      // DBでstatusがarchivedになっていることを確認
      const savedBook = await repository.findById('test-user', book.id);
      expect(savedBook).not.toBeNull();
      expect(savedBook?.status).toBe('archived');
    });

    it('存在しない本は404を返す', async () => {
      const res = await app.request(
        '/books/non-existent-id',
        { method: 'DELETE' },
        testEnv
      );

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });

    it('既にアーカイブ済みの本は400を返す', async () => {
      const book = createTestBook({ status: 'archived' });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}`,
        { method: 'DELETE' },
        testEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book is already archived');
    });
  });

  describe('POST /books/:id/reset', () => {
    it('完了した本をリセットしてcurrentPage: 0とroundがインクリメントされる', async () => {
      const book = createTestBook({
        status: 'completed',
        currentPage: 100,
        round: 1,
      });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/reset`,
        { method: 'POST' },
        testEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as Book;
      expect(body.currentPage).toBe(0);
      expect(body.round).toBe(2);
      expect(body.status).toBe('reading');

      // DBに永続化されたことを確認
      const savedBook = await repository.findById('test-user', book.id);
      expect(savedBook).not.toBeNull();
      expect(savedBook?.currentPage).toBe(0);
      expect(savedBook?.round).toBe(2);
      expect(savedBook?.status).toBe('reading');
    });

    it('存在しない本は404を返す', async () => {
      const res = await app.request(
        '/books/non-existent-id/reset',
        { method: 'POST' },
        testEnv
      );

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });

    it('戦闘中(reading)の本は400を返す', async () => {
      const book = createTestBook({ status: 'reading', currentPage: 50 });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/reset`,
        { method: 'POST' },
        testEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Can only reset completed books');
    });
  });

  describe('GET /books/:id/logs', () => {
    it('ログを正常に取得できる', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      // ログを投入
      const now = new Date();
      const log1: BattleLog = {
        id: createUniqueId('log'),
        bookId: book.id,
        pagesRead: 10,
        createdAt: new Date(now.getTime() - 1000).toISOString(),
      };
      const log2: BattleLog = {
        id: createUniqueId('log'),
        bookId: book.id,
        pagesRead: 20,
        createdAt: now.toISOString(),
      };
      await repository.saveLog('test-user', book.id, log1);
      await repository.saveLog('test-user', book.id, log2);

      const res = await app.request(`/books/${book.id}/logs`, {}, testEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        logs: BattleLog[];
        nextCursor?: string;
      };
      expect(body.logs).toHaveLength(2);
      // ログは新しい順で返される
      expect(body.logs[0].pagesRead).toBe(20);
      expect(body.logs[1].pagesRead).toBe(10);
    });

    it('limitパラメータが動作する', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      // 複数のログを投入
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const log: BattleLog = {
          id: createUniqueId('log'),
          bookId: book.id,
          pagesRead: (i + 1) * 10,
          createdAt: new Date(now.getTime() + i * 1000).toISOString(),
        };
        await repository.saveLog('test-user', book.id, log);
      }

      const res = await app.request(
        `/books/${book.id}/logs?limit=2`,
        {},
        testEnv
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        logs: BattleLog[];
        nextCursor?: string;
      };
      expect(body.logs).toHaveLength(2);
      expect(body.nextCursor).toBeDefined();
    });

    it('cursor-basedページネーションが動作する', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      // 複数のログを投入
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const log: BattleLog = {
          id: createUniqueId('log'),
          bookId: book.id,
          pagesRead: (i + 1) * 10,
          createdAt: new Date(now.getTime() + i * 1000).toISOString(),
        };
        await repository.saveLog('test-user', book.id, log);
      }

      // 最初のページを取得
      const res1 = await app.request(
        `/books/${book.id}/logs?limit=2`,
        {},
        testEnv
      );
      expect(res1.status).toBe(200);
      const body1 = (await res1.json()) as {
        logs: BattleLog[];
        nextCursor?: string;
      };
      expect(body1.logs).toHaveLength(2);
      expect(body1.nextCursor).toBeDefined();

      // 次のページを取得
      const res2 = await app.request(
        `/books/${book.id}/logs?limit=2&cursor=${body1.nextCursor}`,
        {},
        testEnv
      );
      expect(res2.status).toBe(200);
      const body2 = (await res2.json()) as {
        logs: BattleLog[];
        nextCursor?: string;
      };
      expect(body2.logs).toHaveLength(2);

      // 最初のページと次のページは異なるログを返す
      expect(body1.logs[0].id).not.toBe(body2.logs[0].id);
    });

    it('存在しない本は404を返す', async () => {
      const res = await app.request('/books/non-existent-id/logs', {}, testEnv);

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });
  });

  describe('POST /books/:id/logs', () => {
    it('ログを記録しcurrentPageが更新される', async () => {
      const book = createTestBook({ currentPage: 30 });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 20 }),
        },
        testEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        log: BattleLog;
        book: Book;
        defeat: boolean;
      };
      expect(body.log.pagesRead).toBe(20);
      expect(body.book.currentPage).toBe(50);
      expect(body.defeat).toBe(false);

      // DBに永続化されたことを確認
      const savedBook = await repository.findById('test-user', book.id);
      expect(savedBook?.currentPage).toBe(50);
    });

    it('討伐時にstatusがcompletedになる', async () => {
      const book = createTestBook({ currentPage: 80 });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 20 }),
        },
        testEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        log: BattleLog;
        book: Book;
        defeat: boolean;
      };
      expect(body.defeat).toBe(true);
      expect(body.book.status).toBe('completed');
      expect(body.book.currentPage).toBe(100);

      // DBに永続化されたことを確認
      const savedBook = await repository.findById('test-user', book.id);
      expect(savedBook?.status).toBe('completed');
    });

    it('pagesReadが残りページを超えた場合、自動補正される', async () => {
      const book = createTestBook({ currentPage: 90 });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 50 }),
        },
        testEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        log: BattleLog;
        book: Book;
        defeat: boolean;
      };
      expect(body.log.pagesRead).toBe(10);
      expect(body.book.currentPage).toBe(100);
      expect(body.defeat).toBe(true);
    });

    it('memoを記録できる', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 10, memo: 'テストメモ' }),
        },
        testEnv
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        log: BattleLog;
        book: Book;
        defeat: boolean;
      };
      expect(body.log.memo).toBe('テストメモ');
    });

    it('存在しない本は404を返す', async () => {
      const res = await app.request(
        '/books/non-existent-id/logs',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 10 }),
        },
        testEnv
      );

      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book not found');
    });

    it('reading以外のstatusは400を返す', async () => {
      const book = createTestBook({ status: 'completed', currentPage: 100 });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 10 }),
        },
        testEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book is not in reading status');
    });

    it('archivedの本は400を返す', async () => {
      const book = createTestBook({ status: 'archived' });
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 10 }),
        },
        testEnv
      );

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Book is not in reading status');
    });

    it('pagesReadが0以下の場合は400を返す', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 0 }),
        },
        testEnv
      );

      expect(res.status).toBe(400);
    });

    it('memoが1000文字を超える場合は400を返す', async () => {
      const book = createTestBook();
      await seedTestBooks([book]);

      const res = await app.request(
        `/books/${book.id}/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagesRead: 10, memo: 'a'.repeat(1001) }),
        },
        testEnv
      );

      expect(res.status).toBe(400);
    });
  });
});
