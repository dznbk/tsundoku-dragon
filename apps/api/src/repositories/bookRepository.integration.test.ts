import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Book } from '@tsundoku-dragon/shared';
import { BookRepository } from './bookRepository';
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

/**
 * テスト用の本データを生成
 */
const createTestBook = (overrides?: Partial<Book>): Book => ({
  id: createUniqueId('book'),
  userId: createUniqueId('user'),
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

describe('BookRepository Integration', () => {
  let repository: BookRepository;
  const savedBookIds: Array<{ userId: string; bookId: string }> = [];

  beforeAll(async () => {
    await setupTestDB();
    const env = createTestEnv();
    repository = new BookRepository(env);
  });

  afterAll(async () => {
    await cleanupTestData();
    resetClients();
  });

  beforeEach(async () => {
    // 各テスト前にデータをクリーンアップしてテスト間の独立性を確保
    await cleanupTestData();
  });

  describe('save & findById', () => {
    it('本を保存して同じIDで取得できる', async () => {
      const book = createTestBook();
      savedBookIds.push({ userId: book.userId, bookId: book.id });

      await repository.save(book);
      const result = await repository.findById(book.userId, book.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(book.id);
      expect(result?.userId).toBe(book.userId);
      expect(result?.title).toBe(book.title);
      expect(result?.totalPages).toBe(book.totalPages);
      expect(result?.currentPage).toBe(book.currentPage);
      expect(result?.status).toBe(book.status);
      expect(result?.skills).toEqual(book.skills);
      expect(result?.round).toBe(book.round);
    });

    it('全フィールドが正しくマーシャリングされる', async () => {
      const book = createTestBook({
        title: '日本語タイトル',
        totalPages: 999,
        currentPage: 50,
        status: 'completed',
        skills: ['React', 'TypeScript', 'Node.js'],
        round: 3,
      });
      savedBookIds.push({ userId: book.userId, bookId: book.id });

      await repository.save(book);
      const result = await repository.findById(book.userId, book.id);

      expect(result).toEqual(book);
    });
  });

  describe('findByUserId', () => {
    it('同一ユーザーの複数の本が取得できる', async () => {
      const userId = createUniqueId('user');
      const books = [
        createTestBook({ userId, title: '本1' }),
        createTestBook({ userId, title: '本2' }),
        createTestBook({ userId, title: '本3' }),
      ];

      for (const book of books) {
        savedBookIds.push({ userId: book.userId, bookId: book.id });
        await repository.save(book);
      }

      const result = await repository.findByUserId(userId);

      expect(result).toHaveLength(3);
      expect(result.map((b) => b.title).sort()).toEqual(['本1', '本2', '本3']);
    });

    it('他ユーザーの本が含まれない', async () => {
      const userId1 = createUniqueId('user');
      const userId2 = createUniqueId('user');

      const book1 = createTestBook({ userId: userId1, title: 'ユーザー1の本' });
      const book2 = createTestBook({ userId: userId2, title: 'ユーザー2の本' });

      savedBookIds.push({ userId: book1.userId, bookId: book1.id });
      savedBookIds.push({ userId: book2.userId, bookId: book2.id });

      await repository.save(book1);
      await repository.save(book2);

      const result1 = await repository.findByUserId(userId1);
      const result2 = await repository.findByUserId(userId2);

      expect(result1).toHaveLength(1);
      expect(result1[0].title).toBe('ユーザー1の本');

      expect(result2).toHaveLength(1);
      expect(result2[0].title).toBe('ユーザー2の本');
    });
  });

  describe('エッジケース', () => {
    it('データがないユーザーで空配列が返る', async () => {
      const nonExistentUserId = createUniqueId('nonexistent');

      const result = await repository.findByUserId(nonExistentUserId);

      expect(result).toEqual([]);
    });

    it('存在しないIDでnullが返る', async () => {
      const userId = createUniqueId('user');
      const nonExistentBookId = createUniqueId('nonexistent');

      const result = await repository.findById(userId, nonExistentBookId);

      expect(result).toBeNull();
    });
  });
});
