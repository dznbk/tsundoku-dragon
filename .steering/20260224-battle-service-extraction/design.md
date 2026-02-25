# 設計: BookService から戦闘ロジックを BattleService に分離

## 概要

単一責任の原則に基づき、`BookService` から戦闘関連ロジックを `BattleService` に切り出す。

## ファイル構成

### 新規作成

- `apps/api/src/services/battleService.ts` — 戦闘ドメインのサービス
- `apps/api/src/services/battleService.test.ts` — BattleService のユニットテスト

### 変更

- `apps/api/src/services/bookService.ts` — 戦闘関連メソッドを削除
- `apps/api/src/services/bookService.test.ts` — 戦闘関連テストを削除
- `apps/api/src/routes/books.ts` — 戦闘エンドポイントで BattleService を使用

### 変更不要

- `apps/api/src/routes/books.test.ts` — モックが BookRepository/SkillRepository レベルなので変更不要
- `apps/api/src/repositories/` — 変更なし
- `apps/api/src/types/api.ts` — 変更なし
- `apps/api/src/lib/` — 変更なし

## BattleService の設計

```typescript
// apps/api/src/services/battleService.ts

export interface SkillResult { ... }    // BookService から移動
export interface RecordBattleResult { ... }  // BookService から移動

export class BattleService {
  private bookRepository: BookRepository;
  private skillRepository: SkillRepository;

  constructor(env: Env) { ... }

  // 戦闘記録（読書進捗 + 経験値付与）
  async recordBattle(userId, bookId, input): Promise<RecordBattleResult> { ... }

  // 戦闘ログ取得
  async getBookLogs(userId, bookId, options?): Promise<LogsQueryResult> { ... }

  // スキル経験値更新（private）
  private async updateSkillsExp(userId, skills, expToAdd): Promise<SkillResult[]> { ... }
}
```

## BookService（変更後）

```typescript
// 残るメソッド
export class BookService {
  private repository: BookRepository;
  private skillRepository: SkillRepository;

  createBook(userId, input): Promise<Book>;
  listBooks(userId): Promise<Book[]>;
  getBook(userId, bookId): Promise<Book>;
  updateBook(userId, bookId, input): Promise<Book>;
  archiveBook(userId, bookId): Promise<void>;
  resetBook(userId, bookId): Promise<Book>;
  private registerNewSkillsAsCustomSkills(userId, skills): Promise<void>;
}
```

## ルート層の変更

```typescript
// books.ts の戦闘関連エンドポイント
books.get('/:id/logs', ..., async (c) => {
  const service = new BattleService(c.env);  // BookService → BattleService
  ...
});

books.post('/:id/logs', ..., async (c) => {
  const service = new BattleService(c.env);  // BookService → BattleService
  ...
});
```

## 依存関係

```
routes/books.ts → BookService → BookRepository, SkillRepository
                → BattleService → BookRepository, SkillRepository
```

BattleService は BookRepository に依存する（本の取得・更新、ログの保存・取得のため）。これは許容範囲。将来的に BattleRepository を切り出す場合はその時点で対応する。
