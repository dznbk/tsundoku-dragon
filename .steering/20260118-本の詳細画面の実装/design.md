# 設計書

## 意思決定

### 採用した設計

既存パターンに従い、Feature-based構造（フロントエンド）とLayered Architecture（バックエンド）で実装する。

### 代替案との比較

| 案                          | メリット                  | デメリット                 | 採用 |
| --------------------------- | ------------------------- | -------------------------- | ---- |
| 既存パターン踏襲            | 一貫性あり、学習コスト低  | -                          | ✓    |
| 新規パターン（React Router) | URLベースのナビゲーション | 既存コードとの整合性が必要 | -    |

### 選定理由

- 既存のApp.tsxではuseStateでページ管理しているため、同じパターンで統一
- 将来的にReact Router導入時にも移行しやすい設計

## データフロー

### 本の詳細表示

1. ホーム画面で本カードをタップ
2. App.tsxで`currentPage`を`book-detail`に変更、`selectedBookId`をセット
3. BookDetailPageがマウント、`useBookDetail`フックが`GET /books/:id`を呼び出し
4. 本情報を取得・表示
5. 戦闘ログは`useBattleLogs`フックが`GET /books/:id/logs`を呼び出し

### 本の編集

1. 編集ボタンをタップ
2. 編集モーダルを表示（BookEditModal）
3. フォーム入力後、`PUT /books/:id`を呼び出し
4. 成功時、本情報を再取得して表示更新

### 本の削除

1. 削除ボタンをタップ
2. 確認ダイアログを表示
3. `DELETE /books/:id`を呼び出し（ソフトデリート）
4. 成功時、ホーム画面に戻る

### 再戦

1. 再戦ボタンをタップ（討伐済みの場合のみ表示）
2. `POST /books/:id/reset`を呼び出し
3. 進捗リセット、周回数+1、ステータスをreadingに変更
4. 本情報を再取得して表示更新

## コンポーネント設計

### 追加・変更するファイル

#### フロントエンド

| ファイル                                                          | 種別 | 責務                     |
| ----------------------------------------------------------------- | ---- | ------------------------ |
| `apps/web/src/pages/BookDetailPage.tsx`                           | 新規 | 本の詳細ページ           |
| `apps/web/src/pages/BookDetailPage.module.css`                    | 新規 | 詳細ページスタイル       |
| `apps/web/src/features/books/components/BookInfo.tsx`             | 新規 | 本の基本情報表示         |
| `apps/web/src/features/books/components/BookInfo.module.css`      | 新規 | 本情報スタイル           |
| `apps/web/src/features/books/components/BattleLogList.tsx`        | 新規 | 戦闘ログ一覧             |
| `apps/web/src/features/books/components/BattleLogList.module.css` | 新規 | ログ一覧スタイル         |
| `apps/web/src/features/books/components/BookEditModal.tsx`        | 新規 | 本編集モーダル           |
| `apps/web/src/features/books/components/BookEditModal.module.css` | 新規 | 編集モーダルスタイル     |
| `apps/web/src/features/books/components/Pagination.tsx`           | 新規 | ページネーション         |
| `apps/web/src/features/books/components/Pagination.module.css`    | 新規 | ページネーションスタイル |
| `apps/web/src/features/books/hooks/useBookDetail.ts`              | 新規 | 本詳細取得フック         |
| `apps/web/src/features/books/hooks/useBattleLogs.ts`              | 新規 | 戦闘ログ取得フック       |
| `apps/web/src/features/books/services/bookApi.ts`                 | 変更 | API関数追加              |
| `apps/web/src/features/books/components/BookCard.tsx`             | 変更 | タップ可能に             |
| `apps/web/src/features/books/components/index.ts`                 | 変更 | export追加               |
| `apps/web/src/App.tsx`                                            | 変更 | ページ遷移追加           |

#### バックエンド

| ファイル                                                | 種別 | 責務               |
| ------------------------------------------------------- | ---- | ------------------ |
| `apps/api/src/routes/books.ts`                          | 変更 | エンドポイント追加 |
| `apps/api/src/routes/books.test.ts`                     | 変更 | テスト追加         |
| `apps/api/src/services/bookService.ts`                  | 変更 | メソッド追加       |
| `apps/api/src/services/bookService.test.ts`             | 変更 | テスト追加         |
| `apps/api/src/repositories/bookRepository.ts`           | 変更 | メソッド追加       |
| `apps/api/src/repositories/bookRepository.test.ts`      | 変更 | テスト追加         |
| `apps/api/src/repositories/battleLogRepository.ts`      | 新規 | 戦闘ログリポジトリ |
| `apps/api/src/repositories/battleLogRepository.test.ts` | 新規 | リポジトリテスト   |
| `apps/api/src/types/api.ts`                             | 変更 | スキーマ追加       |
| `packages/shared/src/index.ts`                          | 変更 | BattleLog型追加    |

### 主要コンポーネント

#### BookDetailPage

**責務**: 本の詳細画面のコンテナコンポーネント

**インターフェース**:

```typescript
interface BookDetailPageProps {
  bookId: string;
  onBack: () => void;
  onNavigateToBattle: (bookId: string) => void;
}
```

#### BookInfo

**責務**: 本の基本情報を表示

**インターフェース**:

```typescript
interface BookInfoProps {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onReset: () => void;
  onBattle: () => void;
}
```

#### BattleLogList

**責務**: 戦闘ログ一覧を表示（ページネーション付き）

**インターフェース**:

```typescript
interface BattleLogListProps {
  bookId: string;
}
```

#### BookEditModal

**責務**: 本の編集モーダル

**インターフェース**:

```typescript
interface BookEditModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdateBookInput) => Promise<void>;
}
```

### API設計

#### GET /books/:id/logs

戦闘ログ一覧を取得（ページネーション対応）

```typescript
// Request
GET /books/:id/logs?page=1&limit=20

// Response
{
  logs: BattleLog[],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalCount: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

#### PUT /books/:id

本の情報を更新

```typescript
// Request
{
  title?: string,
  totalPages?: number,
  skills?: string[]
}

// Response
Book
```

#### DELETE /books/:id

本をソフトデリート（archived状態に変更）

```typescript
// Response
{
  success: true;
}
```

#### POST /books/:id/reset

再戦（進捗リセット、周回数+1）

```typescript
// Response
Book;
```

## テスト戦略

### ユニットテスト

- BookService: updateBook, deleteBook, resetBookのロジック
- BookRepository: update, softDeleteのDB操作
- BattleLogRepository: findByBookIdのページネーション

### 統合テスト

- 本の編集API: PUT /books/:id
- 本の削除API: DELETE /books/:id
- 再戦API: POST /books/:id/reset
- 戦闘ログ取得API: GET /books/:id/logs

## セキュリティ考慮事項

- 全APIエンドポイントは認証必須（既存のauthミドルウェア使用）
- userIdによるアクセス制御（自分の本のみ操作可能）
