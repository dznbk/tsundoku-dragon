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

## フェーズ1: CI設定の追加

- [x] `.github/workflows/ci.yml`に`integration-test`ジョブを追加
  - DynamoDB Local servicesの定義
  - ヘルスチェック設定
  - ポート8000でサービス公開
- [x] テーブル作成ステップを追加
  - `npx tsx scripts/create-table.ts --local --test`実行
  - 環境変数設定（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY）
- [x] 統合テスト実行ステップを追加
  - DYNAMODB_ENDPOINT環境変数設定
  - `npm run test:integration`実行

## フェーズ2: 動作確認

- [x] ローカルで既存のlint/test/buildジョブが壊れていないことを確認

## フェーズ3: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- GitHub Actions servicesを使用することで、シンプルな設定でDynamoDB Localをサービスコンテナとして起動できた
- 既存のテーブル作成スクリプト（`create-table.ts`）を再利用でき、新規コードを最小限に抑えられた
- 既存のCI設定（lint, test, build）と一貫したパターン（Node.js 22、actions/checkout@v4など）で実装できた

### 改善点

- 初期のヘルスチェック設定が`|| exit 0`で常に成功する状態だった（レビューで指摘、修正済み）
- ヘルスチェックのinterval/timeout/retriesを初期設定より短縮できることに後から気づいた

### 次回への学び

- GitHub Actions servicesのヘルスチェックコマンドは、失敗時に適切にexit codeを返すよう注意が必要
- DynamoDB Localは起動が速いため、ヘルスチェックの間隔は短くても問題ない（5s interval, 3s timeout, 3 retriesで十分）
- `curl -s URL > /dev/null`パターンは、接続確認のシンプルなヘルスチェックとして有効
