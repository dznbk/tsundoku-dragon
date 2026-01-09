/**
 * 統合テスト用テストデータ投入スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/seed-test-data.ts
 *
 * DynamoDB Localが起動している必要がある
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Book } from '@tsundoku-dragon/shared';

const TEST_CONFIG = {
  endpoint: 'http://localhost:8000',
  region: 'ap-northeast-1',
  tableName: 'tsundoku-dragon-test',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
} as const;

const client = new DynamoDBClient({
  endpoint: TEST_CONFIG.endpoint,
  region: TEST_CONFIG.region,
  credentials: TEST_CONFIG.credentials,
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// テストデータ
const testBooks: Book[] = [
  {
    id: 'test-book-001',
    userId: 'test-user-001',
    title: 'テスト本1: TypeScript入門',
    isbn: '978-4-123456-00-1',
    totalPages: 300,
    currentPage: 50,
    status: 'reading',
    skills: ['TypeScript', 'プログラミング'],
    round: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'test-book-002',
    userId: 'test-user-001',
    title: 'テスト本2: React実践ガイド',
    isbn: '978-4-123456-00-2',
    totalPages: 400,
    currentPage: 400,
    status: 'completed',
    skills: ['React', 'フロントエンド'],
    round: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'test-book-003',
    userId: 'test-user-002',
    title: 'テスト本3: AWS入門',
    totalPages: 250,
    currentPage: 0,
    status: 'reading',
    skills: ['AWS', 'クラウド'],
    round: 1,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

async function seedTestData() {
  console.log('Seeding test data...');
  console.log(`Table: ${TEST_CONFIG.tableName}`);
  console.log(`Endpoint: ${TEST_CONFIG.endpoint}`);
  console.log('');

  for (const book of testBooks) {
    await docClient.send(
      new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: {
          PK: `USER#${book.userId}`,
          SK: `BOOK#${book.id}`,
          ...book,
        },
      })
    );
    console.log(`  ✓ ${book.title}`);
  }

  console.log('');
  console.log('Done! Seeded', testBooks.length, 'books.');
}

seedTestData().catch(console.error);
