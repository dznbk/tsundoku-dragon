# 設計書

## 意思決定

### 採用した設計

DynamoDB の `UpdateCommand` + `ADD` 式による2ステップアトミック更新:

1. `ADD exp :expToAdd` で経験値をアトミックに加算し、`ReturnValues: 'ALL_NEW'` で更新後の値を取得
2. 取得した新しい exp から `levelFromExp()` でレベルを計算し、`SET #level = :newLevel` で更新

### 代替案との比較

| 案                                | メリット                           | デメリット                  | 採用 |
| --------------------------------- | ---------------------------------- | --------------------------- | ---- |
| 案A: 2ステップ（ADD + SET level） | exp がアトミック、level も即時反映 | DB呼び出し2回（現状と同数） | ✓    |
| 案B: ADD のみ（level 更新なし）   | DB呼び出し1回                      | level が更新されず不整合    | -    |
| 案C: TransactWriteItems           | 完全な原子性                       | 過剰設計、コスト増          | -    |

### 選定理由

- 案A は現行の2回の DB 呼び出し（GET + PUT）と同数で、exp の原子性を確保できる
- `level` は `exp` からの派生値であり、厳密な原子性は不要（最終的に正しい値になる）
- `level` は単調増加するため、並行更新時の一時的な不整合は実用上問題ない

## データフロー

### 経験値のアトミック更新

**変更前（Read-Then-Write）:**

1. `GetCommand` で現在の exp を取得
2. アプリケーション側で `newExp = previousExp + expToAdd` を計算
3. `PutCommand` で newExp と newLevel をまるごと書き込み
4. → 並行リクエスト時にステップ1の値が古くなり、ステップ3で上書きされるリスク

**変更後（アトミック更新）:**

1. `UpdateCommand` + `ADD exp :expToAdd` でサーバーサイドで加算（`ReturnValues: 'ALL_NEW'`）
2. 返却された `Attributes.exp` から `levelFromExp()` でレベルを計算
3. `UpdateCommand` + `SET #level = :newLevel` でレベルを更新
4. → exp の加算は DynamoDB がアトミックに処理するため、ロストアップデートが発生しない

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                        | 種別 | 責務                                                                          |
| --------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `apps/api/src/repositories/skillRepository.ts`                  | 変更 | `upsertUserSkillExp` をアトミック更新に変更、`UpdateCommand` を import に追加 |
| `apps/api/src/repositories/skillRepository.test.ts`             | 変更 | `upsertUserSkillExp` のユニットテストを UpdateCommand ベースに修正            |
| `apps/api/src/repositories/skillRepository.integration.test.ts` | 確認 | 動作が変わらないことを確認（変更不要の想定）                                  |

### 主要コンポーネント

#### `SkillRepository.upsertUserSkillExp`

**責務**: ユーザーのスキル経験値をアトミックに加算し、レベルを更新する

**インターフェース（変更なし）**:

```typescript
async upsertUserSkillExp(
  userId: string,
  skillName: string,
  expToAdd: number
): Promise<UserSkillExp>
```

**内部実装の変更**:

```typescript
// Step 1: exp をアトミックに加算
const result = await this.client.send(
  new UpdateCommand({
    TableName: this.tableName,
    Key: { PK: `USER#${userId}`, SK: `SKILL#${skillName}` },
    UpdateExpression: 'ADD exp :expToAdd',
    ExpressionAttributeValues: { ':expToAdd': expToAdd },
    ReturnValues: 'ALL_NEW',
  })
);

const newExp = result.Attributes!.exp as number;
const newLevel = levelFromExp(newExp);

// Step 2: level を更新（level は DynamoDB 予約語のため ExpressionAttributeNames を使用）
await this.client.send(
  new UpdateCommand({
    TableName: this.tableName,
    Key: { PK: `USER#${userId}`, SK: `SKILL#${skillName}` },
    UpdateExpression: 'SET #level = :newLevel',
    ExpressionAttributeNames: { '#level': 'level' },
    ExpressionAttributeValues: { ':newLevel': newLevel },
  })
);

return { name: skillName, exp: newExp, level: newLevel };
```

## テスト戦略

### ユニットテスト

- `upsertUserSkillExp`: mockSend が UpdateCommand を2回受け取ること（ADD + SET level）
- 新規スキル作成: ADD の結果として正しい exp が返ること
- 既存スキル更新: ADD の結果として累積 exp が返ること
- レベル計算: 返却された exp から正しい level が計算されること

### 統合テスト

- 既存の統合テストがそのまま通ることを確認（動作の互換性）

## パフォーマンス考慮事項

- DB 呼び出し回数は変更前と同じ2回（GET + PUT → UPDATE + UPDATE）
- `ReturnValues: 'ALL_NEW'` による追加のデータ転送コストは無視できる程度
