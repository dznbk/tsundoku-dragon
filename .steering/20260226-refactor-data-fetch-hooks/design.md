# 設計書

## 意思決定

### 採用した設計

汎用hook `useAsyncData<T>` を作成し、共通のfetchパターン（isLoading / error / try-catch-finally / useEffect）を抽出する。各hookはfetcher関数とオプションを渡すだけで同じパターンを実現できる。

### 代替案との比較

| 案                                 | メリット                                      | デメリット                                         | 採用 |
| ---------------------------------- | --------------------------------------------- | -------------------------------------------------- | ---- |
| 案A: useAsyncData（ローカルstate） | シンプル、useBook/useSkillsにそのまま適用可能 | Jotai atom利用hookには適用不可                     | ✓    |
| 案B: SWR / TanStack Query 導入     | キャッシュ・再取得・楽観更新など高機能        | 依存追加が大きい、既存hookの書き換え範囲が広い     | -    |
| 案C: Jotai atomベースの汎用hook    | 全hookを統一的に扱える                        | 複雑、useBook等のローカルstateを無理にグローバル化 | -    |

### 選定理由

- issueの趣旨は「重複パターンの共通化」であり、新ライブラリ導入ほどの大改修は求められていない
- ローカルstateで完結する `useBook` と `useSkills` が最も素直に共通化できる対象
- Jotai atom利用hookやページネーションhookは構造が異なるため、無理に共通化すると逆に複雑になる

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                          | 種別 | 責務                                  |
| ------------------------------------------------- | ---- | ------------------------------------- |
| `apps/web/src/shared/hooks/useAsyncData.ts`       | 新規 | 汎用データフェッチhook                |
| `apps/web/src/shared/hooks/useAsyncData.test.ts`  | 新規 | useAsyncDataのユニットテスト          |
| `apps/web/src/features/books/hooks/useBook.ts`    | 変更 | useAsyncDataを使ってfetch部分を簡素化 |
| `apps/web/src/features/skills/hooks/useSkills.ts` | 変更 | useAsyncDataを使って書き換え          |

### 主要コンポーネント

#### useAsyncData

**責務**: データフェッチの共通パターン（loading / error / fetch / refetch）をカプセル化する

**インターフェース**:

```typescript
interface UseAsyncDataOptions {
  errorMessage?: string;
  enabled?: boolean; // falseのときfetchを実行しない（user未認証時など）
}

interface UseAsyncDataResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  initialData: T,
  options?: UseAsyncDataOptions
): UseAsyncDataResult<T>;
```

**設計ポイント**:

- `initialData` を必須にすることで `T | null` を避け、呼び出し側での型ガードを減らす
  - ただし `useBook` のように null が自然な場合は `initialData: null` で `T = Book | null` とする
- `enabled` オプションで `if (!user) return` パターンを共通化
- `deps` は `useCallback` の依存配列としてそのまま渡す（issueの提案と同様）

## テスト戦略

### ユニットテスト

- `useAsyncData`: renderHookを使って以下をテスト
  - 初期fetch成功時にdataが設定される
  - fetch失敗時にerrorが設定される
  - enabled=falseのときfetchが実行されない
  - refetchで再取得できる
  - deps変更時に再fetchされる

### 既存テストの確認

- `useBook`, `useSkills` の既存テストがあれば、リファクタリング後もパスすることを確認
