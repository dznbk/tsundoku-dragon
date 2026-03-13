# 設計書

## 意思決定

### 採用した設計

既存の `AppError` クラスに `ErrorCode` enum を追加し、`BadRequestError` / `NotFoundError` のコンストラクタ経由でエラーコードを受け取る。グローバルエラーハンドラはレスポンスに `code` フィールドを追加する。

### 代替案との比較

| 案                                              | メリット                         | デメリット               | 採用 |
| ----------------------------------------------- | -------------------------------- | ------------------------ | ---- |
| 案A: 既存 AppError に code を追加               | 変更が最小限、既存構造を活かせる | -                        | ✓    |
| 案B: エラーコードごとに個別のエラークラスを作成 | 型が厳密                         | クラス数が多くなりすぎる | -    |
| 案C: エラーコードをルート層で付与               | -                                | 責務分離に反する         | -    |

### 選定理由

既に `AppError` → `BadRequestError` / `NotFoundError` の継承構造が確立されており、`code` プロパティを追加するだけで目的を達成できる。サービス層でエラーコードを指定する方が責務として自然。

## データフロー

### エラー発生時のフロー

1. サービス層で `throw new NotFoundError(ErrorCode.BOOK_NOT_FOUND, 'Book not found')` を投げる
2. Honoのルートハンドラがキャッチせず、そのまま `app.onError` へ伝播
3. `handleError` で `AppError` を判定し、`{ error: message, code: errorCode }` を返す

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                      | 種別 | 責務                                       |
| --------------------------------------------- | ---- | ------------------------------------------ |
| `apps/api/src/lib/errors.ts`                  | 変更 | ErrorCode enum 追加、AppError に code 追加 |
| `apps/api/src/services/bookService.ts`        | 変更 | エラー throw に ErrorCode を指定           |
| `apps/api/src/services/battleService.ts`      | 変更 | エラー throw に ErrorCode を指定           |
| `apps/api/src/lib/errors.test.ts`             | 変更 | ErrorCode 関連テスト追加                   |
| `apps/api/src/services/bookService.test.ts`   | 変更 | エラーコード検証追加                       |
| `apps/api/src/services/battleService.test.ts` | 変更 | エラーコード検証追加                       |
| `apps/api/src/routes/books.test.ts`           | 変更 | レスポンスの code フィールド検証           |

### 主要コンポーネント

#### ErrorCode enum

**責務**: アプリケーション全体のエラーコードを一元管理

```typescript
export enum ErrorCode {
  BOOK_NOT_FOUND = 'BOOK_NOT_FOUND',
  CANNOT_UPDATE_ARCHIVED_BOOK = 'CANNOT_UPDATE_ARCHIVED_BOOK',
  BOOK_IS_ALREADY_ARCHIVED = 'BOOK_IS_ALREADY_ARCHIVED',
  BOOK_NOT_IN_READING_STATUS = 'BOOK_NOT_IN_READING_STATUS',
  CAN_ONLY_RESET_COMPLETED_BOOKS = 'CAN_ONLY_RESET_COMPLETED_BOOKS',
}
```

#### AppError（変更）

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: ErrorCode
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

#### BadRequestError / NotFoundError（変更）

```typescript
export class BadRequestError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}
```

#### handleError（変更）

```typescript
export function handleError(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    return c.json(
      { error: err.message, ...(err.code && { code: err.code }) },
      err.statusCode as ContentfulStatusCode
    );
  }
  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
}
```

## テスト戦略

### ユニットテスト

- `errors.test.ts`: ErrorCode enum の存在確認、AppError/BadRequestError/NotFoundError の code プロパティ検証
- `bookService.test.ts`: 各エラーケースで正しい ErrorCode が投げられることを検証
- `battleService.test.ts`: 各エラーケースで正しい ErrorCode が投げられることを検証

### ルートテスト

- `books.test.ts`: エラーレスポンスに `code` フィールドが含まれることを検証
