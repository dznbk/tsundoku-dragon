# 統合テストガイド

## 統合テストの目的と重要性

### なぜ統合テストが必要か

統合テストは、複数のコンポーネントが正しく連携して動作することを検証する。ユニットテストでは発見できない以下の問題を検出できる：

- データベースクエリの誤り（SQL/DynamoDB式の構文エラー）
- シリアライズ/デシリアライズの問題
- トランザクション境界の問題
- 実際のネットワーク通信における問題

### Unit / Integration / E2E の使い分け

| テスト種別  | 目的                           | 実行頻度        | 速度   |
| ----------- | ------------------------------ | --------------- | ------ |
| Unit        | 単一関数・クラスのロジック検証 | 毎コミット      | 最速   |
| Integration | コンポーネント間連携の検証     | 毎コミット      | 中程度 |
| E2E         | ユーザー視点での動作確認       | PR時/デプロイ前 | 低速   |

**このプロジェクトでの方針**：

- **Unit**: ビジネスロジック、計算処理、バリデーション
- **Integration**: Repository層とDB、API層全体
- **E2E**: 主要導線（ログイン → 本登録 → 戦闘 → 討伐）のみ

## ローカル環境のセットアップ

### DynamoDB Local の起動

Docker を使用して DynamoDB Local を起動する：

```bash
# DynamoDB Local の起動
docker run -d -p 8000:8000 amazon/dynamodb-local

# 起動確認
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

### 環境変数の設定

統合テスト用の環境変数を `.env.test` に設定：

```bash
# .env.test
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_REGION=ap-northeast-1
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=tsundoku-dragon-test
```

### テーブルの作成

テスト用テーブルを作成するスクリプト：

```bash
aws dynamodb create-table \
  --table-name tsundoku-dragon-test \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

## テストの実行方法

### コマンド

```bash
# 全テスト実行
npm test

# 統合テストのみ実行（ファイル名パターンで絞り込み）
npm test -- "**/*.integration.test.ts"

# 特定ファイルのテスト実行
npm test -- apps/api/src/repositories/bookRepository.integration.test.ts

# ウォッチモードで実行
npm test -- --watch
```

### テストファイルの命名規則

| 種別        | ファイル名パターン            | 例                                   |
| ----------- | ----------------------------- | ------------------------------------ |
| Unit        | `*.test.ts`                   | `bookService.test.ts`                |
| Integration | `*.integration.test.ts`       | `bookRepository.integration.test.ts` |
| E2E         | `*.e2e.test.ts` または `e2e/` | `book-flow.e2e.test.ts`              |

## デバッグ方法

### ログ出力

テスト中のログを確認するには：

```typescript
// vitest.config.ts でログレベルを設定
export default defineConfig({
  test: {
    // テスト中のconsole.logを表示
    silent: false,
  },
});
```

```typescript
// テストコード内でのデバッグ出力
it('本を保存できる', async () => {
  console.log('テストデータ:', testBook);
  const result = await repository.save(testBook);
  console.log('保存結果:', result);
});
```

### テストデータの確認

DynamoDB Local のデータを直接確認：

```bash
# テーブル内の全アイテムをスキャン
aws dynamodb scan \
  --table-name tsundoku-dragon-test \
  --endpoint-url http://localhost:8000

# 特定のアイテムを取得
aws dynamodb get-item \
  --table-name tsundoku-dragon-test \
  --key '{"PK": {"S": "USER#user-123"}, "SK": {"S": "BOOK#book-456"}}' \
  --endpoint-url http://localhost:8000
```

### よくあるエラーと対処法

| エラー                            | 原因                            | 対処法                       |
| --------------------------------- | ------------------------------- | ---------------------------- |
| `ResourceNotFoundException`       | テーブルが存在しない            | テーブル作成スクリプトを実行 |
| `Connection refused`              | DynamoDB Local が起動していない | `docker ps` で確認、起動     |
| `ValidationException`             | スキーマ不一致                  | PK/SK の形式を確認           |
| `ConditionalCheckFailedException` | 条件式の失敗                    | テストデータの状態を確認     |

## テストデータ管理

### フィクスチャの作成

再利用可能なテストデータを定義：

```typescript
// tests/fixtures/books.ts
import type { Book } from '@tsundoku-dragon/shared';

export const createTestBook = (overrides?: Partial<Book>): Book => ({
  id: 'test-book-001',
  userId: 'test-user-001',
  title: 'テスト本',
  totalPages: 100,
  currentPage: 0,
  status: 'reading',
  skills: ['TypeScript'],
  round: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});
```

### テスト間の独立性確保

各テストは他のテストに影響を与えないようにする：

```typescript
describe('BookRepository Integration', () => {
  beforeEach(async () => {
    // テスト前にデータをクリーンアップ
    await cleanupTestData();
  });

  afterEach(async () => {
    // テスト後にデータをクリーンアップ
    await cleanupTestData();
  });

  // または、各テストでユニークなIDを使用
  it('本を保存できる', async () => {
    const uniqueId = `book-${Date.now()}-${Math.random()}`;
    const book = createTestBook({ id: uniqueId });
    // ...
  });
});
```

### クリーンアップユーティリティ

```typescript
// tests/utils/cleanup.ts
export const cleanupTestData = async (tableName: string) => {
  const items = await dynamoClient.send(
    new ScanCommand({ TableName: tableName })
  );

  for (const item of items.Items || []) {
    await dynamoClient.send(
      new DeleteItemCommand({
        TableName: tableName,
        Key: { PK: item.PK, SK: item.SK },
      })
    );
  }
};
```

## DynamoDB Local の制限事項

DynamoDB Local は本番環境の DynamoDB と完全に同じではない。以下の機能は**サポートされていない**か、動作が異なる：

### 非対応機能

| 機能                       | 説明                             | 回避策                              |
| -------------------------- | -------------------------------- | ----------------------------------- |
| **TTL (Time To Live)**     | アイテムの自動削除               | テストではTTLに依存しない設計にする |
| **DynamoDB Streams**       | 変更データキャプチャ             | Streams依存のロジックはmockする     |
| **Global Tables**          | マルチリージョンレプリケーション | 単一リージョンでテスト              |
| **On-Demand Backup**       | オンデマンドバックアップ         | テストでは不要                      |
| **Point-in-Time Recovery** | 特定時点への復旧                 | テストでは不要                      |
| **Encryption at Rest**     | 保存時暗号化                     | テストでは不要                      |
| **VPC Endpoints**          | VPCエンドポイント                | ローカルでは不要                    |

### 動作が異なる機能

| 機能                     | 本番との違い         | 注意点                       |
| ------------------------ | -------------------- | ---------------------------- |
| **Provisioned Capacity** | 制限なし             | スロットリングのテストは不可 |
| **IAM認証**              | 任意の認証情報で動作 | 認証エラーのテストは別途必要 |
| **レイテンシー**         | ローカルなので高速   | パフォーマンステストには不適 |

### テストで考慮すべきこと

```typescript
// TTLに依存するロジックは本番環境でのみ動作確認
describe('TTL関連機能', () => {
  it.skip('TTLが設定された項目は自動削除される', () => {
    // DynamoDB Localでは動作しないためスキップ
    // 本番環境で手動確認が必要
  });
});
```

## 参考リンク

- [DynamoDB Local 公式ドキュメント](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [Vitest 公式ドキュメント](https://vitest.dev/)
- [開発ガイドライン - mockの使用方針](./development-guidelines.md#mockの使用方針デトロイト派)
