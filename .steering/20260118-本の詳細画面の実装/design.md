# 設計書

## 意思決定

### 採用した設計

既存パターンに従い、バックエンドは Hono + レイヤードアーキテクチャ、フロントエンドは Feature-based 構成で実装する。

### 代替案との比較

| 案                   | メリット                   | デメリット     | 採用 |
| -------------------- | -------------------------- | -------------- | ---- |
| 既存パターン踏襲     | 一貫性維持、学習コストなし | -              | ✓    |
| 新アーキテクチャ導入 | 最新のベストプラクティス   | 不整合が生じる | -    |

### 選定理由

プロジェクト内の一貫性を維持し、既存コードとの統合をスムーズにするため。

## データフロー

### 本の詳細取得

1. ユーザーがホーム画面で本カードをクリック
2. フロントエンドが `GET /books/:id` を呼び出し
3. サービス層がユーザーIDと本IDで検索
4. 本の詳細情報を返却

### 戦闘ログ一覧取得

1. 詳細画面で `GET /books/:id/logs` を呼び出し
2. リポジトリが `BOOK#{bookId}#LOG#` でクエリ
3. ページネーション付きでログを返却

### 本の編集

1. 編集モーダルでフォーム送信
2. `PUT /books/:id` を呼び出し
3. サービス層でバリデーション・更新
4. 更新後の本情報を返却

### 本の削除（アーカイブ）

1. 削除確認後 `DELETE /books/:id` を呼び出し
2. status を `archived` に変更（ソフトデリート）
3. ホーム画面に戻る

### 再戦

1. 再戦ボタンクリックで `POST /books/:id/reset` を呼び出し
2. currentPage を 0 に、round を +1
3. status を `reading` に変更

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                   | 種別 | 責務                               |
| ---------------------------------------------------------- | ---- | ---------------------------------- |
| `apps/api/src/routes/books.ts`                             | 変更 | 新規エンドポイント追加             |
| `apps/api/src/services/bookService.ts`                     | 変更 | 編集・削除・再戦・ログ取得ロジック |
| `apps/api/src/repositories/bookRepository.ts`              | 変更 | update・ログクエリ追加             |
| `apps/api/src/types/api.ts`                                | 変更 | スキーマ追加                       |
| `apps/web/src/pages/BookDetailPage.tsx`                    | 新規 | 本の詳細ページ                     |
| `apps/web/src/pages/BookDetailPage.module.css`             | 新規 | スタイル                           |
| `apps/web/src/features/books/components/BookInfo.tsx`      | 新規 | 本の情報表示                       |
| `apps/web/src/features/books/components/BattleLogList.tsx` | 新規 | 戦闘ログ一覧                       |
| `apps/web/src/features/books/components/BookEditModal.tsx` | 新規 | 編集モーダル                       |
| `apps/web/src/features/books/services/bookApi.ts`          | 変更 | API関数追加                        |
| `apps/web/src/features/books/hooks/useBook.ts`             | 新規 | 本詳細取得フック                   |
| `apps/web/src/features/books/hooks/useBattleLogs.ts`       | 新規 | ログ取得フック                     |
| `apps/web/src/App.tsx`                                     | 変更 | ルーティング追加                   |
| `packages/shared/src/index.ts`                             | 変更 | BattleLog型追加                    |

### 主要コンポーネント

#### API: `PUT /books/:id`

**責務**: 本の情報を更新

**インターフェース**:

```typescript
// Request Body
const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  totalPages: z.number().int().positive().optional(),
  skills: z.array(z.string()).optional(),
});

// Response
interface Book {
  /* 既存 */
}
```

#### API: `DELETE /books/:id`

**責務**: 本をアーカイブ（ソフトデリート）

**インターフェース**:

```typescript
// Response: 204 No Content
```

#### API: `POST /books/:id/reset`

**責務**: 本の進捗をリセットし再戦開始

**インターフェース**:

```typescript
// Response
interface Book {
  /* currentPage=0, round+1, status='reading' */
}
```

#### API: `GET /books/:id/logs`

**責務**: 戦闘ログ一覧をページネーション付きで取得

**インターフェース**:

```typescript
// Query
interface LogsQuery {
  limit?: number; // default: 20
  cursor?: string; // ページネーション用
}

// Response
interface BattleLogsResponse {
  logs: BattleLog[];
  nextCursor?: string;
}

interface BattleLog {
  id: string;
  pagesRead: number;
  memo?: string;
  createdAt: string;
}
```

#### フロントエンド: BookDetailPage

**責務**: 本の詳細画面のレイアウトと状態管理

```typescript
interface BookDetailPageProps {
  bookId: string;
  onBack: () => void;
  onNavigateToBattle: (bookId: string) => void;
}
```

#### フロントエンド: BookInfo

**責務**: 本の情報を表示

```typescript
interface BookInfoProps {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onReset: () => void;
  onBattle: () => void;
}
```

#### フロントエンド: BattleLogList

**責務**: 戦闘ログを一覧表示

```typescript
interface BattleLogListProps {
  bookId: string;
}
```

#### フロントエンド: BookEditModal

**責務**: 本の編集フォームをモーダルで表示

```typescript
interface BookEditModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateBookInput) => Promise<void>;
}
```

## テスト戦略

### ユニットテスト

- `bookService.updateBook`: 正常更新、バリデーションエラー
- `bookService.archiveBook`: ステータス変更確認
- `bookService.resetBook`: round増加、currentPage=0確認
- `bookRepository.findLogs`: ページネーション動作

### 統合テスト

- `PUT /books/:id`: 認証、所有者確認、更新反映
- `DELETE /books/:id`: ソフトデリート確認
- `POST /books/:id/reset`: 再戦後の状態確認
- `GET /books/:id/logs`: ページネーション動作

---

## エラーハンドリング

| エラー               | HTTPステータス | メッセージ               |
| -------------------- | -------------- | ------------------------ |
| 本が見つからない     | 404            | Book not found           |
| 他ユーザーの本       | 404            | Book not found           |
| バリデーションエラー | 400            | 詳細メッセージ           |
| 既にアーカイブ済み   | 400            | Book is already archived |

## セキュリティ考慮事項

- 全エンドポイントで認証必須
- ユーザーIDでフィルタし、他ユーザーの本は操作不可
