# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのコンテキストを提供します。

## プロジェクト概要

**積読＆ドラゴンズ（Tsundoku & Dragons）** - 積読をドラゴンに見立てて討伐するRPG風読書管理アプリ

- 本 = 敵（ドラゴン）、ページ数 = HP
- 読書 = 戦闘、読んだページ = ダメージ
- スキルに経験値が貯まり、レベルアップ

詳細は [planning/product-concept.md](planning/product-concept.md) を参照。

## ディレクトリ構成

```
tsundoku-dragon/
├── apps/
│   ├── web/              # フロントエンド（React + Vite + TypeScript）
│   └── api/              # バックエンド（Cloudflare Workers + Hono）
├── packages/
│   └── shared/           # 共通コード（型定義など）
├── terraform/            # IaC（Cloudflare, AWS）
├── planning/             # 設計ドキュメント
│   ├── product-concept.md
│   ├── data-design.md
│   ├── exp-system.md
│   └── screen-design.md
├── docs/
│   └── CONTEXT.md        # 開発コンテキスト・議論ログ
└── CLAUDE.md             # このファイル
```

## 技術スタック

| レイヤー       | 技術                             |
| -------------- | -------------------------------- |
| フロントエンド | React + TypeScript（Vite）       |
| ホスティング   | Cloudflare Pages                 |
| API            | Cloudflare Workers + Hono        |
| データベース   | DynamoDB（Provisioned mode）     |
| 認証           | Firebase Auth（Google, Twitter） |
| 画像ストレージ | Cloudflare R2                    |
| IaC            | Terraform（予定）                |

## 開発プロセス

### ブランチ戦略（GitHub Flow）

- `main` - 本番ブランチ
- 作業ブランチはConventional Commitsのtypeに揃える
  - `feat/xxx` - 新機能
  - `fix/xxx` - バグ修正
  - `docs/xxx` - ドキュメント
  - `refactor/xxx` - リファクタリング
  - `test/xxx` - テスト
  - `chore/xxx` - 雑務
- PRを作成してマージ（1人開発でもPRを作る）

### コミットメッセージ（Conventional Commits）

```
<type>: <description>

[optional body]
```

| type       | 用途                 |
| ---------- | -------------------- |
| `feat`     | 新機能               |
| `fix`      | バグ修正             |
| `docs`     | ドキュメント         |
| `refactor` | リファクタリング     |
| `test`     | テスト               |
| `chore`    | 雑務（依存更新など） |

例：

- `feat: 本の登録APIを実装`
- `fix: 経験値計算の端数処理を修正`
- `docs: データ設計ドキュメントを更新`

### テスト方針

Googleのテストサイズを基準に：

| サイズ         | 方針                       | ツール     |
| -------------- | -------------------------- | ---------- |
| Small（単体）  | 多め。ロジック中心にカバー | Vitest     |
| Medium（結合） | API単位で必要に応じて      | Vitest     |
| Large（E2E）   | 主要導線のみ               | Playwright |

E2Eは以下の導線だけ：

- ログイン → 本登録 → 戦闘 → 討伐

## コーディング規約

### 全般

- TypeScript strict mode
- ESLint + Prettier でフォーマット統一
- 日本語コメント可（ただし変数名・関数名は英語）

### フロントエンド

- 関数コンポーネント + Hooks
- 状態管理は必要になるまで導入しない（useState/useContext優先）

### バックエンド

- Honoのルーティングはリソース単位でファイル分割
- エラーは適切なHTTPステータスコードを返す

## 主要ドキュメント

| ドキュメント                                               | 内容                       |
| ---------------------------------------------------------- | -------------------------- |
| [planning/product-concept.md](planning/product-concept.md) | プロダクト概要・MVP機能    |
| [planning/data-design.md](planning/data-design.md)         | DynamoDBスキーマ設計       |
| [planning/exp-system.md](planning/exp-system.md)           | 経験値・レベル計算式       |
| [planning/screen-design.md](planning/screen-design.md)     | 画面設計・目的             |
| [docs/CONTEXT.md](docs/CONTEXT.md)                         | 開発コンテキスト・議論ログ |

## コンテキスト維持

### CONTEXT.md の更新タイミング

- 設計上の決定をしたとき
- 新しい技術選定をしたとき
- 重要な議論があったとき

### 作業ログ

議論ログは `docs/CONTEXT.md` の「議論ログ」セクションに追記。
形式：

```markdown
### YYYY-MM-DD トピック

**議論した内容：**

- 箇条書き

**決定事項と理由：**
| 決定 | 理由 |
|------|------|
| xxx | yyy |
```

## よく使うコマンド（予定）

```bash
# フロントエンド開発
cd apps/web && npm run dev

# バックエンド開発
cd apps/api && npm run dev

# テスト
npm run test

# 型チェック
npm run typecheck

# リント
npm run lint
```

## 注意事項

- DynamoDBはProvisioned modeで無料枠内に収める
- 書影はopenBD/NDL Search APIから取得（R2にキャッシュ）
- Firebase Authの認証情報は環境変数で管理
