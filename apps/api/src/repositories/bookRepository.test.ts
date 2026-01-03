import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookRepository } from './bookRepository';
import type { Book } from '@tsundoku-dragon/shared';

vi.mock('../lib/dynamodb', () => ({
  createDynamoDBClient: vi.fn(() => ({
    send: vi.fn(),
  })),
}));

describe('BookRepository', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
  };

  const mockBook: Book = {
    id: 'book-123',
    userId: 'user-456',
    title: 'テスト本',
    totalPages: 100,
    currentPage: 0,
    status: 'reading',
    skills: ['TypeScript'],
    round: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  let repository: BookRepository;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new BookRepository(mockEnv);
    mockSend = vi.mocked(
      (repository as unknown as { client: { send: ReturnType<typeof vi.fn> } })
        .client.send
    );
  });

  describe('save', () => {
    it('正しいPK/SKでアイテムを保存する', async () => {
      mockSend.mockResolvedValueOnce({});

      await repository.save(mockBook);

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Item: {
          PK: 'USER#user-456',
          SK: 'BOOK#book-123',
          ...mockBook,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('begins_withで正しくクエリする', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [{ PK: 'USER#user-456', SK: 'BOOK#book-123', ...mockBook }],
      });

      const result = await repository.findByUserId('user-456');

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': 'USER#user-456',
          ':skPrefix': 'BOOK#',
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('book-123');
    });

    it('空の結果を正しく処理する', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await repository.findByUserId('user-456');

      expect(result).toEqual([]);
    });

    it('Itemsがundefinedの場合も空配列を返す', async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await repository.findByUserId('user-456');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('存在する本を取得する', async () => {
      mockSend.mockResolvedValueOnce({
        Item: { PK: 'USER#user-456', SK: 'BOOK#book-123', ...mockBook },
      });

      const result = await repository.findById('user-456', 'book-123');

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Key: {
          PK: 'USER#user-456',
          SK: 'BOOK#book-123',
        },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('book-123');
    });

    it('存在しない本はnullを返す', async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await repository.findById('user-456', 'not-exist');

      expect(result).toBeNull();
    });
  });
});
