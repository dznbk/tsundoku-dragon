# タスクリスト

## タスク完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール

- 全てのタスクを `[x]` にすること
- 未完了タスク `[ ]` を残したまま作業を終了しない
- 「時間の都合」「難しい」などの理由でのスキップは禁止

### スキップが許可されるケース

技術的理由に該当する場合のみ:

- 実装方針の変更により機能自体が不要になった
- アーキテクチャ変更により別の実装方法に置き換わった

スキップ時は理由を明記:

```markdown
- [~] タスク名 (スキップ理由: 具体的な技術的理由)
```

---

## 進捗

- 開始: 2026-01-18
- 完了: 2026-01-18

---

## フェーズ1: 共通型定義

- [x] `packages/shared/src/index.ts` に `BattleLog` 型を追加
- [x] `packages/shared/src/index.ts` の `BookStatus` に `archived` を追加

## フェーズ2: バックエンド - リポジトリ層

- [x] `bookRepository.ts` に `update` メソッドを追加
- [x] `bookRepository.ts` に `findLogs` メソッドを追加（ページネーション対応）
- [x] `bookRepository.ts` に `saveLog` メソッドを追加（テスト用）
- [x] `bookRepository.test.ts` にユニットテストを追加

## フェーズ3: バックエンド - サービス層

- [x] `bookService.ts` に `updateBook` メソッドを追加
- [x] `bookService.ts` に `archiveBook` メソッドを追加
- [x] `bookService.ts` に `resetBook` メソッドを追加
- [x] `bookService.ts` に `getBookLogs` メソッドを追加
- [x] `bookService.test.ts` にユニットテストを追加

## フェーズ4: バックエンド - ルート層

- [x] `types/api.ts` に `updateBookSchema` を追加
- [x] `routes/books.ts` に `PUT /books/:id` を追加
- [x] `routes/books.ts` に `DELETE /books/:id` を追加
- [x] `routes/books.ts` に `POST /books/:id/reset` を追加
- [x] `routes/books.ts` に `GET /books/:id/logs` を追加
- [x] `routes/books.test.ts` にユニットテストを追加

## フェーズ5: フロントエンド - API クライアント

- [x] `bookApi.ts` に `getBook` 関数を追加
- [x] `bookApi.ts` に `updateBook` 関数を追加
- [x] `bookApi.ts` に `deleteBook` 関数を追加
- [x] `bookApi.ts` に `resetBook` 関数を追加
- [x] `bookApi.ts` に `getBookLogs` 関数を追加
- [x] `bookApi.ts` に `BattleLog` 型と `BattleLogsResponse` 型を追加

## フェーズ6: フロントエンド - カスタムフック

- [x] `useBook.ts` を作成（本詳細取得）
- [x] `useBattleLogs.ts` を作成（ログ取得、ページネーション）

## フェーズ7: フロントエンド - コンポーネント

- [x] `BookInfo.tsx` を作成（本の情報表示）
- [x] `BookInfo.module.css` を作成
- [x] `BattleLogList.tsx` を作成（戦闘ログ一覧）
- [x] `BattleLogList.module.css` を作成
- [x] `BookEditModal.tsx` を作成（編集モーダル）
- [x] `BookEditModal.module.css` を作成
- [x] `features/books/components/index.ts` にエクスポートを追加

## フェーズ8: フロントエンド - ページ

- [x] `BookDetailPage.tsx` を作成
- [x] `BookDetailPage.module.css` を作成
- [x] `App.tsx` にルーティングを追加（`book-detail` ページ）
- [x] `BookCard.tsx` / `BookGrid.tsx` にクリックハンドラを追加

## フェーズ9: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- DynamoDB SingleTable設計への完璧な準拠（ログ用SKパターン `BOOK#{bookId}#LOG#{timestamp}`）
- レイヤーアーキテクチャ（routes → services → repositories）の一貫した実装
- Zodによる入力検証の徹底（updateBookSchema, logsQuerySchema）
- カーソルベースページネーションの実装（Base64エンコード）
- バックエンドテストが非常に充実（75件全通過）
- セキュリティ対策の徹底（認証チェック、入力検証）

### 改善点

- フロントエンドの新規コンポーネントにテストを追加すべき（useBook, useBattleLogs, BookEditModal等）
- catchブロックでエラーオブジェクトをログ出力すべき（デバッグ容易性）
- `as unknown as Book` 型キャストはZodランタイム検証に置き換え可能
- Cloudflare Workers環境では `Buffer` ではなく `btoa`/`atob` を使用すべき（修正済み）

### 次回への学び

- Cloudflare Workers環境のNode.js互換性を事前確認する（Buffer, fs等は使用不可）
- フロントエンドテストも実装と並行して書くことで品質を担保
- 既存コンポーネント（DQButton等）のvariant確認を実装前に行う
