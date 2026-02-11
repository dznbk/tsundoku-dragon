# Terraform 方針

## 概要

インフラのプロビジョニング（リソースの作成・設定）を Terraform で管理する。
アプリケーションのデプロイは既存の wrangler + GitHub Actions を継続使用する。

## 管理対象

### Terraform で管理するもの（リソースの「箱」）

| リソース                | プロバイダ | 備考                               |
| ----------------------- | ---------- | ---------------------------------- |
| DynamoDB テーブル       | AWS        | staging / production               |
| IAM ユーザー・ポリシー  | AWS        | Workers からの DynamoDB アクセス用 |
| KV Namespace            | Cloudflare | Firebase JWT 公開鍵キャッシュ用    |
| Access アプリケーション | Cloudflare | staging のアクセス制限             |
| DNS レコード            | Cloudflare | deepon.dev のサブドメイン          |
| R2 バケット             | Cloudflare | 将来の画像ストレージ用             |

### Terraform で管理しないもの

| 対象                          | 理由                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| Workers へのコードデプロイ    | wrangler + GitHub Actions が担当。Terraform と責務が重複する |
| Firebase Auth                 | 変更頻度が低く、Terraform 管理のコスト対効果が合わない       |
| GitHub Actions ワークフロー   | リポジトリ内の YAML で管理                                   |
| Cloudflare アカウント設定全般 | 手動管理で十分                                               |

### 境界ルール

wrangler.toml に書く設定（環境変数、KV バインディング等）と Terraform の管理対象が一部重なる。
以下のルールで切り分ける：

- **リソースの作成** → Terraform（例: KV Namespace の作成、ID の払い出し）
- **リソースの参照・バインド** → wrangler.toml（例: KV Namespace ID の記載、環境変数の設定）

KV Namespace ID など、Terraform の output と wrangler.toml の値が対応する箇所は以下の通り：

| Terraform output    | wrangler.toml の設定箇所   |
| ------------------- | -------------------------- |
| KV Namespace ID     | `kv_namespaces[].id`       |
| DynamoDB テーブル名 | `vars.DYNAMODB_TABLE_NAME` |

## ディレクトリ構成

環境ごとにディレクトリを分離する。

```
terraform/
├── staging/
│   ├── main.tf          # プロバイダ設定、リソース定義
│   ├── variables.tf     # 変数定義
│   ├── outputs.tf       # 出力値
│   └── terraform.tfvars # 環境固有の値
└── production/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── terraform.tfvars
```

### ディレクトリ分離の理由

- staging と production の State が物理的に分離され、誤操作で他環境に影響しない
- 環境ごとに独立して変更・適用できる（staging にだけ Cloudflare Access がある等）
- リソース数が少なく（各環境数十行程度）、コード重複のデメリットが小さい

### モジュール化について

現時点ではモジュール化しない。管理対象リソースが増えて重複が負担になった段階で検討する。

## State 管理

ローカル State を使用する。

- 個人プロジェクトであり、同時操作による State 競合のリスクがない
- State を失った場合も `terraform import` で既存リソースを再取り込みできる
- 管理対象リソースが少なく、復旧が容易

リモートバックエンド（S3 + DynamoDB）への移行は、必要を感じた時点で行う。
State の保存先は後から変更可能。

## 運用

### 既存リソースの取り込み

現在のインフラは手動構築済みのため、Terraform 導入時は `terraform import` で既存リソースを取り込む。

### 適用手順

```bash
cd terraform/staging
terraform init
terraform plan    # 変更内容を確認
terraform apply   # 適用
```

### .gitignore

```
# Terraform
*.tfstate
*.tfstate.backup
.terraform/
.terraform.lock.hcl
```
