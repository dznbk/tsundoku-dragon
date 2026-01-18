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
- 完了: （未完了）

---

## フェーズ1: バックエンド基盤

- [ ] shared packageにBattleLog型を追加
- [ ] BookRepository: update, softDeleteメソッド追加
- [ ] BattleLogRepository: 新規作成（findByBookId with pagination）
- [ ] BookService: updateBook, deleteBook, resetBookメソッド追加
- [ ] api/types/api.ts: updateBookSchema追加

## フェーズ2: バックエンドAPI

- [ ] PUT /books/:id エンドポイント実装
- [ ] DELETE /books/:id エンドポイント実装
- [ ] POST /books/:id/reset エンドポイント実装
- [ ] GET /books/:id/logs エンドポイント実装
- [ ] 各エンドポイントのユニットテスト

## フェーズ3: フロントエンド基盤

- [ ] bookApi.ts: getBook, updateBook, deleteBook, resetBook, getBattleLogs関数追加
- [ ] useBookDetail フック作成
- [ ] useBattleLogs フック作成（ページネーション対応）

## フェーズ4: フロントエンドUI

- [ ] Pagination コンポーネント作成
- [ ] BookInfo コンポーネント作成
- [ ] BattleLogList コンポーネント作成
- [ ] BookEditModal コンポーネント作成
- [ ] BookDetailPage 作成
- [ ] BookCard をクリック可能に変更
- [ ] App.tsx にページ遷移ロジック追加

## フェーズ5: 品質チェック

- [ ] テストが通ることを確認 (`npm run test:all`)
- [ ] リントエラーがないことを確認 (`npm run lint`)
- [ ] 型エラーがないことを確認 (`npm run typecheck`)
- [ ] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

-

### 改善点

-

### 次回への学び

-
