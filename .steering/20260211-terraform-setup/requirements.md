# Terraform 環境構築

## 概要

既存の手動構築済みインフラを Terraform で管理し、インフラの構成をコードとして宣言的に管理する。

## 背景

- 現在のインフラ（DynamoDB、IAM、KV Namespace、Cloudflare Access、DNS）はすべて手動構築済み
- 構成変更の追跡が困難で、環境間の差異を把握しにくい
- [planning/terraform-policy.md](../../planning/terraform-policy.md) で方針を策定済み

## 要件

### 機能要件

#### staging 環境

- [ ] AWS プロバイダ設定（ap-northeast-1）
- [ ] DynamoDB テーブル（`tsundoku-dragon-staging`）の管理
  - PK/SK: String型、プロビジョンドモード 1 RCU / 1 WCU
- [ ] IAM ユーザー（`tsundoku-dragon-worker`）とポリシーの管理
  - DynamoDB へのアクセス権限（staging テーブルのみ）
- [ ] Cloudflare プロバイダ設定
- [ ] KV Namespace（`486c84b66f0842e798c973b5ea081976`）の管理
  - Firebase JWT 公開鍵キャッシュ用
- [ ] Cloudflare Access アプリケーション（staging Web アクセス制限）
  - `stg.tsundoku.deepon.dev` に対する One-time PIN 認証
- [ ] DNS レコード（staging 環境用）
  - `stg.tsundoku.deepon.dev`
  - `api-stg.tsundoku.deepon.dev`
- [ ] R2 バケット（将来の画像ストレージ用、staging 環境）
- [ ] `terraform import` で既存リソースを取り込み
- [ ] `terraform plan` で差分なし（No changes）を確認

#### production 環境

- [ ] staging と同様の構成で production 用リソースを管理
- [ ] DynamoDB テーブル（`tsundoku-dragon-prod`）5 RCU / 5 WCU
- [ ] KV Namespace（`1f79768d91be42e586b4c7d3a186e94e`）
- [ ] DNS レコード（`tsundoku.deepon.dev`、`api.tsundoku.deepon.dev`）
- [ ] Cloudflare Access アプリケーション（production、一時的）

### 非機能要件

- State はローカル管理（`.tfstate` を `.gitignore` に追加）
- 機密情報（AWS シークレットキー、Cloudflare API トークン）は `terraform.tfvars` に記載し、`.gitignore` に追加
- `terraform plan` の出力が明確で、意図しない変更がないこと

## 受け入れ条件

- [ ] `terraform/staging/` で `terraform plan` が No changes を示す
- [ ] `terraform/production/` で `terraform plan` が No changes を示す
- [ ] outputs に KV Namespace ID、DynamoDB テーブル名が含まれる（wrangler.toml との対応）
- [ ] `.gitignore` に Terraform 関連ファイルが追加されている
- [ ] 既存のアプリケーション動作に影響がない

## 対象外（スコープ外）

- Workers へのコードデプロイ（wrangler + GitHub Actions が担当）
- Firebase Auth の管理
- GitHub Actions ワークフローの変更
- Cloudflare アカウント設定全般
- リモートバックエンド（S3 + DynamoDB）への State 移行
- モジュール化

## 参考ドキュメント

- [planning/terraform-policy.md](../../planning/terraform-policy.md)
- [docs/CONTEXT.md](../../docs/CONTEXT.md)
