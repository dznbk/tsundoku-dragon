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

- 開始: 2026-01-03
- 完了: 2026-01-03

---

## フェーズ1: 環境構築

- [x] `.gitignore`に`.dev.vars`を追加
- [x] `compose.yaml`作成（DynamoDB Local）
- [x] `apps/api/.dev.vars`作成（ローカル環境変数）

## フェーズ2: SDK導入

- [x] AWS SDK v3インストール（`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`）
- [x] `apps/api/src/lib/dynamodb.ts`作成（クライアント生成関数）
- [x] `apps/api/wrangler.toml`に環境変数の型定義追加

## フェーズ3: テーブル作成

- [x] `scripts/create-table.ts`作成
- [x] DynamoDB Local起動確認
- [x] テーブル作成スクリプト実行

## フェーズ4: 動作確認

- [x] `/db/health`エンドポイント追加
- [x] `wrangler dev`で起動し、接続確認

## フェーズ5: 品質チェック

- [x] テストが通ることを確認 (`npm test`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)

---

## 振り返り

### うまくいったこと

- steeringスキルで進捗を可視化できた
- DynamoDB Local + AWS SDK v3の構成がスムーズに動作した
- 環境変数による接続先切り替えが機能した

### 改善点

- 特になし

### 次回への学び

- Cloudflare Workersでは`.dev.vars`がローカル環境変数ファイル
- DynamoDB Localは認証情報を検証しないのでダミー値でOK
