# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのコンテキストを提供します。

## プロジェクト概要

**積読＆ドラゴンズ（Tsundoku & Dragons）** - 積読をドラゴンに見立てて討伐するRPG風読書管理アプリ

- 本 = 敵（ドラゴン）、ページ数 = HP
- 読書 = 戦闘、読んだページ = ダメージ
- スキルに経験値が貯まり、レベルアップ

## ドキュメント

| ドキュメント                                                     | 内容                       |
| ---------------------------------------------------------------- | -------------------------- |
| [planning/product-concept.md](planning/product-concept.md)       | プロダクト概要・MVP機能    |
| [planning/data-design.md](planning/data-design.md)               | DynamoDBスキーマ設計       |
| [planning/exp-system.md](planning/exp-system.md)                 | 経験値・レベル計算式       |
| [planning/screen-design.md](planning/screen-design.md)           | 画面設計・目的             |
| [planning/visual-design.md](planning/visual-design.md)           | ビジュアルデザイン仕様     |
| [planning/terraform-policy.md](planning/terraform-policy.md)     | Terraform 方針             |
| [docs/development-guidelines.md](docs/development-guidelines.md) | 開発ガイドライン           |
| [docs/integration-testing.md](docs/integration-testing.md)       | 統合テストガイド           |
| [docs/repository-structure.md](docs/repository-structure.md)     | リポジトリ構造             |
| [docs/glossary.md](docs/glossary.md)                             | 用語集                     |
| [docs/CONTEXT.md](docs/CONTEXT.md)                               | 開発コンテキスト・議論ログ |

## Taskfile

プロジェクトルートの `Taskfile` で開発タスクを実行する。

```bash
./Taskfile setup            # 初期セットアップ（npm install、.envコピー）
./Taskfile dev              # 全サービス起動（DB + api + web）
./Taskfile check            # CI相当のローカルチェック（push前に実行）
./Taskfile test             # ユニットテスト
./Taskfile test:integration # 統合テスト
./Taskfile test:all         # 全テスト
./Taskfile db:start         # DynamoDB Local 起動
./Taskfile db:stop          # DynamoDB Local 停止
```

**使う場面:**

- 新規開発者の環境構築 → `./Taskfile setup`
- 日常の開発 → `./Taskfile dev`
- コミット/プッシュ前の確認 → `./Taskfile check`
- 統合テスト実行前 → `./Taskfile test:setup`

## 重要なルール

### GitHub Issue の閲覧

Projects Classic の廃止に伴い、`gh issue view` はエラーになる場合がある。`--json` フラグで必要なフィールドを指定すること。

```bash
gh issue view 56 --repo dznbk/tsundoku-dragon --json title,body,state
```

### 日付の扱い

- 日付を記載する際は必ず `date +%Y-%m-%d` コマンドで現在日付を確認すること
- 形式: `YYYY-MM-DD`（例: 2026-01-03）

### デプロイ前チェックリスト

Cloudflare Workersへのデプロイ前に確認すること:

1. **KV Namespace の作成**
   - `wrangler.toml` にプレースホルダー (`REPLACE_ME_WITH_ACTUAL_KV_ID`) がある場合は実際のIDに置換
   - 作成コマンド: `wrangler kv:namespace create PUBLIC_JWK_CACHE_KV`
   - Preview用: `wrangler kv:namespace create PUBLIC_JWK_CACHE_KV --preview`

2. **環境変数の設定**
   - `FIREBASE_PROJECT_ID` が正しいプロジェクトIDか確認
   - `PUBLIC_JWK_CACHE_KEY` が設定されているか確認

3. **シークレットの設定**
   - AWS認証情報は `wrangler secret put` で設定
   - `wrangler secret put AWS_ACCESS_KEY_ID`
   - `wrangler secret put AWS_SECRET_ACCESS_KEY`
