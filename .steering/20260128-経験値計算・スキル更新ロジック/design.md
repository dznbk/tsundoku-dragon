# 設計書

## 意思決定

### 採用した設計

経験値計算ロジックを純粋関数として `apps/api/src/lib/expCalculator.ts` に切り出し、BookService.recordBattle から呼び出す。スキル経験値の更新は SkillRepository に `upsertUserSkillExp` メソッドを追加して行う。

### 代替案との比較

| 案                             | メリット                         | デメリット                             | 採用 |
| ------------------------------ | -------------------------------- | -------------------------------------- | ---- |
| 経験値計算を純粋関数として分離 | テスト容易、責務明確、再利用可能 | ファイル数が増える                     | ✓    |
| BookService 内で直接計算       | ファイル数を抑えられる           | 責務が混在、ユニットテストが書きにくい | -    |
| 別サービスクラスを作成         | より細かい責務分離               | この規模では過剰、不要な複雑さ         | -    |

### 選定理由

- 経験値計算は入力と出力が明確な純粋ロジックのため、独立したユーティリティとして切り出すのが自然
- BookService は本の進捗更新という責務を維持しつつ、経験値計算をユーティリティに委譲
- SkillRepository に upsert メソッドを追加することで、既存のリポジトリパターンを踏襲

## データフロー

### 戦闘ログ記録（経験値付き）

1. `POST /books/:id/logs` を受信
2. BookService.recordBattle を呼び出し
3. Book 取得・バリデーション
4. pagesRead 自動補正（残りページを超えないように）
5. BattleLog 保存
6. Book 更新（currentPage, status）
7. **経験値計算**
   - baseExp = pagesRead
   - bonus = 討伐時のみ `defeatBonus(totalPages)`
   - totalExpGained = baseExp + bonus
8. **各スキルの経験値更新**（並列処理）
   - SkillRepository.upsertUserSkillExp を呼び出し
   - 既存レコードがあれば加算、なければ新規作成
9. レスポンス構築（経験値情報を含む）

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                            | 種別 | 責務                              |
| --------------------------------------------------- | ---- | --------------------------------- |
| `apps/api/src/lib/expCalculator.ts`                 | 新規 | 経験値計算の純粋関数              |
| `apps/api/src/lib/expCalculator.test.ts`            | 新規 | 経験値計算のユニットテスト        |
| `apps/api/src/repositories/skillRepository.ts`      | 変更 | upsertUserSkillExp メソッド追加   |
| `apps/api/src/repositories/skillRepository.test.ts` | 変更 | upsertUserSkillExp のテスト追加   |
| `apps/api/src/services/bookService.ts`              | 変更 | recordBattle に経験値ロジック追加 |
| `apps/api/src/services/bookService.test.ts`         | 変更 | 経験値関連のテスト追加            |

### 主要コンポーネント

#### expCalculator

**責務**: 経験値計算の純粋関数を提供

**インターフェース**:

```typescript
// 指定レベルに必要な経験値
export function expForLevel(level: number): number;

// 累計経験値からレベルを計算
export function levelFromExp(totalExp: number): number;

// 討伐ボーナス計算
export function defeatBonus(totalPages: number): number;
```

#### SkillRepository.upsertUserSkillExp

**責務**: ユーザーのスキル経験値を更新（存在しなければ作成）

**インターフェース**:

```typescript
async upsertUserSkillExp(
  userId: string,
  skillName: string,
  expToAdd: number
): Promise<UserSkillExp>;
```

#### RecordBattleResult（拡張後）

**インターフェース**:

```typescript
interface SkillResult {
  skillName: string;
  expGained: number;
  previousLevel: number;
  currentLevel: number;
  currentExp: number;
  leveledUp: boolean;
}

interface RecordBattleResult {
  log: BattleLog;
  book: Book;
  defeat: boolean;
  expGained: number; // 追加
  defeatBonus: number; // 追加
  skillResults: SkillResult[]; // 追加
}
```

## テスト戦略

### ユニットテスト

- **expCalculator**: 各関数の境界値テスト
  - `expForLevel(1)` = 50
  - `expForLevel(2)` = 141
  - `levelFromExp(0)` = 1
  - `levelFromExp(50)` = 2
  - `levelFromExp(49)` = 1
  - `defeatBonus(350)` = 35
  - `defeatBonus(99)` = 9

- **BookService.recordBattle**: 経験値部分のテスト
  - 経験値が各スキルに付与される
  - 討伐時にボーナスが加算される
  - レベルアップが正しく検出される
  - 複数スキルが同時にレベルアップする場合

- **SkillRepository.upsertUserSkillExp**: モックテスト
  - 新規作成ケース
  - 既存更新ケース

### 統合テスト

- **SkillRepository**: DynamoDB Local を使用
  - `upsertUserSkillExp` が新規作成できる
  - `upsertUserSkillExp` が既存レコードを更新できる
