# 設計書

## 意思決定

### 採用した設計

既存の `dynamodb-helper.ts` を活用し、BookRepositoryの統合テストを `*.integration.test.ts` パターンで作成する。各テストケースで一意のIDを使用し、テストの独立性を確保する。

### 代替案との比較

| 案                                       | メリット                             | デメリット             | 採用 |
| ---------------------------------------- | ------------------------------------ | ---------------------- | ---- |
| 各テストでユニークID使用                 | テスト間の独立性が高い、並列実行可能 | IDの管理が必要         | ✓    |
| beforeEach/afterEachで毎回クリーンアップ | シンプル                             | テストが遅くなる       | -    |
| 共有テストデータ                         | セットアップが簡単                   | テスト間で依存が生じる | -    |

### 選定理由

- 既存の `dynamodb-helper.ts` に `createTestEnv()` が用意されており、再利用可能
- ユニークIDを使用することでテストの独立性と並列実行を両立
- `afterAll` でまとめてクリーンアップすることでテスト速度を維持

## データフロー

### save & findById ラウンドトリップ

1. `BookRepository.save(book)` で本を保存
2. `BookRepository.findById(userId, bookId)` で取得
3. 保存したデータと取得したデータが一致することを検証

### findByUserId クエリ

1. 同一ユーザーで複数の本を保存
2. `BookRepository.findByUserId(userId)` でクエリ実行
3. begins_with条件で正しくフィルタリングされることを検証

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                       | 種別 | 責務                       |
| -------------------------------------------------------------- | ---- | -------------------------- |
| `apps/api/src/repositories/bookRepository.integration.test.ts` | 新規 | BookRepositoryの統合テスト |

### テストファイル構造

```typescript
// bookRepository.integration.test.ts

describe('BookRepository Integration', () => {
  // セットアップ：DynamoDB Local接続
  beforeAll(async () => {
    await setupTestDB();
  });

  // クリーンアップ
  afterAll(async () => {
    await cleanupTestData();
    resetClients();
  });

  describe('save & findById', () => {
    // ラウンドトリップテスト
  });

  describe('findByUserId', () => {
    // 複数件クエリテスト
    // begins_with動作検証
  });

  describe('エッジケース', () => {
    // データなしユーザー
    // 存在しないID
  });
});
```

## テスト戦略

### 統合テストケース

1. **save & findById ラウンドトリップ**
   - 本を保存して同じIDで取得できることを確認
   - 全フィールドが正しくマーシャリングされることを確認

2. **findByUserId クエリ**
   - 同一ユーザーの複数の本が取得できることを確認
   - begins_with条件が正しく機能することを確認
   - 他のユーザーの本が含まれないことを確認

3. **エッジケース**
   - データがないユーザーで空配列が返ることを確認
   - 存在しないIDでnullが返ることを確認

### テストデータ設計

```typescript
// ユニークIDを生成してテスト間の独立性を確保
const createUniqueId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// テスト用の本データを生成
const createTestBook = (overrides?: Partial<Book>): Book => ({
  id: createUniqueId('book'),
  userId: createUniqueId('user'),
  title: 'テスト本',
  totalPages: 100,
  currentPage: 0,
  status: 'reading',
  skills: ['TypeScript'],
  round: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
```

---

## エラーハンドリング

- DynamoDB Localが起動していない場合：接続エラーでテストがスキップされる設計にはしない（CI/CDで問題を検出できるようにするため）
- テーブルが存在しない場合：`setupTestDB()` が自動的にテーブルを作成
