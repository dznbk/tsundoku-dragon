# 設計書

## 意思決定

### 採用した設計

カスタムエラークラス（`AppError` 基底クラス）を定義し、サービス層から throw する。Hono の `app.onError` でグローバルエラーハンドラを設定し、`AppError` インスタンスを HTTP ステータスコード付きの JSON レスポンスに変換する。

### 代替案との比較

| 案                                | メリット                            | デメリット                                        | 採用 |
| --------------------------------- | ----------------------------------- | ------------------------------------------------- | ---- |
| A: カスタムエラー + app.onError   | try-catch除去、一貫性高い、拡張容易 | エラークラスの追加コスト                          | ✓    |
| B: Hono HTTPException のみ使用    | Hono組み込み、追加コードが少ない    | サービス層がHonoに依存する                        | -    |
| C: エラーハンドリングミドルウェア | ルート単位で適用可能                | 結局try-catchが中に入るだけで本質的改善にならない | -    |

### 選定理由

- 案Aは**サービス層がフレームワーク非依存**を維持できる（レイヤー間の依存ルール遵守）
- 案Bは `hono/http-exception` をサービス層で import することになり、アーキテクチャのレイヤー違反
- `AppError` にステータスコードを持たせることで、ルート層は一切エラー変換を意識しなくてよい

## データフロー

### エラー発生時のフロー（変更後）

1. ルートハンドラがサービスメソッドを呼び出す
2. サービス層がビジネスルール違反を検出 → `AppError` サブクラスを throw
3. Hono がエラーをキャッチし `app.onError` に渡す
4. グローバルエラーハンドラが `AppError` か判定
5. `AppError` → `{ error: message }` を対応ステータスコードで返す
6. それ以外 → 500 Internal Server Error を返す

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                    | 種別 | 責務                                     |
| ------------------------------------------- | ---- | ---------------------------------------- |
| `apps/api/src/lib/errors.ts`                | 新規 | カスタムエラークラス定義                 |
| `apps/api/src/lib/errors.test.ts`           | 新規 | エラークラスのユニットテスト             |
| `apps/api/src/index.ts`                     | 変更 | グローバルエラーハンドラ追加             |
| `apps/api/src/index.test.ts`                | 変更 | グローバルエラーハンドラのテスト追加     |
| `apps/api/src/services/bookService.ts`      | 変更 | plain Error → カスタムエラークラスに置換 |
| `apps/api/src/services/bookService.test.ts` | 変更 | エラーアサーションをカスタムエラーに更新 |
| `apps/api/src/routes/books.ts`              | 変更 | try-catch除去                            |
| `apps/api/src/routes/books.test.ts`         | 変更 | テストの期待値を必要に応じて調整         |

### 主要コンポーネント

#### AppError（基底クラス）

**責務**: 全てのアプリケーションエラーの基底クラス。HTTPステータスコードを保持する。

**インターフェース**:

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

#### BadRequestError

**責務**: ビジネスルール違反を表す400エラー。

**インターフェース**:

```typescript
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'BadRequestError';
  }
}
```

#### グローバルエラーハンドラ

**責務**: `app.onError` で全ルートのエラーを一括処理。

**ロジック**:

```typescript
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  // 予期しないエラーは500
  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

## テスト戦略

### ユニットテスト

- `errors.ts`: AppError / BadRequestError の statusCode、message、instanceof チェーン
- `bookService.ts`: `BadRequestError` が throw されることを確認（既存テストの修正）
- `books.ts`（ルート）: 既存テストがそのままパスすることを確認
- `index.ts`: グローバルエラーハンドラが AppError を正しくレスポンスに変換することを確認

### 統合テスト

- 既存の統合テスト (`books.integration.test.ts`) がパスすることを確認
