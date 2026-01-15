# ステージング・本番環境の構築計画

## 概要

積読＆ドラゴンズのステージング環境と本番環境を構築する。

## デプロイ戦略

| 環境       | トリガー                                  | 用途             |
| ---------- | ----------------------------------------- | ---------------- |
| staging    | main ブランチへの push                    | 開発中の動作確認 |
| production | workflow_dispatch（手動）または タグ push | 本番リリース     |

## 構成

| レイヤー | 技術                             | staging                             | production              |
| -------- | -------------------------------- | ----------------------------------- | ----------------------- |
| Frontend | Cloudflare Pages (Direct Upload) | stg.tsundoku.deepon.dev             | tsundoku.deepon.dev     |
| API      | Cloudflare Workers               | api-stg.tsundoku.deepon.dev         | api.tsundoku.deepon.dev |
| DB       | DynamoDB                         | tsundoku-dragon-staging             | tsundoku-dragon-prod    |
| Auth     | Firebase                         | 同一プロジェクト（tsundoku-dragon） | 同一                    |

---

## タスクリスト

---

### Staging 環境構築

#### Phase 1-S: AWS リソース作成（手動）

- [ ] **DynamoDB テーブル作成**
  - テーブル名: `tsundoku-dragon-staging`
  - リージョン: ap-northeast-1
  - PK: `PK` (文字列), SK: `SK` (文字列)
  - キャパシティ: プロビジョンド 1 RCU / 1 WCU（Auto Scaling オフ）
  - タグ: `Project=tsundoku-dragon`, `Environment=staging`

- [ ] **IAM ユーザー作成**
  - ユーザー名: `tsundoku-dragon-worker`（staging/production 共用）
  - 用途: Cloudflare Workers からの DynamoDB アクセス
  - ポリシー: 両テーブルへの読み書き権限

#### Phase 2-S: Cloudflare リソース作成

- [ ] **KV Namespace 作成**

  ```bash
  cd apps/api
  wrangler kv:namespace create PUBLIC_JWK_CACHE_KV --env staging
  ```

- [ ] **wrangler.toml 環境別設定化**
  - ファイル: [apps/api/wrangler.toml](apps/api/wrangler.toml)
  - `[env.staging]` セクション追加
  - DynamoDB テーブル名: `tsundoku-dragon-staging`
  - KV Namespace ID を設定

- [ ] **Cloudflare Secrets 設定**
  ```bash
  wrangler secret put AWS_ACCESS_KEY_ID --env staging
  wrangler secret put AWS_SECRET_ACCESS_KEY --env staging
  ```

#### Phase 3-S: Cloudflare Pages 設定

- [ ] **Cloudflare Pages プロジェクト作成**
  - Cloudflare Dashboard から Direct Upload プロジェクトとして作成
  - GitHub 連携は使わない（GitHub Actions から Direct Upload する）
  - プロジェクト名: `tsundoku-dragon`

- [ ] **GitHub Actions 用の API トークン取得**
  - Cloudflare Dashboard → My Profile → API Tokens
  - 「Edit Cloudflare Workers」テンプレートをベースに作成
  - Pages の編集権限を追加
  - GitHub Secrets に `CLOUDFLARE_API_TOKEN` として登録

#### Phase 4-S: CD ワークフロー作成

- [ ] **deploy.yml 作成（staging 用）**
  - ファイル: `.github/workflows/deploy.yml`
  - トリガー: `push` to main → staging 自動デプロイ
  - ジョブ:
    - Web ビルド（npm run build）
    - Web デプロイ（wrangler pages deploy apps/web/dist）
    - API デプロイ（wrangler deploy --env staging）
  - 環境変数: `VITE_API_URL=https://api-stg.tsundoku.deepon.dev`

#### Phase 5-S: カスタムドメイン設定

- [ ] **Cloudflare DNS 設定（staging）**
  - `stg.tsundoku` → `tsundoku-dragon.pages.dev`（staging Web）
  - `api-stg.tsundoku` → Workers カスタムドメイン

- [ ] **Workers カスタムドメイン設定**
  - wrangler.toml の routes または Cloudflare Dashboard から設定

- [ ] **Pages カスタムドメイン設定**
  - Cloudflare Dashboard → Pages → tsundoku-dragon → Custom domains
  - staging: stg.tsundoku.deepon.dev

