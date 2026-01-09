# 設計書

## 意思決定

### 採用した設計

DynamoDB Localを使った統合テスト環境を構築する。ユニットテストと統合テストを明確に分離し、別々に実行できる構成にする。

### 代替案との比較

| 案                    | メリット                     | デメリット         | 採用 |
| --------------------- | ---------------------------- | ------------------ | ---- |
| A: vitest設定を分離   | テストを独立実行可能、CI柔軟 | 設定ファイル増加   | ✓    |
| B: 同一config内で分岐 | 設定ファイル少ない           | 複雑、分離しにくい | -    |

### 選定理由

- 統合テストは起動に時間がかかるため、ユニットテストと分離して実行したい
- CI環境で必要に応じて統合テストをスキップできる柔軟性が欲しい
- 設定の可読性を優先

## データフロー

### 統合テスト実行フロー

1. `npm run db:start` - Docker ComposeでDynamoDB Local起動
2. `npm run db:setup` - テーブル作成
3. `npm run test:integration` - 統合テスト実行
4. `npm run db:stop` - DynamoDB Local停止

### テスト内のデータフロー

1. `setupTestDB()` - テスト環境のDynamoDBクライアント初期化
2. `seedTestBooks()` - テストデータ投入
3. テスト実行
4. `cleanupTestData()` - テストデータ削除

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                     | 種別 | 責務                             |
| -------------------------------------------- | ---- | -------------------------------- |
| `apps/api/src/test-utils/dynamodb-helper.ts` | 新規 | DynamoDB統合テスト用ヘルパー     |
| `apps/api/vitest.integration.config.ts`      | 新規 | 統合テスト専用vitest設定         |
| `apps/api/vitest.config.ts`                  | 変更 | `*.integration.test.ts`をexclude |
| `scripts/seed-test-data.ts`                  | 新規 | テストデータ投入スクリプト       |
| `scripts/setup-integration-tests.sh`         | 新規 | 統合テスト環境セットアップ       |
| `docker-compose.yml`                         | 新規 | DynamoDB Local用Docker設定       |
| `package.json` (ルート)                      | 変更 | db:\*, test:all スクリプト追加   |
| `apps/api/package.json`                      | 変更 | test:integration スクリプト追加  |

### 主要コンポーネント

#### dynamodb-helper.ts

**責務**: 統合テスト用のDynamoDB操作ヘルパー

**インターフェース**:

```typescript
// テスト環境の設定
export interface TestEnv {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  DYNAMODB_ENDPOINT: string;
  DYNAMODB_TABLE_NAME: string;
  FIREBASE_PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  PUBLIC_JWK_CACHE_KV: KVNamespace;
}

// DB接続初期化
export function setupTestDB(): Promise<TestEnv>;

// テストデータ投入
export function seedTestBooks(books: Book[]): Promise<void>;

// テストデータ削除
export function cleanupTestData(): Promise<void>;

// テスト環境作成
export function createTestEnv(): TestEnv;
```

#### vitest.integration.config.ts

**責務**: 統合テスト専用の設定

**設定内容**:

```typescript
export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30000, // DB操作のため長めに
    setupFiles: ['./src/test-utils/integration-setup.ts'],
  },
});
```

## テスト戦略

### ユニットテスト

- 既存の`*.test.ts`ファイル
- mockベースで高速実行
- `npm test`で実行

### 統合テスト

- `*.integration.test.ts`ファイル
- DynamoDB Localを使用
- `npm run test:integration`で実行

### 全テスト

- `npm run test:all`でユニット＋統合を両方実行

---

## 依存ライブラリ

新規追加なし（既存の@aws-sdk/client-dynamodbを使用）

## Docker設定

```yaml
# docker-compose.yml
services:
  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - '8000:8000'
    command: '-jar DynamoDBLocal.jar -sharedDb'
```
