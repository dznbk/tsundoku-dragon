/**
 * DynamoDBテーブル作成スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/create-table.ts [--local] [--test]
 *
 * オプション:
 *   --local  DynamoDB Localに作成（デフォルト）
 *   --prod   AWS本番環境に作成
 *   --test   統合テスト用テーブルを作成（ローカル環境のみ）
 */

import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';

const isLocal = !process.argv.includes('--prod');
const isTest = process.argv.includes('--test');

const config = isLocal
  ? {
      endpoint: 'http://localhost:8000',
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
    }
  : {
      region: process.env.AWS_REGION || 'ap-northeast-1',
    };

function getTableName(): string {
  if (!isLocal) return 'tsundoku-dragon-prod';
  if (isTest) return 'tsundoku-dragon-test';
  return 'tsundoku-dragon';
}

const tableName = getTableName();

const client = new DynamoDBClient(config);

function getEnvironmentName(): string {
  if (!isLocal) return 'production';
  if (isTest) return 'test';
  return 'local';
}

async function createTable() {
  console.log(`Creating table: ${tableName}`);
  console.log(`Environment: ${getEnvironmentName()}`);

  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
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

    console.log('Table created successfully!');
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log('Table already exists.');
    } else {
      throw error;
    }
  }

  // テーブル情報を表示
  const result = await client.send(
    new DescribeTableCommand({ TableName: tableName })
  );
  console.log('Table status:', result.Table?.TableStatus);
}

createTable().catch(console.error);
