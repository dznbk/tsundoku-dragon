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

- 開始: 2026-02-11
- 完了: （未完了）

---

## フェーズ1: 準備

- [x] `.gitignore` に Terraform 関連エントリを追加
- [x] `terraform/staging/` ディレクトリを作成
- [x] `terraform/production/` ディレクトリを作成
- [x] Terraform をインストール（`terraform version` で確認） → v1.14.1

## フェーズ2: staging 環境の Terraform 化

### 2-1: 事前情報収集

- [x] IAM ポリシー情報を確認 → マネージドポリシー `tsundoku-dragon-dynamo-rw`（ARN は terraform.tfvars.example 参照）
- [x] Cloudflare アカウント ID を確認（terraform.tfvars に記入済み）
- [x] Cloudflare API トークンを作成（Terraform 用、必要な権限: Account.Workers KV Storage, Account.Access: Organizations/Identity Providers/Groups/Service Tokens/Apps and Policies）
- [x] KV Namespace のタイトルを確認 → staging: `staging-PUBLIC_JWK_CACHE_KV` / production: `PUBLIC_JWK_CACHE_KV`
- [x] Cloudflare Access アプリケーション ID を確認（staging） → terraform.tfvars に記入
- [x] Cloudflare Access ポリシー ID を確認（staging） → terraform.tfvars に記入

### 2-2: Terraform コード作成（staging）

- [x] `terraform/staging/main.tf` を作成
  - プロバイダ設定（AWS + Cloudflare）
  - `aws_dynamodb_table.main`
  - `aws_iam_user.worker`
  - `aws_iam_policy.dynamodb_access` + `aws_iam_user_policy_attachment.worker_dynamodb`
  - `cloudflare_workers_kv_namespace.main`
  - `cloudflare_zero_trust_access_application.main`
  - `cloudflare_zero_trust_access_policy.main`
- [x] `terraform/staging/variables.tf` を作成
- [x] `terraform/staging/outputs.tf` を作成
- [x] `terraform/staging/terraform.tfvars.example` を作成（テンプレート）
- [x] `terraform/staging/terraform.tfvars` を作成（実際の値を記入）

### 2-3: 既存リソースの import（staging）

- [x] `terraform init` を実行
- [x] DynamoDB テーブルを import
- [x] IAM ユーザーを import
- [x] IAM ポリシーを import
- [x] IAM ポリシーアタッチメントを import
- [x] KV Namespace を import
- [x] Access Application を import（v5 形式: `accounts/<account_id>/<app_id>`）
- [x] Access Policy を import（v5 形式: `<account_id>/<policy_id>`）

### 2-4: 差分確認と調整（staging）

- [x] `terraform plan` を実行し、差分を確認
- [x] 差分がある場合、Terraform コードを既存リソースに合わせて調整（v5 スキーマ変更、タグ追加、IAM ユーザーのアクセスキータグ手動削除）
- [x] `terraform plan` で **No changes** になることを確認

## フェーズ3: production 環境の Terraform 化

### 3-1: 事前情報収集

- [x] Cloudflare Access アプリケーション ID を確認（production） → terraform.tfvars に記入
- [x] Cloudflare Access ポリシー ID を確認（production） → terraform.tfvars に記入

### 3-2: Terraform コード作成（production）

- [x] `terraform/production/main.tf` を作成
  - プロバイダ設定（AWS + Cloudflare）
  - `aws_dynamodb_table.main`（tsundoku-dragon-prod）
  - `cloudflare_workers_kv_namespace.main`
  - `cloudflare_zero_trust_access_application.main`
  - `cloudflare_zero_trust_access_policy.main`
  - ※ IAM は管理対象外
- [x] `terraform/production/variables.tf` を作成
- [x] `terraform/production/outputs.tf` を作成
- [x] `terraform/production/terraform.tfvars.example` を作成（テンプレート）
- [x] `terraform/production/terraform.tfvars` を作成（実際の値を記入）

### 3-3: 既存リソースの import（production）

- [x] `terraform init` を実行
- [x] DynamoDB テーブルを import
- [x] KV Namespace を import
- [x] Access Application を import
- [x] Access Policy を import

### 3-4: 差分確認と調整（production）

- [x] `terraform plan` を実行し、差分を確認
- [x] 差分がある場合、Terraform コードを既存リソースに合わせて調整（DynamoDB キャパシティ 24、Access App 名 `tsundoku-dragon-production`）
- [x] `terraform plan` で **No changes** になることを確認

## フェーズ4: 検証・仕上げ

- [ ] staging で `terraform plan` を再実行し、No changes を確認
- [ ] production で `terraform plan` を再実行し、No changes を確認
- [ ] `terraform output` で出力値が wrangler.toml の値と一致することを確認
- [ ] 既存のアプリケーション動作に影響がないことを確認（staging にアクセス）
- [ ] Terraform 関連ファイルが `.gitignore` で正しく除外されていることを確認
- [ ] コミット・プッシュ（`.tf` ファイルと `.tfvars.example` のみ。`.tfstate` / `terraform.tfvars` は除外）

---

## 今回のスコープ外（次回以降の対応）

- [ ] R2 バケットの Terraform 管理（画像ストレージ機能の実装時に追加）

---

## 振り返り

### うまくいったこと

-

### 改善点

-

### 次回への学び

-
