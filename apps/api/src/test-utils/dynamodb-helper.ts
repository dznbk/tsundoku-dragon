/**
 * DynamoDB Local統合テスト用ヘルパー
 *
 * このモジュールは統合テストで使用するDynamoDB Localとの
 * 接続・データ操作を提供する
 */

import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Book } from '@tsundoku-dragon/shared';
import type { Env } from '../types/env';

/**
 * 統合テスト用の環境設定
 */
export const TEST_CONFIG = {
  endpoint: 'http://localhost:8000',
  region: 'ap-northeast-1',
  tableName: 'tsundoku-dragon-test',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
} as const;

let client: DynamoDBClient | null = null;
let docClient: DynamoDBDocumentClient | null = null;

/**
 * DynamoDBクライアントを取得（シングルトン）
 */
function getClient(): DynamoDBClient {
  if (!client) {
    client = new DynamoDBClient({
      endpoint: TEST_CONFIG.endpoint,
      region: TEST_CONFIG.region,
      credentials: TEST_CONFIG.credentials,
    });
  }
  return client;
}

/**
 * DynamoDB Document Clientを取得（シングルトン）
 */
function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(getClient(), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return docClient;
}

/**
 * テスト用テーブルをセットアップ
 * テーブルが存在しない場合は作成する
 */
export async function setupTestDB(): Promise<void> {
  const dynamoClient = getClient();

  try {
    // テーブルの存在確認
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: TEST_CONFIG.tableName })
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      // テーブルが存在しない場合は作成
      await dynamoClient.send(
        new CreateTableCommand({
          TableName: TEST_CONFIG.tableName,
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
    } else if (error instanceof ResourceInUseException) {
      // テーブル作成中の場合は無視
    } else {
      throw error;
    }
  }
}

/**
 * テストデータ（本）を投入
 */
export async function seedTestBooks(books: Book[]): Promise<void> {
  const dynamoDocClient = getDocClient();

  for (const book of books) {
    await dynamoDocClient.send(
      new PutCommand({
        TableName: TEST_CONFIG.tableName,
        Item: {
          PK: `USER#${book.userId}`,
          SK: `BOOK#${book.id}`,
          ...book,
        },
      })
    );
  }
}

/**
 * テストデータをすべて削除
 */
export async function cleanupTestData(): Promise<void> {
  const dynamoDocClient = getDocClient();

  try {
    const result = await dynamoDocClient.send(
      new ScanCommand({
        TableName: TEST_CONFIG.tableName,
      })
    );

    for (const item of result.Items ?? []) {
      await dynamoDocClient.send(
        new DeleteCommand({
          TableName: TEST_CONFIG.tableName,
          Key: {
            PK: item.PK,
            SK: item.SK,
          },
        })
      );
    }
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      // テーブルが存在しない場合は無視
      return;
    }
    throw error;
  }
}

/**
 * テーブルを削除
 */
export async function dropTestTable(): Promise<void> {
  const dynamoClient = getClient();

  try {
    await dynamoClient.send(
      new DeleteTableCommand({ TableName: TEST_CONFIG.tableName })
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      // テーブルが存在しない場合は無視
      return;
    }
    throw error;
  }
}

/**
 * 統合テスト用の環境変数を作成
 */
export function createTestEnv(): Env {
  return {
    AWS_ACCESS_KEY_ID: TEST_CONFIG.credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: TEST_CONFIG.credentials.secretAccessKey,
    AWS_REGION: TEST_CONFIG.region,
    DYNAMODB_ENDPOINT: TEST_CONFIG.endpoint,
    DYNAMODB_TABLE_NAME: TEST_CONFIG.tableName,
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };
}

/**
 * クライアント接続をリセット（テスト終了時に使用）
 */
export function resetClients(): void {
  if (docClient) {
    docClient = null;
  }
  if (client) {
    client.destroy();
    client = null;
  }
}
