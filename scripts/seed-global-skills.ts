/**
 * グローバルスキル初期データ投入スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/seed-global-skills.ts [--local] [--prod] [--test]
 *
 * オプション:
 *   --local  DynamoDB Localに投入（デフォルト）
 *   --prod   AWS本番環境に投入
 *   --test   統合テスト用テーブルに投入
 *
 * DynamoDB Localが起動している必要がある（--local, --test の場合）
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

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
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// グローバルスキル定義
interface GlobalSkillDef {
  name: string;
  category: string;
}

const globalSkills: GlobalSkillDef[] = [
  // プログラミング言語
  { name: 'JavaScript', category: 'プログラミング言語' },
  { name: 'TypeScript', category: 'プログラミング言語' },
  { name: 'Python', category: 'プログラミング言語' },
  { name: 'Go', category: 'プログラミング言語' },
  { name: 'Rust', category: 'プログラミング言語' },
  { name: 'PHP', category: 'プログラミング言語' },
  { name: 'Java', category: 'プログラミング言語' },
  { name: 'C#', category: 'プログラミング言語' },

  // フレームワーク
  { name: 'React', category: 'フレームワーク' },
  { name: 'Vue', category: 'フレームワーク' },
  { name: 'Next.js', category: 'フレームワーク' },
  { name: 'Express', category: 'フレームワーク' },
  { name: 'NestJS', category: 'フレームワーク' },

  // データベース
  { name: 'MySQL', category: 'データベース' },
  { name: 'PostgreSQL', category: 'データベース' },
  { name: 'MongoDB', category: 'データベース' },
  { name: 'Redis', category: 'データベース' },
  { name: 'DynamoDB', category: 'データベース' },

  // インフラ
  { name: 'Docker', category: 'インフラ' },
  { name: 'Kubernetes', category: 'インフラ' },
  { name: 'AWS', category: 'インフラ' },
  { name: 'GCP', category: 'インフラ' },
  { name: 'Terraform', category: 'インフラ' },

  // その他
  { name: 'Git', category: 'その他' },
  { name: 'CI/CD', category: 'その他' },
  { name: 'テスト', category: 'その他' },
  { name: '設計', category: 'その他' },
  { name: 'アーキテクチャ', category: 'その他' },
];

function getEnvironmentName(): string {
  if (!isLocal) return 'production';
  if (isTest) return 'test';
  return 'local';
}

async function seedGlobalSkills() {
  console.log('Seeding global skills...');
  console.log(`Table: ${tableName}`);
  console.log(`Environment: ${getEnvironmentName()}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const skill of globalSkills) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            PK: 'GLOBAL',
            SK: `SKILL#${skill.name}`,
            category: skill.category,
          },
        })
      );
      console.log(`  ✓ ${skill.name} (${skill.category})`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ ${skill.name}: ${error}`);
      errorCount++;
    }
  }

  console.log('');
  console.log(`Done! Seeded ${successCount} skills.`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
  }
}

seedGlobalSkills().catch(console.error);
