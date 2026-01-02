# リポジトリ構造

新しいファイルを作成する際、このドキュメントを参照して適切な配置場所を決定してください。

## モノレポ構成

```
tsundoku-dragon/
├── apps/
│   ├── web/              # フロントエンド（React + Vite）
│   └── api/              # バックエンド（Hono + Cloudflare Workers）
├── packages/
│   └── shared/           # 共通コード
├── planning/             # 設計ドキュメント
├── docs/                 # 開発ドキュメント
└── .claude/              # Claude Code設定
```

## apps/web（フロントエンド）: Feature-based

```
apps/web/src/
├── features/           # 機能別ディレクトリ
│   ├── books/          # 本（ドラゴン）関連
│   │   ├── components/ # UIコンポーネント
│   │   ├── hooks/      # カスタムフック
│   │   └── services/   # API呼び出し
│   ├── battle/         # 戦闘関連
│   └── skills/         # スキル関連
├── shared/             # 共通
│   ├── components/     # 汎用コンポーネント（Button, Card等）
│   ├── hooks/          # 共通フック
│   └── utils/          # ユーティリティ
├── pages/              # ページコンポーネント
├── App.tsx
└── main.tsx
```

### 配置ルール

| ファイル種別 | 配置先 | 例 |
|------------|--------|-----|
| 機能固有コンポーネント | `features/[機能]/components/` | `features/books/components/BookCard.tsx` |
| 機能固有フック | `features/[機能]/hooks/` | `features/books/hooks/useBook.ts` |
| 機能固有API呼び出し | `features/[機能]/services/` | `features/books/services/bookApi.ts` |
| 共通コンポーネント | `shared/components/` | `shared/components/Button.tsx` |
| 共通フック | `shared/hooks/` | `shared/hooks/useLocalStorage.ts` |
| ページ | `pages/` | `pages/HomePage.tsx` |
| テスト | 対象ファイルと同じディレクトリ | `BookCard.test.tsx` |

### 判断基準

- **2箇所以上から使われる** → `shared/` に配置
- **1箇所からのみ使われる** → `features/[機能]/` に配置
- **迷ったら** → まず `features/` に配置、後で共通化

## apps/api（バックエンド）: Layered Architecture

```
apps/api/src/
├── routes/             # HTTPハンドラ（Honoルート）
├── services/           # ビジネスロジック
├── repositories/       # データアクセス（DynamoDB）
├── types/              # 型定義
└── index.ts            # エントリポイント
```

### レイヤー間の依存ルール

```
routes → services → repositories
  ↓         ↓           ↓
  OK        OK          OK（下位への依存のみ許可）
```

**禁止**: repositories → services, services → routes

### 配置ルール

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| ルート | `routes/` | リソース名.ts | `routes/books.ts` |
| サービス | `services/` | [リソース]Service.ts | `services/bookService.ts` |
| リポジトリ | `repositories/` | [リソース]Repository.ts | `repositories/bookRepository.ts` |
| 型定義 | `types/` | [対象].ts | `types/book.ts` |
| テスト | 対象と同じディレクトリ | [対象].test.ts | `bookService.test.ts` |

## packages/shared

```
packages/shared/src/
├── types/              # 共通型定義
├── constants/          # 共通定数
└── utils/              # 共通ユーティリティ
```

### 配置ルール

- **フロント・バックエンド両方で使う型** → `types/`
- **計算式・定数** → `constants/`
- **共通ロジック（経験値計算等）** → `utils/`

## 命名規則

### ディレクトリ
- kebab-case: `book-details/`, `battle-log/`

### ファイル
- コンポーネント: PascalCase (`BookCard.tsx`)
- フック: camelCase, use接頭辞 (`useBook.ts`)
- サービス: camelCase, Service接尾辞 (`bookService.ts`)
- 型定義: camelCase (`book.ts`)
- テスト: 対象名 + `.test.ts` (`BookCard.test.tsx`)

## テストファイル

- **配置**: 対象ファイルと同じディレクトリ（コロケーション）
- **命名**: `[対象ファイル名].test.ts(x)`
- **理由**: 関連ファイルがまとまる、テスト忘れに気づきやすい
