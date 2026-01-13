# 設計書

## 意思決定

### 採用した設計

既存のアーキテクチャ（Feature-based構造）に従い、features/books 配下にホーム画面用のコンポーネントを追加する。ページコンポーネントは pages/HomePage.tsx として新規作成する。

### 代替案との比較

| 案                         | メリット                              | デメリット                           | 採用 |
| -------------------------- | ------------------------------------- | ------------------------------------ | ---- |
| 案A: features/home を新設  | 機能が独立する                        | books と重複するデータ型・APIがある  | -    |
| 案B: features/books に追加 | 既存の型・APIを再利用可能、責務が明確 | books ディレクトリが肥大化する可能性 | ✓    |

### 選定理由

- 本一覧はbooks機能の一部であり、Book型やbookApiを共有できる
- 既存パターンに従うことで一貫性を保てる
- スキル表示のためskills APIも呼び出すが、これは表示のみなので問題ない

## データフロー

### 本一覧表示

1. HomePage マウント時に useBooks フックで GET /books を呼び出し
2. 取得した本一覧を booksAtom に格納
3. showCompleted フラグで表示をフィルタリング
4. BookCard コンポーネントで各本をレンダリング

### ステータス表示

1. HomePage マウント時に useUserStatus フックで必要なデータを集計
2. 本一覧から総討伐数・総読了ページ数を計算
3. useSkillSummary フックで GET /skills を呼び出し、上位3スキルを取得
4. UserStatus コンポーネントで表示

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                            | 種別 | 責務                                 |
| ------------------------------------------------------------------- | ---- | ------------------------------------ |
| `apps/web/src/pages/HomePage.tsx`                                   | 新規 | ホーム画面のページコンポーネント     |
| `apps/web/src/pages/HomePage.module.css`                            | 新規 | ホーム画面のスタイル                 |
| `apps/web/src/features/books/components/BookCard.tsx`               | 新規 | 本カードコンポーネント               |
| `apps/web/src/features/books/components/BookCard.module.css`        | 新規 | 本カードのスタイル                   |
| `apps/web/src/features/books/components/BookGrid.tsx`               | 新規 | 本一覧グリッドコンポーネント         |
| `apps/web/src/features/books/components/BookGrid.module.css`        | 新規 | 本一覧グリッドのスタイル             |
| `apps/web/src/features/books/components/ProgressBar.tsx`            | 新規 | 進捗バーコンポーネント               |
| `apps/web/src/features/books/components/ProgressBar.module.css`     | 新規 | 進捗バーのスタイル                   |
| `apps/web/src/features/books/components/StatusBadge.tsx`            | 新規 | ステータスバッジコンポーネント       |
| `apps/web/src/features/books/components/StatusBadge.module.css`     | 新規 | ステータスバッジのスタイル           |
| `apps/web/src/features/books/components/UserStatus.tsx`             | 新規 | ユーザーステータス表示コンポーネント |
| `apps/web/src/features/books/components/UserStatus.module.css`      | 新規 | ユーザーステータスのスタイル         |
| `apps/web/src/features/books/components/CompletedToggle.tsx`        | 新規 | 討伐済み表示トグルコンポーネント     |
| `apps/web/src/features/books/components/CompletedToggle.module.css` | 新規 | 討伐済み表示トグルのスタイル         |
| `apps/web/src/features/books/hooks/useBooks.ts`                     | 新規 | 本一覧取得フック                     |
| `apps/web/src/features/books/hooks/useUserStatus.ts`                | 新規 | ユーザーステータス計算フック         |
| `apps/web/src/features/books/stores/homeAtoms.ts`                   | 新規 | ホーム画面用Jotai atoms              |
| `apps/web/src/features/books/services/bookApi.ts`                   | 変更 | getBooks関数を追加                   |
| `apps/web/src/features/books/services/skillApi.ts`                  | 新規 | スキル情報取得API                    |
| `apps/web/src/features/books/components/index.ts`                   | 変更 | 新規コンポーネントのエクスポート追加 |
| `apps/web/src/App.tsx`                                              | 変更 | HomePageを使用するよう変更           |

### 主要コンポーネント

#### BookCard

**責務**: 1冊の本の情報をカード形式で表示

**インターフェース**:

```typescript
interface BookCardProps {
  book: Book;
}
```

#### BookGrid

**責務**: 本カードを2列グリッドで表示

**インターフェース**:

```typescript
interface BookGridProps {
  books: Book[];
}
```

#### ProgressBar

**責務**: 読書進捗をバーで表示

**インターフェース**:

```typescript
interface ProgressBarProps {
  current: number;
  total: number;
}
```

#### StatusBadge

**責務**: 本のステータス（戦闘中/討伐済み）をバッジで表示

**インターフェース**:

```typescript
interface StatusBadgeProps {
  status: 'reading' | 'completed' | 'archived';
}
```

#### UserStatus

**責務**: ユーザーのステータス（討伐数、読了ページ数、上位スキル）を表示

**インターフェース**:

```typescript
interface UserStatusProps {
  userName: string;
  completedCount: number;
  totalPagesRead: number;
  topSkills: Array<{ name: string; level: number }>;
}
```

#### CompletedToggle

**責務**: 討伐済みの本を表示するかどうかのトグル

**インターフェース**:

```typescript
interface CompletedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

## テスト戦略

### ユニットテスト

- BookCard: 書影・タイトル・進捗バー・バッジが正しく表示されるか
- ProgressBar: 進捗が正しく計算・表示されるか
- StatusBadge: ステータスに応じたバッジが表示されるか
- UserStatus: 各ステータス値が正しく表示されるか
- CompletedToggle: トグル操作でコールバックが呼ばれるか
- useBooks: APIからデータを取得できるか、エラーハンドリングが正しいか
- useUserStatus: 本一覧から正しくステータスを計算できるか

### 統合テスト（必要な場合）

- ホーム画面表示 → 本一覧が表示される
- 討伐済みトグル → completed の本が表示/非表示される

---

## 書影URL

NDLサーチAPIを使用:

```
https://ndlsearch.ndl.go.jp/thumbnail/{ISBN}.jpg
```

ISBNがない場合はデフォルト画像を表示する。

## セキュリティ考慮事項

- 本一覧APIは認証必須（既存の認証ミドルウェアを使用）
- ユーザーは自分の本のみ取得可能（APIで userId によるフィルタリング済み）
