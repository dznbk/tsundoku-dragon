# 設計書

## 意思決定

### 採用した設計

1. グローバルスキルシードは既存の `scripts/seed-test-data.ts` パターンに従い、独立したスクリプトとして実装
2. カスタムスキル自動登録は `BookService.createBook` 内で `SkillRepository` を呼び出して実装

### 代替案との比較

| 案                                         | メリット               | デメリット                       | 採用 |
| ------------------------------------------ | ---------------------- | -------------------------------- | ---- |
| A: BookService 内で SkillRepository を呼出 | 責務の分離、テスト容易 | Service 間の依存が増える         | ✓    |
| B: SkillService を BookService から呼出    | Service 層で完結       | 循環依存のリスク                 | -    |
| C: books ルートで別途 SkillService を呼出  | 疎結合                 | トランザクションの一貫性が難しい | -    |

### 選定理由

- 案Aは本登録と同一トランザクション（DynamoDBのBatchWrite）で処理可能
- 既存の Repository パターンに合致
- テストが容易（Repository のモック化）

## データフロー

### グローバルスキル初期データ投入

1. `npx tsx scripts/seed-global-skills.ts` を実行
2. 定義されたスキルを DynamoDB に PutCommand でバッチ投入
3. `PK=GLOBAL, SK=SKILL#{skillName}` の形式で保存

### 本登録時のカスタムスキル自動登録

1. `POST /books` で本を登録
2. `BookService.createBook` 内で入力されたスキルをチェック
3. グローバルスキル一覧を取得
4. ユーザーのカスタムスキル一覧を取得
5. どちらにも存在しないスキルをカスタムスキルとして登録
6. 本を保存

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                       | 種別 | 責務                             |
| ---------------------------------------------- | ---- | -------------------------------- |
| `scripts/seed-global-skills.ts`                | 新規 | グローバルスキル初期データ投入   |
| `apps/api/src/repositories/skillRepository.ts` | 変更 | カスタムスキル追加メソッド追加   |
| `apps/api/src/services/bookService.ts`         | 変更 | 本登録時のカスタムスキル自動登録 |

### 主要コンポーネント

#### SkillRepository（変更）

**責務**: スキルデータのCRUD操作

**追加インターフェース**:

```typescript
// グローバルスキルの存在確認
async hasGlobalSkill(skillName: string): Promise<boolean>

// カスタムスキルの存在確認
async hasUserCustomSkill(userId: string, skillName: string): Promise<boolean>

// カスタムスキルの保存
async saveUserCustomSkill(userId: string, skillName: string): Promise<void>
```

#### BookService（変更）

**責務**: 本のビジネスロジック

**変更内容**: `createBook` 内でカスタムスキル自動登録を実行

```typescript
async createBook(userId: string, input: CreateBookInput): Promise<Book> {
  // 既存の本登録処理...

  // 新規スキルをカスタムスキルに自動登録
  await this.registerNewSkillsAsCustomSkills(userId, input.skills);

  // ...
}
```

## テスト戦略

### ユニットテスト

- `SkillRepository`: 新規メソッドの動作確認（モック使用）
- `BookService`: カスタムスキル自動登録のロジック確認

### 統合テスト

- 本登録 → カスタムスキル登録 → スキル一覧取得 の一連の流れ

## エラーハンドリング

- スキル登録失敗時: 本登録は成功させ、スキル登録エラーはログに記録
  - 理由: 本登録が主機能であり、スキル登録は補助機能

## 初期グローバルスキル一覧

issue #20 に記載の初期スキル:

| カテゴリ           | スキル                                                  |
| ------------------ | ------------------------------------------------------- |
| プログラミング言語 | JavaScript, TypeScript, Python, Go, Rust, PHP, Java, C# |
| フレームワーク     | React, Vue, Next.js, Express, NestJS                    |
| データベース       | MySQL, PostgreSQL, MongoDB, Redis, DynamoDB             |
| インフラ           | Docker, Kubernetes, AWS, GCP, Terraform                 |
| その他             | Git, CI/CD, テスト, 設計, アーキテクチャ                |
