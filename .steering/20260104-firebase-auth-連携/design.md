# 設計書: Firebase Auth連携

## 意思決定

### 採用した設計

Hono公式の `@hono/firebase-auth` ミドルウェアを使用し、Firebase ID トークンを検証する。

### 代替案との比較

| 案                               | メリット             | デメリット                       | 採用 |
| -------------------------------- | -------------------- | -------------------------------- | ---- |
| @hono/firebase-auth              | Hono公式、設定が簡単 | Workers KVが必要                 | ✓    |
| firebase-auth-cloudflare-workers | 軽量、実績あり       | Hono統合を自前で書く必要         | -    |
| jose で自前JWT検証               | 依存少ない           | 公開鍵取得・キャッシュを自前実装 | -    |
| firebase-admin SDK               | 公式SDK              | Cloudflare Workersで動作しない   | -    |

### 選定理由

- Honoを採用しているため、公式ミドルウェアとの統合が最もシンプル
- 公開鍵のキャッシュにWorkers KVを使用でき、パフォーマンスが良い
- 内部で`firebase-auth-cloudflare-workers`を使用しており、実績あり

## データフロー

### 認証付きAPIリクエスト

1. クライアントが `Authorization: Bearer {IDトークン}` ヘッダーを付けてリクエスト
2. `verifyFirebaseAuth` ミドルウェアがトークンを検証
3. 検証成功: `c.get('firebaseToken')` でデコード済みトークンを取得
4. ユーザーIDは `firebaseToken.uid` から取得
5. 検証失敗: 401 Unauthorized を返却

### 公開鍵キャッシュ

1. 初回リクエスト時、GoogleからFirebase公開鍵を取得
2. Workers KVにキャッシュ（有効期限付き）
3. 2回目以降はKVから取得（高速）

## コンポーネント設計

### 追加・変更するファイル

| ファイル                          | 種別 | 責務                            |
| --------------------------------- | ---- | ------------------------------- |
| `apps/api/src/middleware/auth.ts` | 新規 | 認証ミドルウェア設定            |
| `apps/api/src/lib/dynamodb.ts`    | 変更 | Env型にFirebase設定を追加       |
| `apps/api/src/index.ts`           | 変更 | ミドルウェアを適用              |
| `apps/api/src/routes/books.ts`    | 変更 | getUserId関数をトークンから取得 |
| `apps/api/wrangler.toml`          | 変更 | 環境変数・KVバインディング追加  |

### 主要コンポーネント

#### 認証ミドルウェア (auth.ts)

**責務**: Firebase IDトークンの検証とユーザー情報の抽出

**インターフェース**:

```typescript
import { verifyFirebaseAuth, getFirebaseToken } from '@hono/firebase-auth';

// ミドルウェア適用
app.use(
  '/*',
  verifyFirebaseAuth({
    projectId: env.FIREBASE_PROJECT_ID,
    keyStore: WorkersKVStoreSingle.getOrInitialize(
      env.PUBLIC_JWK_CACHE_KEY,
      env.PUBLIC_JWK_CACHE_KV
    ),
  })
);

// ユーザーID取得
const token = getFirebaseToken(c);
const userId = token?.uid;
```

#### Env型の拡張

```typescript
export type Env = {
  // 既存
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  DYNAMODB_ENDPOINT?: string;
  DYNAMODB_TABLE_NAME: string;
  // 追加
  FIREBASE_PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  PUBLIC_JWK_CACHE_KV: KVNamespace;
};
```

## テスト戦略

### ユニットテスト

- **auth.ts**: トークン検証の成功/失敗ケース（モック使用）
- **books.ts**: 認証済みリクエストでuserIdが正しく取得されるか

### 統合テスト

- 有効なトークンでBook APIが動作すること
- 無効なトークンで401が返ること

## 依存ライブラリ

| パッケージ                       | バージョン | 用途                     |
| -------------------------------- | ---------- | ------------------------ |
| @hono/firebase-auth              | latest     | Hono用Firebase認証ミドル |
| firebase-auth-cloudflare-workers | (依存)     | トークン検証（内部依存） |

## セキュリティ考慮事項

- IDトークンは必ずサーバーサイドで検証（クライアントを信用しない）
- トークンの有効期限（1時間）は自動で検証される
- 公開鍵はGoogleから取得、改ざん不可

## 参考資料

- [@hono/firebase-auth npm](https://www.npmjs.com/package/@hono/firebase-auth)
- [firebase-auth-cloudflare-workers GitHub](https://github.com/Code-Hex/firebase-auth-cloudflare-workers)
