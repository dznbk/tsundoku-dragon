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

- 開始: 2026-03-13
- 完了: 2026-03-13

---

## フェーズ1: ErrorCode enum と AppError の拡張

- [x] `apps/api/src/lib/errors.ts` に `ErrorCode` enum を追加する
- [x] `AppError` コンストラクタに `code?: ErrorCode` パラメータを追加する
- [x] `BadRequestError` コンストラクタを `(code: ErrorCode, message: string)` に変更する
- [x] `NotFoundError` コンストラクタを `(code: ErrorCode, message: string)` に変更する
- [x] `handleError` のレスポンスに `code` フィールドを追加する
- [x] `apps/api/src/lib/errors.test.ts` を ErrorCode 対応に更新する

## フェーズ2: サービス層の更新

- [x] `apps/api/src/services/bookService.ts` の全エラー throw に ErrorCode を追加する
- [x] `apps/api/src/services/battleService.ts` の全エラー throw に ErrorCode を追加する
- [x] `apps/api/src/services/bookService.test.ts` にエラーコード検証を追加する
- [x] `apps/api/src/services/battleService.test.ts` にエラーコード検証を追加する

## フェーズ3: ルートテストの更新

- [x] `apps/api/src/routes/books.test.ts` のエラーレスポンス検証に `code` フィールドを追加する

## フェーズ4: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 既存の `AppError` 継承構造がしっかりしていたため、`ErrorCode` enum と `code` プロパティの追加だけで目的を達成できた
- ルートハンドラは既にクリーン（try-catch不要）だったため、変更不要だった
- テストの修正も `toMatchObject` を活用し、既存アサーションとの共存がスムーズだった

### 改善点

- `index.test.ts` の `BadRequestError` コンストラクタ変更への対応を計画段階で見落としていた

### 次回への学び

- コンストラクタシグネチャの破壊的変更がある場合、全使用箇所（テスト含む）を事前にGrepで洗い出すべき
