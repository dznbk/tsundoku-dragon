# Terraform 環境構築 - 設計書

## 意思決定

### 1. IAM ユーザーの管理方法

現在 `tsundoku-dragon-worker` が staging / production 共用で存在する。個人開発のため分離のメリットが薄く、共有のまま staging で管理する。

| 案                                | メリット                           | デメリット                                    | 採用 |
| --------------------------------- | ---------------------------------- | --------------------------------------------- | ---- |
| A: 共有、staging で管理           | 移行不要、シンプル、管理コスト低い | production が staging の State に間接的に依存 | ✓    |
| B: 環境別 IAM ユーザーに分離      | 完全な環境分離、最小権限           | 移行作業・シークレット再設定が必要            | -    |
| C: shared/ ディレクトリで共有管理 | 明示的な共有リソース管理           | State が3つに増加、方針から逸脱               | -    |

**選定理由**: 個人開発で事故リスクが低く、IAM ユーザー1つのために移行作業や管理コスト増は見合わない。staging で既存ユーザーを import し、production では IAM を管理対象外とする。

**運用ルール**:

- IAM ユーザー・ポリシーの変更は `terraform/staging/` で行う
- IAM ポリシーは両環境のテーブルへのアクセスを許可する

### 2. DNS レコードの管理

Workers カスタムドメインは Cloudflare 側で自動的に DNS レコードを作成する場合がある。

| 案                                     | メリット             | デメリット                       | 採用 |
| -------------------------------------- | -------------------- | -------------------------------- | ---- |
| A: DNS レコードを Terraform で管理     | 構成が明示的に見える | Workers が自動作成する場合に競合 | -    |
| B: DNS レコードは管理対象外にする      | 競合リスクなし       | インフラの一部が管理外           | ✓    |
| C: import して lifecycle ignore で管理 | コードに定義は残る   | ignore_changes の管理が煩雑      | -    |

**選定理由**: Workers のカスタムドメイン設定時に Cloudflare が DNS レコードを自動管理する。Terraform で同じレコードを管理すると apply 時に競合する。DNS レコードは wrangler / Cloudflare ダッシュボードの責務とする。

### 3. R2 バケットの扱い

| 案                                | メリット                 | デメリット             | 採用 |
| --------------------------------- | ------------------------ | ---------------------- | ---- |
| A: 今回は作成しない               | YAGNI、不要な管理なし    | 後で追加作業が発生     | ✓    |
| B: 空のバケットを先に作成しておく | 将来使うときにすぐ使える | 使わないリソースが存在 | -    |

**選定理由**: まだ画像ストレージ機能は未実装。必要になった時点で追加する。

---

## ディレクトリ構成

```
terraform/
├── staging/
│   ├── main.tf          # プロバイダ設定、全リソース定義
│   ├── variables.tf     # 変数定義
│   ├── outputs.tf       # 出力値（wrangler.toml との対応）
│   └── terraform.tfvars # 環境固有の値（.gitignore 対象）
└── production/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── terraform.tfvars
```

---

## リソース設計

### staging 環境

| Terraform リソース                | リソース名                  | 備考                               |
| --------------------------------- | --------------------------- | ---------------------------------- |
| `aws_dynamodb_table`              | `tsundoku-dragon-staging`   | 1 RCU / 1 WCU、既存を import       |
| `aws_iam_user`                    | `tsundoku-dragon-worker`    | 既存共有ユーザーを import          |
| `aws_iam_policy`                  | `tsundoku-dragon-dynamo-rw` | マネージドポリシー、既存を import  |
| `aws_iam_user_policy_attachment`  | -                           | ユーザーとポリシーの紐づけ、import |
| `cloudflare_workers_kv_namespace` | staging 用 KV               | 既存 ID で import                  |
| `cloudflare_access_application`   | `tsundoku-dragon-staging`   | stg.tsundoku.deepon.dev            |
| `cloudflare_access_policy`        | staging アクセスポリシー    | One-time PIN、指定メール           |

### production 環境

| Terraform リソース                | リソース名                   | 備考                         |
| --------------------------------- | ---------------------------- | ---------------------------- |
| `aws_dynamodb_table`              | `tsundoku-dragon-prod`       | 5 RCU / 5 WCU、既存を import |
| `cloudflare_workers_kv_namespace` | production 用 KV             | 既存 ID で import            |
| `cloudflare_access_application`   | `tsundoku-dragon-production` | tsundoku.deepon.dev          |
| `cloudflare_access_policy`        | production アクセスポリシー  | One-time PIN、指定メール     |

※ IAM ユーザーは staging で一元管理。production では管理対象外。

---

## 変数設計（variables.tf）

### staging 用

```hcl
# AWS
variable "aws_region" {}
variable "dynamodb_table_name" {}
variable "dynamodb_read_capacity" {}
variable "dynamodb_write_capacity" {}

# IAM（staging でのみ管理）
variable "iam_user_name" {}
variable "dynamodb_table_arns" {}       # IAM ポリシーで許可するテーブル ARN リスト

# Cloudflare
variable "cloudflare_account_id" {}
variable "cloudflare_zone_id" {}       # deepon.dev のゾーン ID
variable "kv_namespace_title" {}
variable "access_app_name" {}
variable "access_app_domain" {}
variable "access_allowed_emails" {}    # Access で許可するメールアドレスリスト
```

