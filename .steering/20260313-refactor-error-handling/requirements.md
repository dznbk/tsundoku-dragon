# カスタムエラークラスとグローバルエラーハンドラーの改善

## 概要

既存の `AppError` にエラーコード（`ErrorCode` enum）を導入し、エラーレスポンスに構造化された `code` フィールドを追加する。

## 背景

- 現在の `AppError` は `statusCode` と `message` のみ保持しており、クライアントがエラーを識別するには文字列比較（`error.message === '...'`）に依存している
- エラーコードを導入することで、クライアント側でのエラーハンドリングが型安全かつ堅牢になる
- Issue: https://github.com/dznbk/tsundoku-dragon/issues/80

## 要件

### 機能要件

- [x] `ErrorCode` enum を定義する（BOOK_NOT_FOUND, CANNOT_UPDATE_ARCHIVED_BOOK, BOOK_IS_ALREADY_ARCHIVED, BOOK_NOT_IN_READING_STATUS, CAN_ONLY_RESET_COMPLETED_BOOKS）
- [x] `AppError` クラスに `code` プロパティ（ErrorCode 型）を追加する
- [x] `BadRequestError` / `NotFoundError` のコンストラクタに `code` パラメータを追加する
- [x] グローバルエラーハンドラ `handleError` のレスポンスに `code` フィールドを含める
- [x] 各サービス層のエラー throw 箇所で適切な `ErrorCode` を指定する
- [x] 既存テストをエラーコード対応に更新する

### 非機能要件

- 既存のルートハンドラには影響を与えない（既にクリーンな実装）
- 後方互換性: エラーレスポンスに `error`（メッセージ）フィールドは残す

## 受け入れ条件

- [x] エラーレスポンスに `{ error: "メッセージ", code: "ERROR_CODE" }` 形式で返る
- [x] 全ユニットテスト・ルートテストがパスする
- [x] lint / typecheck / format がパスする

## 対象外（スコープ外）

- フロントエンドのエラーハンドリング変更
- 新しいエラーミドルウェア（既存の `handleError` を拡張する）
- ルートハンドラの変更（既にクリーン）

## 参考ドキュメント

- [docs/development-guidelines.md](../../docs/development-guidelines.md)
- [docs/repository-structure.md](../../docs/repository-structure.md)
