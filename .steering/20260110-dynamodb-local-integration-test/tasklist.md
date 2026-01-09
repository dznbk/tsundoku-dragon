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

- 開始: 2026-01-10
- 完了: 2026-01-10

---

## フェーズ1: Docker環境構築

- [x] `docker-compose.yml` を作成（DynamoDB Local設定）

## フェーズ2: テストヘルパー実装

- [x] `apps/api/src/test-utils/dynamodb-helper.ts` を作成
  - setupTestDB()
  - seedTestBooks()
  - cleanupTestData()
  - createTestEnv()

## フェーズ3: vitest設定

- [x] `apps/api/vitest.integration.config.ts` を作成
- [x] `apps/api/vitest.config.ts` を修正して `*.integration.test.ts` をexclude

## フェーズ4: スクリプト作成

- [x] `scripts/seed-test-data.ts` を作成
- [x] `scripts/setup-integration-tests.sh` を作成

## フェーズ5: package.json設定

- [x] ルート `package.json` にスクリプト追加（db:start, db:stop, db:setup, test:all）
- [x] `apps/api/package.json` にスクリプト追加（test:integration）

## フェーズ6: ドキュメント更新

- [x] `.claude/commands/add-feature.md` を更新（ステップ7でtest:allを使用）
- [x] `.claude/skills/steering/templates/tasklist.md` を更新（品質チェックフェーズ）
- [x] `.claude/agents/implementation-validator.md` を更新（テスト実行セクション）
- [x] `docs/integration-testing.md` を更新（コマンド説明）

## フェーズ7: 品質チェック

- [x] テストが通ることを確認 (`npm test`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 既存の`create-table.ts`スクリプトを拡張して再利用できた
- Docker Composeによる環境構築が簡潔に実現できた
- `dynamodb-helper.ts`でシングルトンパターンを使い、リソース効率を最適化
- npmスクリプトが直感的で使いやすい構成になった

### 改善点

- 実装検証で`create-table.ts`のテーブル名不一致問題が発覚し、追加修正が必要だった
- 最初の実装時に統合テスト用の`--test`フラグを考慮すべきだった

### 次回への学び

- 既存スクリプトとの統合ポイントは事前に確認してから実装を開始する
- 統合テストファイル（`*.integration.test.ts`）の実装は今回スコープ外だが、今後Repository層を実装する際に活用する
