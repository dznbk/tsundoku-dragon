# 設計書

## 意思決定

### 採用した設計

**一括取得 + 並列保存方式**

1. グローバルスキルとカスタムスキルを `Promise.all` で並列一括取得
2. 既存スキル名をSetで管理し、O(1)で存在チェック
3. 新規スキルを `Promise.all` で並列保存

### 代替案との比較

| 案                  | メリット                     | デメリット                              | 採用 |
| ------------------- | ---------------------------- | --------------------------------------- | ---- |
| 一括取得 + 並列保存 | DB呼び出し固定、実装シンプル | 全件取得のオーバーヘッド                | ✓    |
| BatchGetItem使用    | 必要なスキルのみ取得         | DynamoDB BatchGetItemの複雑さ、25件制限 | -    |
| キャッシュ導入      | 高速化                       | 複雑性増加、キャッシュ無効化問題        | -    |

### 選定理由

- **シンプルさ**: 既存の `findGlobalSkills` / `findUserCustomSkills` メソッドをそのまま活用
- **予測可能性**: DB呼び出し回数が入力スキル数に依存しない
- **後方互換性**: API変更不要、サービス層の内部実装変更のみ
- **現実的なスケール**: グローバルスキルは29件程度、将来も数百件想定

## データフロー

### 本登録時のカスタムスキル自動登録（改善後）

1. BookService.createBook が呼ばれる
2. 本の保存後、registerNewSkillsAsCustomSkills を呼び出し
3. グローバルスキル一覧とカスタムスキル一覧を並列取得（2回のDB読み込み）
4. 既存スキル名のSetを作成
5. 入力スキルから既存スキルを除外
6. 新規スキルを並列でカスタムスキルとして保存

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                    | 種別 | 責務                                             |
| ------------------------------------------- | ---- | ------------------------------------------------ |
| `apps/api/src/services/bookService.ts`      | 変更 | registerNewSkillsAsCustomSkills メソッドの最適化 |
| `apps/api/src/services/bookService.test.ts` | 変更 | 新しいロジックに対応したテストケース更新         |

### 主要コンポーネント

#### BookService.registerNewSkillsAsCustomSkills（改善後）

**責務**: 入力スキルのうち、グローバル/カスタムに存在しないものを新規カスタムスキルとして登録

**インターフェース**:

```typescript
private async registerNewSkillsAsCustomSkills(
  userId: string,
  skills: string[]
): Promise<void>
```

**改善後の実装ロジック**:

```typescript
private async registerNewSkillsAsCustomSkills(
  userId: string,
  skills: string[]
): Promise<void> {
  if (skills.length === 0) return;

  // 2回のDB呼び出しで既存スキルを一括取得
  const [globalSkills, customSkills] = await Promise.all([
    this.skillRepository.findGlobalSkills(),
    this.skillRepository.findUserCustomSkills(userId),
  ]);

  const existingNames = new Set([
    ...globalSkills.map((s) => s.name),
    ...customSkills.map((s) => s.name),
  ]);

  const newSkills = skills.filter((name) => !existingNames.has(name));

  // 新規スキルを並列保存
  await Promise.all(
    newSkills.map((name) =>
      this.skillRepository.saveUserCustomSkill(userId, name)
    )
  );
}
```

## テスト戦略

### ユニットテスト

- **registerNewSkillsAsCustomSkills**:
  - findGlobalSkills/findUserCustomSkills が呼ばれることを確認
  - 新規スキルのみが saveUserCustomSkill で保存されることを確認
  - グローバルスキルに存在する場合は登録しないことを確認
  - カスタムスキルに既に存在する場合は登録しないことを確認
  - スキルが空の場合はDB呼び出しが発生しないことを確認

### テストケース更新

既存テストのモック構成を変更:

- `mockHasGlobalSkill` / `mockHasUserCustomSkill` → `mockFindGlobalSkills` / `mockFindUserCustomSkills`

## パフォーマンス考慮事項

### 改善効果

| 項目                         | 改善前                     | 改善後                     |
| ---------------------------- | -------------------------- | -------------------------- |
| DB読み込み                   | スキル数 × 2回             | 2回（固定）                |
| DB書き込み                   | 新規スキル数 × 1回（逐次） | 新規スキル数 × 1回（並列） |
| 合計（5スキル、2新規の場合） | 最大12回（逐次）           | 4回（2並列 + 2並列）       |

### 将来の懸念

- グローバルスキルが1000件を超える場合は全件取得がボトルネックになる可能性
- 対策: ページネーション導入、またはスキル名のみを返す軽量APIの追加
- 現状は管理者手動追加のため数百件に収まる想定で許容
