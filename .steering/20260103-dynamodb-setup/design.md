# 設計書

## 意思決定

### 採用した設計

AWS SDK v3をCloudflare Workersで使用し、環境変数でローカル/本番を切り替える。

### 代替案との比較

| 案 | メリット | デメリット | 採用 |
|---|----------|-----------|------|
| AWS SDK v3 | Workers対応、公式、型安全 | バンドルサイズ大きめ | ✓ |
| REST API直接呼び出し | 軽量 | 署名処理が複雑、保守性低い | - |

### 選定理由

- AWS SDK v3はESM対応でCloudflare Workersで動作する
- DocumentClient相当の`@aws-sdk/lib-dynamodb`で開発効率が良い
- 公式SDKなので長期的な保守性が高い

## データフロー

### DynamoDB接続

1. Honoのコンテキストから環境変数を取得
2. 環境変数に応じてDynamoDBClientを初期化
3. ローカル: `DYNAMODB_ENDPOINT`が設定されていればそこに接続
4. 本番: AWS標準のエンドポイントに接続

## コンポーネント設計

### 追加・変更するファイル

| ファイル | 種別 | 責務 |
|---------|------|------|
| `compose.yaml` | 新規 | DynamoDB Localコンテナ定義 |
| `apps/api/src/lib/dynamodb.ts` | 新規 | DynamoDBクライアント生成 |
| `apps/api/src/index.ts` | 変更 | `/db/health`ルート追加 |
| `apps/api/.dev.vars` | 新規 | ローカル環境変数 |
| `apps/api/wrangler.toml` | 変更 | 環境変数の型定義 |
| `scripts/create-table.ts` | 新規 | テーブル作成スクリプト |
| `.gitignore` | 変更 | `.dev.vars`追加 |

### 主要コンポーネント

#### DynamoDBクライアント

**責務**: 環境に応じたDynamoDBClientの生成

**インターフェース**:

```typescript
type Env = {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  DYNAMODB_ENDPOINT?: string; // ローカル用
};

function createDynamoDBClient(env: Env): DynamoDBDocumentClient;
```

#### テーブル定義

**テーブル名**: `tsundoku-dragon`（ローカル）/ `tsundoku-dragon-prod`（本番）

**キー構造**:
- PK: string（パーティションキー）
- SK: string（ソートキー）

**容量**: プロビジョンド 5 RCU / 5 WCU

## テスト戦略

### ユニットテスト

- DynamoDBクライアント生成: 環境変数に応じた設定が適用されるか

### 統合テスト（手動）

- DynamoDB Local起動 → API起動 → `/db/health`で接続確認

---

## 依存ライブラリ

| パッケージ | 用途 |
|-----------|------|
| `@aws-sdk/client-dynamodb` | DynamoDB基本クライアント |
| `@aws-sdk/lib-dynamodb` | DocumentClient（高レベルAPI） |

## セキュリティ考慮事項

- 認証情報は環境変数で管理（コードにハードコードしない）
- `.dev.vars`は`.gitignore`に追加
- 本番シークレットは`wrangler secret put`で設定
