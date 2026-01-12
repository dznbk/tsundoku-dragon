# 積読＆ドラゴンズ（Tsundoku & Dragons）

積読をドラゴンに見立てて討伐するRPG風読書管理アプリ

- 本 = 敵（ドラゴン）、ページ数 = HP
- 読書 = 戦闘、読んだページ = ダメージ
- スキルに経験値が貯まり、レベルアップ

## 必要環境

- Node.js >= 22.12.0（推奨: 22.21.1）

asdfを使っている場合は `.tool-versions` で自動的にバージョンが設定されます。

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/tsundoku-dragon.git
cd tsundoku-dragon

# 初期セットアップ（依存関係インストール + .env作成）
./Taskfile setup
```

## 開発

### フロントエンド（React + Vite）

```bash
npm run dev:web
```

http://localhost:5173 で起動します。

### バックエンド（Cloudflare Workers + Hono）

```bash
npm run dev:api
```

http://localhost:8787 で起動します。

### 両方同時に起動

```bash
./Taskfile dev
```

DynamoDB Local + API + Web を同時に起動します。Ctrl+C で全て停止します。

## その他のコマンド

```bash
# リント
npm run lint

# フォーマット
npm run format

# 型チェック
npm run typecheck

# テスト
npm run test

# ビルド
npm run build
```

## プロジェクト構成

```
tsundoku-dragon/
├── apps/
│   ├── web/          # フロントエンド（React + Vite）
│   └── api/          # バックエンド（Cloudflare Workers + Hono）
├── packages/
│   └── shared/       # 共通コード（型定義など）
├── planning/         # 設計ドキュメント
└── docs/             # 開発ドキュメント
```

## デプロイ

### APIのデプロイ（Cloudflare Workers）

初回デプロイ前に以下の準備が必要です:

1. **KV Namespace の作成**

   ```bash
   cd apps/api
   wrangler kv:namespace create PUBLIC_JWK_CACHE_KV
   wrangler kv:namespace create PUBLIC_JWK_CACHE_KV --preview
   ```

   出力されたIDを `wrangler.toml` の `id` と `preview_id` に設定してください。

2. **シークレットの設定**

   ```bash
   wrangler secret put AWS_ACCESS_KEY_ID
   wrangler secret put AWS_SECRET_ACCESS_KEY
   ```

3. **デプロイ実行**

   ```bash
   npm run deploy
   ```

## ドキュメント

- [プロダクトコンセプト](planning/product-concept.md)
- [データ設計](planning/data-design.md)
- [経験値システム](planning/exp-system.md)
- [画面設計](planning/screen-design.md)
- [開発コンテキスト](docs/CONTEXT.md)
