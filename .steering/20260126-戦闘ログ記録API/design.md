# 設計書

## 意思決定

### 採用した設計

既存の BookService / BookRepository パターンに従い、recordBattle メソッドを追加する。
pagesRead の自動補正はサービス層で行い、リポジトリ層は純粋なデータ操作に徹する。

### 代替案との比較

| 案                               | メリット               | デメリット               | 採用 |
| -------------------------------- | ---------------------- | ------------------------ | ---- |
| BookService に recordBattle 追加 | 既存パターンとの一貫性 | -                        | ✓    |
| BattleService を新設             | 責務分離が明確         | オーバーエンジニアリング | -    |

### 選定理由

- 既存の BookService が本の CRUD とログ取得を担当しており、ログ記録も同じサービスで扱うのが自然
- 将来的に経験値計算（Issue #56）が追加される際に、BattleService への分離を検討可能

## データフロー

### 戦闘ログ記録

1. クライアントが `POST /books/:id/logs` を呼び出す
2. ルートハンドラがリクエストをバリデーション
3. BookService.recordBattle() を呼び出す
4. 本の存在確認・ステータスチェック
5. pagesRead を残りページ数に自動補正
6. BattleLog を作成・保存
7. Book の currentPage を更新（討伐時は status も更新）
8. レスポンスを返却

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                    | 種別 | 責務                              |
| ------------------------------------------- | ---- | --------------------------------- |
| `apps/api/src/types/api.ts`                 | 変更 | createBattleLogSchema 追加        |
| `apps/api/src/services/bookService.ts`      | 変更 | recordBattle メソッド追加         |
| `apps/api/src/routes/books.ts`              | 変更 | POST /:id/logs ルート追加         |
| `apps/api/src/services/bookService.test.ts` | 変更 | recordBattle のユニットテスト追加 |
| `apps/api/src/routes/books.test.ts`         | 変更 | POST /:id/logs のルートテスト追加 |

### 主要コンポーネント

#### BookService.recordBattle

**責務**: 戦闘ログの記録、本の進捗更新、討伐判定

**インターフェース**:

```typescript
interface RecordBattleInput {
  pagesRead: number;
  memo?: string;
}

interface RecordBattleResult {
  log: BattleLog;
  book: Book;
  defeat: boolean;
}

async recordBattle(
  userId: string,
  bookId: string,
  input: RecordBattleInput
): Promise<RecordBattleResult>
```

#### createBattleLogSchema

**責務**: リクエストボディのバリデーション

**インターフェース**:

```typescript
const createBattleLogSchema = z.object({
  pagesRead: z.number().int().positive('ページ数は1以上の整数です'),
  memo: z.string().max(1000, 'メモは1000文字以内です').optional(),
});

type CreateBattleLogInput = z.infer<typeof createBattleLogSchema>;
```

## テスト戦略

### ユニットテスト（BookService）

- recordBattle: 正常系（ログ記録、currentPage 更新）
- recordBattle: 討伐時に status が completed になる
- recordBattle: pagesRead が残りページを超えた場合、自動補正される
- recordBattle: 存在しない本は null を返す
- recordBattle: reading 以外の status はエラー

### ルートテスト（books.ts）

- POST /books/:id/logs: 正常系（201 を返す）
- POST /books/:id/logs: 存在しない本は 404
- POST /books/:id/logs: reading 以外の status は 400
- POST /books/:id/logs: バリデーションエラーは 400

---

## エラーハンドリング

| ケース                  | ステータス | メッセージ                      |
| ----------------------- | ---------- | ------------------------------- |
| 本が存在しない          | 404        | `Book not found`                |
| 本が reading 状態でない | 400        | `Book is not in reading status` |
| pagesRead が 0 以下     | 400        | Zod バリデーションエラー        |
| memo が 1000 文字超過   | 400        | Zod バリデーションエラー        |
