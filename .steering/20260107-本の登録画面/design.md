# 設計書

## 意思決定

### 採用した設計

`docs/screen-book-register.md` に記載の設計をそのまま採用する。

- 状態管理: Jotai
- スキル選択UI: タグ入力（オートコンプリート付き）
- 書影取得: NDL OpenSearch API（フロントエンド直接呼び出し）
- ページ構成: シングルページフォーム

### 代替案との比較

| 案                           | メリット                 | デメリット                     | 採用 |
| ---------------------------- | ------------------------ | ------------------------------ | ---- |
| Jotai                        | シンプル、atom単位で管理 | -                              | ✓    |
| React Hook Form              | バリデーション統合が容易 | フォームライブラリの学習コスト | -    |
| NDL API（フロントエンド）    | バックエンド変更不要     | CORS考慮必要                   | ✓    |
| NDL API（バックエンドProxy） | CORS問題なし             | API実装が必要                  | -    |

### 選定理由

- Jotai: 既存プロジェクトで状態管理を導入する最初の機会であり、シンプルなatomベースの管理が適切
- NDL API直接呼び出し: NDL APIはCORS対応しているため、バックエンドProxyは不要

## データフロー

### 本の登録

1. ユーザーがISBN入力 (debounce 500ms)
2. NDL OpenSearch APIを呼び出し
3. XMLレスポンスからページ数抽出、書影URL生成
4. フォームに自動入力（ユーザーは変更可能）
5. 送信ボタンクリック
6. バリデーション実行
7. POST /books API呼び出し
8. 成功時: メッセージ表示、フォームリセット

### スキル候補取得

1. SkillTagInputにフォーカス
2. GET /skills API呼び出し
3. グローバルスキル + ユーザー独自スキルを取得
4. 入力に応じてフィルタリング表示

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                             | 種別 | 責務                              |
| -------------------------------------------------------------------- | ---- | --------------------------------- |
| `apps/web/src/pages/BookRegisterPage.tsx`                            | 新規 | ページレイアウト、成功/エラー表示 |
| `apps/web/src/pages/BookRegisterPage.module.css`                     | 新規 | ページスタイル                    |
| `apps/web/src/features/books/components/BookForm.tsx`                | 新規 | フォーム本体                      |
| `apps/web/src/features/books/components/BookForm.module.css`         | 新規 | フォームスタイル                  |
| `apps/web/src/features/books/components/BookCoverPreview.tsx`        | 新規 | 書影プレビュー                    |
| `apps/web/src/features/books/components/BookCoverPreview.module.css` | 新規 | プレビュースタイル                |
| `apps/web/src/features/books/components/SkillTagInput.tsx`           | 新規 | タグ入力                          |
| `apps/web/src/features/books/components/SkillTagInput.module.css`    | 新規 | タグ入力スタイル                  |
| `apps/web/src/features/books/components/index.ts`                    | 新規 | バレルエクスポート                |
| `apps/web/src/features/books/hooks/useBookInfo.ts`                   | 新規 | ISBN→書誌情報取得                 |
| `apps/web/src/features/books/hooks/useSkillSuggestions.ts`           | 新規 | スキル候補取得                    |
| `apps/web/src/features/books/stores/bookFormAtoms.ts`                | 新規 | Jotai Atoms                       |
| `apps/web/src/features/books/services/bookApi.ts`                    | 新規 | 本登録API                         |
| `apps/web/src/features/books/services/ndlApi.ts`                     | 新規 | NDL API呼び出し                   |
| `apps/web/src/features/books/index.ts`                               | 新規 | featureバレルエクスポート         |
| `apps/web/src/App.tsx`                                               | 変更 | ルーティング追加                  |
| `apps/api/src/routes/skills.ts`                                      | 新規 | GET /skills                       |
| `apps/api/src/services/skillService.ts`                              | 新規 | スキルビジネスロジック            |
| `apps/api/src/repositories/skillRepository.ts`                       | 新規 | スキルデータアクセス              |
| `apps/api/src/index.ts`                                              | 変更 | skillsルート追加                  |

### 主要コンポーネント

#### BookForm

**責務**: フォーム全体のレイアウト、送信処理

**インターフェース**:

```typescript
interface Props {
  onSubmit: (data: CreateBookInput) => Promise<void>;
  isSubmitting: boolean;
}
```

#### BookCoverPreview

**責務**: ISBNから書影取得・表示

**インターフェース**:

```typescript
interface Props {
  isbn: string;
  coverUrl: string | null;
  isLoading: boolean;
  className?: string;
}
```

#### SkillTagInput

**責務**: タグ追加/削除、オートコンプリート

**インターフェース**:

```typescript
interface Props {
  value: string[];
  onChange: (skills: string[]) => void;
  suggestions: string[];
  isLoadingSuggestions: boolean;
}
```

## テスト戦略

### ユニットテスト

- `bookFormAtoms.test.ts`: バリデーション、派生atom、リセット機能
- `ndlApi.test.ts`: ページ数抽出（正規表現）、エラーハンドリング
- `useBookInfo.test.ts`: debounce、XMLパース、エラー状態

### コンポーネントテスト

- `SkillTagInput.test.tsx`: Enter追加、Backspace削除、キーボード操作、aria属性
- `BookForm.test.tsx`: フォーム送信、バリデーション、自動入力後の変更

### APIテスト

- `skills.test.ts`: GET /skills レスポンス形式

## 依存ライブラリ

| ライブラリ | 用途     | 追加先   |
| ---------- | -------- | -------- |
| jotai      | 状態管理 | apps/web |

## セキュリティ考慮事項

- ISBN入力のサニタイズ（英数字とハイフンのみ許可）
- XSS対策（React標準のエスケープ）

## パフォーマンス考慮事項

- ISBN入力のdebounce（500ms）でAPI呼び出し回数を削減
- スキル候補のキャッシュ（初回取得後に保持）
