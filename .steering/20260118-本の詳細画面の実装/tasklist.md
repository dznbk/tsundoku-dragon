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

## フェーズ1: バックエンド基盤

- [x] shared packageにBattleLog型を追加
- [x] BookRepository: update, softDeleteメソッド追加
- [x] BattleLogRepository: 新規作成（findByBookId with pagination）
- [x] BookService: updateBook, deleteBook, resetBookメソッド追加
- [x] api/types/api.ts: updateBookSchema追加

## フェーズ2: バックエンドAPI

- [x] PUT /books/:id エンドポイント実装
- [x] DELETE /books/:id エンドポイント実装
- [x] POST /books/:id/reset エンドポイント実装
- [x] GET /books/:id/logs エンドポイント実装
- [x] 各エンドポイントのユニットテスト

## フェーズ3: フロントエンド基盤

- [x] bookApi.ts: getBook, updateBook, deleteBook, resetBook, getBattleLogs関数追加
- [x] useBookDetail フック作成
- [x] useBattleLogs フック作成（ページネーション対応）

## フェーズ4: フロントエンドUI

- [x] Pagination コンポーネント作成
- [x] BookInfo コンポーネント作成
- [x] BattleLogList コンポーネント作成
- [x] BookEditModal コンポーネント作成
- [x] BookDetailPage 作成
- [x] BookCard をクリック可能に変更
- [x] App.tsx にページ遷移ロジック追加

## フェーズ5: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 既存パターン（BookCard、BookForm、useBooks等）を参考にすることで、一貫性のある実装ができた
- バックエンドAPIの設計をdesign.mdで事前に明確化していたため、スムーズに実装できた
- ページネーション対応の戦闘ログ取得APIを実装し、将来の大量データ対応が可能になった

### 改善点

- SkillTagInputコンポーネントのprops仕様を事前確認すべきだった（suggestionsが必須）
- DQWindowにonClickがない点を事前確認すべきだった

### 次回への学び

- 既存コンポーネントを再利用する際は、事前にpropsの型定義を確認する
- モーダル実装時は、click-outside-to-close機能をどう実現するか事前に検討する