#### Phase 6-S: 検証

- [ ] **staging 環境デプロイ & 動作確認**
  - API: `https://api-stg.tsundoku.deepon.dev/health`
  - Web: `https://stg.tsundoku.deepon.dev`
  - E2E: ログイン、本の登録、本一覧表示

---

### Production 環境構築

#### Phase 1-P: AWS リソース作成（手動）

- [ ] **DynamoDB テーブル作成**
  - テーブル名: `tsundoku-dragon-prod`
  - リージョン: ap-northeast-1
  - PK: `PK` (文字列), SK: `SK` (文字列)
  - キャパシティ: プロビジョンド 5 RCU / 5 WCU（Auto Scaling オフ）
  - タグ: `Project=tsundoku-dragon`, `Environment=production`
  - 削除保護: オン

#### Phase 2-P: Cloudflare リソース作成

- [ ] **KV Namespace 作成**

  ```bash
  cd apps/api
  wrangler kv:namespace create PUBLIC_JWK_CACHE_KV
  ```

- [ ] **wrangler.toml 環境別設定化**
  - `[env.production]` セクション追加
  - DynamoDB テーブル名: `tsundoku-dragon-prod`
  - KV Namespace ID を設定

- [ ] **Cloudflare Secrets 設定**
  ```bash
  wrangler secret put AWS_ACCESS_KEY_ID
  wrangler secret put AWS_SECRET_ACCESS_KEY
  ```

#### Phase 4-P: CD ワークフロー更新

- [ ] **deploy.yml 更新（production 用）**
  - トリガー追加:
    - `workflow_dispatch` → 環境選択パラメータで staging/production
    - `push` tags `v*` → production 自動デプロイ（オプション）
  - 環境変数: `VITE_API_URL=https://api.tsundoku.deepon.dev`

#### Phase 5-P: カスタムドメイン設定

- [ ] **Cloudflare DNS 設定（production）**
  - `tsundoku` → `tsundoku-dragon.pages.dev`（本番 Web）
  - `api.tsundoku` → Workers カスタムドメイン

- [ ] **Workers カスタムドメイン設定**

- [ ] **Pages カスタムドメイン設定**
  - 本番: tsundoku.deepon.dev

#### Phase 6-P: 検証

- [ ] **production 環境デプロイ & 動作確認**
  - API: `https://api.tsundoku.deepon.dev/health`
  - Web: `https://tsundoku.deepon.dev`
  - E2E: ログイン、本の登録、本一覧表示

---

### 完了後

- [ ] **CONTEXT.md 更新**
  - 「次にやること」を「本の詳細画面」に更新

- [ ] **CLAUDE.md 更新（必要に応じて）**
  - デプロイ手順の詳細化

---

## 修正対象ファイル

| ファイル                                         | 変更内容         |
| ------------------------------------------------ | ---------------- |
| [apps/api/wrangler.toml](apps/api/wrangler.toml) | 環境別設定追加   |
| `.github/workflows/deploy.yml`                   | 新規作成         |
| [docs/CONTEXT.md](docs/CONTEXT.md)               | 次にやること更新 |

---

## 検証方法

1. **staging 環境デプロイ**
   - main ブランチに push（自動）または workflow_dispatch で staging を選択
   - API: `https://api-stg.tsundoku.deepon.dev/health` にアクセス
   - Web: `https://stg.tsundoku.deepon.dev` にアクセス

2. **E2E 動作確認**
   - ログイン（Firebase Auth）
   - 本の登録（NDL API 連携含む）
   - 本一覧表示

3. **本番環境デプロイ**
   - workflow_dispatch で production を選択
   - または `v1.0.0` のようなタグを push
   - API: `https://api.tsundoku.deepon.dev/health`
   - Web: `https://tsundoku.deepon.dev`

---

## 注意事項

- Firebase Auth は同一プロジェクトを使用（環境分離しない）
- DynamoDB テーブルは環境別に分離（データの混在を防ぐ）
- Direct Upload 方式のため、PR Preview は自動生成されない
  - 必要なら workflow_dispatch で staging にデプロイして確認

## 今後の拡張（スコープ外）

- Terraform による IaC 化
- Monitoring / Alerting
- PR Preview 自動デプロイ