### production 用

```hcl
# AWS
variable "aws_region" {}
variable "dynamodb_table_name" {}
variable "dynamodb_read_capacity" {}
variable "dynamodb_write_capacity" {}

# Cloudflare
variable "cloudflare_account_id" {}
variable "cloudflare_zone_id" {}
variable "kv_namespace_title" {}
variable "access_app_name" {}
variable "access_app_domain" {}
variable "access_allowed_emails" {}
```

※ production には IAM 関連の変数なし

## 出力設計（outputs.tf）

### staging 用

```hcl
# wrangler.toml と対応する値
output "dynamodb_table_name" {}        # → vars.DYNAMODB_TABLE_NAME
output "kv_namespace_id" {}            # → kv_namespaces[].id
output "iam_user_name" {}              # → IAM ユーザー名
```

### production 用

```hcl
output "dynamodb_table_name" {}        # → vars.DYNAMODB_TABLE_NAME
output "kv_namespace_id" {}            # → kv_namespaces[].id
```

---

## プロバイダ設定

```hcl
terraform {
  required_version = ">= 1.14.1"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.31"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.16"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token  # 環境変数 CLOUDFLARE_API_TOKEN でも可
}
```

---

## 認証情報の管理

| 認証情報                 | 設定方法                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| AWS アクセスキー         | 環境変数 `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` または `~/.aws/credentials` |
| Cloudflare API トークン  | 環境変数 `CLOUDFLARE_API_TOKEN` または `terraform.tfvars`                          |
| Cloudflare アカウント ID | `terraform.tfvars`                                                                 |
| Cloudflare ゾーン ID     | `terraform.tfvars`                                                                 |

`terraform.tfvars` に機密情報を含めるため、`.gitignore` に追加する。

---

## import 対象リソース

### staging（既存リソースの取り込み）

| リソース             | import コマンド例                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DynamoDB テーブル    | `terraform import aws_dynamodb_table.main tsundoku-dragon-staging`                                                                                      |
| IAM ユーザー         | `terraform import aws_iam_user.worker tsundoku-dragon-worker`                                                                                           |
| IAM ポリシー         | `terraform import aws_iam_policy.dynamodb_access arn:aws:iam::<AWS_ACCOUNT_ID>:policy/tsundoku-dragon-dynamo-rw`                                        |
| IAM ポリシーアタッチ | `terraform import aws_iam_user_policy_attachment.worker_dynamodb tsundoku-dragon-worker/arn:aws:iam::<AWS_ACCOUNT_ID>:policy/tsundoku-dragon-dynamo-rw` |
| KV Namespace         | `terraform import cloudflare_workers_kv_namespace.main <account_id>/486c84b66f0842e798c973b5ea081976`                                                   |
| Access Application   | `terraform import cloudflare_zero_trust_access_application.main accounts/<account_id>/<app_id>`                                                         |
| Access Policy        | `terraform import cloudflare_zero_trust_access_policy.main <account_id>/<policy_id>`                                                                    |

※ IAM はマネージドポリシー（`aws_iam_policy` + `aws_iam_user_policy_attachment`）。インラインポリシーではない。
※ Cloudflare v5 プロバイダでは Access Application の import に `accounts/` プレフィックスが必要。Access Policy は app_id 不要。

### production（既存リソースの取り込み）

| リソース           | import コマンド例                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| DynamoDB テーブル  | `terraform import aws_dynamodb_table.main tsundoku-dragon-prod`                                       |
| KV Namespace       | `terraform import cloudflare_workers_kv_namespace.main <account_id>/1f79768d91be42e586b4c7d3a186e94e` |
| Access Application | `terraform import cloudflare_zero_trust_access_application.main accounts/<account_id>/<app_id>`       |
| Access Policy      | `terraform import cloudflare_zero_trust_access_policy.main <account_id>/<policy_id>`                  |

※ production では IAM は管理対象外。

---

## セキュリティ考慮事項

- `terraform.tfvars` は `.gitignore` に追加し、Git にコミットしない
- `*.tfstate` も `.gitignore` に追加（State にはシークレットが平文で含まれる）
- IAM ポリシーは両環境のテーブルのみアクセス許可（`*` は使わない）

---

## 追加・変更するファイル

| ファイル                                | 種別 | 責務                       |
| --------------------------------------- | ---- | -------------------------- |
| `terraform/staging/main.tf`             | 新規 | staging リソース定義       |
| `terraform/staging/variables.tf`        | 新規 | staging 変数定義           |
| `terraform/staging/outputs.tf`          | 新規 | staging 出力値             |
| `terraform/staging/terraform.tfvars`    | 新規 | staging 環境固有値         |
| `terraform/production/main.tf`          | 新規 | production リソース定義    |
| `terraform/production/variables.tf`     | 新規 | production 変数定義        |
| `terraform/production/outputs.tf`       | 新規 | production 出力値          |
| `terraform/production/terraform.tfvars` | 新規 | production 環境固有値      |
| `.gitignore`                            | 変更 | Terraform 関連ファイル追加 |
