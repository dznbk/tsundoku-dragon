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

- 開始: 2026-02-21
- 完了: 2026-02-21

---

## フェーズ1: リポジトリ実装変更

- [x] `skillRepository.ts` に `UpdateCommand` を import に追加
- [x] `upsertUserSkillExp` メソッドを UpdateCommand + ADD 式によるアトミック更新に書き換え
  - Step 1: `ADD exp :expToAdd` + `ReturnValues: 'ALL_NEW'` で経験値をアトミック加算
  - Step 2: `SET #level = :newLevel` でレベルを更新（`level` は予約語のため `ExpressionAttributeNames` 使用）
- [x] 不要になった import がないか確認（`GetCommand`, `PutCommand` は他メソッドで使用中のため残す）

## フェーズ2: ユニットテスト修正

- [x] `skillRepository.test.ts` の `upsertUserSkillExp` テストを UpdateCommand ベースに修正
  - 新規スキル作成テスト: UpdateCommand(ADD) → UpdateCommand(SET level) の2回呼び出しを検証
  - 既存スキル更新テスト: 同上、累積 exp の正しさを検証

## フェーズ3: 統合テスト確認

- [x] 既存の `skillRepository.integration.test.ts` がそのまま通ることを確認

## フェーズ4: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 変更箇所が明確（リポジトリ1メソッド + テスト）でスコープが小さく、影響範囲の見通しが立ちやすかった
- DynamoDB の `ADD` 式により、Read-Then-Write を排除しつつ DB 呼び出し回数は変更前と同じ2回に抑えられた
- 既存の `BookService` や統合テストに変更不要だった（インターフェースの後方互換性を維持できた）
- 実装検証サブエージェントにより non-null assertion の問題を検出・修正できた

### 改善点

- `level` の更新は exp の ADD とは別ステップのため、Step 1 と Step 2 の間に障害が発生すると一時的な不整合が起きる。DynamoDB の制約上、同一 UpdateExpression 内で ADD した結果をアプリケーションロジック（levelFromExp）に渡すことはできないため、2ステップ構造はやむを得ない
- `skillRepository` 全体で PK/SK のビルドヘルパーがない（`bookRepository` にはある）。今回のスコープ外だが将来的に統一を検討

### 次回への学び

- DynamoDB の `ADD` 式は属性が存在しない場合に 0 から加算してくれるため、upsert が1コマンドで実現できる
- `level` は DynamoDB の予約語。`ExpressionAttributeNames` を使う必要がある
- `ReturnValues: 'ALL_NEW'` で更新後の値を取得できるが、SDK の型定義上 `Attributes` はオプショナルなのでガード節が必要
