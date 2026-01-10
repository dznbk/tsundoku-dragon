# 設計書

## 意思決定

### 採用した設計

タイトル入力欄にオートコンプリート機能を追加し、既存のSkillTagInputと同様のドロップダウンUIパターンを採用する。

### 代替案との比較

| 案                                          | メリット                     | デメリット                         | 採用 |
| ------------------------------------------- | ---------------------------- | ---------------------------------- | ---- |
| 案A: タイトル入力欄に直接オートコンプリート | 既存フォームへの最小限の変更 | 手入力と自動入力の競合に注意が必要 | ✓    |
| 案B: 別の検索モーダルを追加                 | 機能が明確に分離             | 遷移が増えてUXが煩雑               | -    |
| 案C: 検索専用タブを追加                     | ISBN検索と明確に分離         | 画面設計の大幅変更が必要           | -    |

### 選定理由

- 既存のフォーム構造を維持しつつ機能追加できる
- SkillTagInputで実績のあるドロップダウンパターンを再利用
- ユーザーの入力フローを変えない（タイトル入力→候補表示→選択）

## データフロー

### タイトル検索フロー

1. ユーザーがタイトル入力欄にテキストを入力
2. 500ms debounce後、NDL OpenSearch APIを呼び出し
3. XMLレスポンスをパースし、書籍候補リストを生成
4. ドロップダウンで候補を表示
5. ユーザーが候補を選択
6. 選択した書籍のISBN・ページ数・書影URLをフォームに反映
7. ISBN反映により既存のuseBookInfoが発火し、書影プレビューが更新

### 既存のISBN検索フローとの共存

- ISBN入力とタイトル検索は独立して動作
- タイトル検索で候補選択 → ISBN欄が埋まる → useBookInfoが発火
- 直接ISBN入力 → useBookInfoが発火（従来通り）

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                             | 種別 | 責務                             |
| -------------------------------------------------------------------- | ---- | -------------------------------- |
| `apps/web/src/features/books/services/ndlApi.ts`                     | 変更 | タイトル検索関数を追加           |
| `apps/web/src/features/books/hooks/useTitleSearch.ts`                | 新規 | タイトル検索のdebounce・状態管理 |
| `apps/web/src/features/books/components/TitleSearchInput.tsx`        | 新規 | タイトル入力＋ドロップダウンUI   |
| `apps/web/src/features/books/components/TitleSearchInput.module.css` | 新規 | TitleSearchInputのスタイル       |
| `apps/web/src/features/books/components/BookForm.tsx`                | 変更 | TitleSearchInputを組み込む       |
| `apps/web/src/features/books/components/index.ts`                    | 変更 | TitleSearchInputをエクスポート   |

### 主要コンポーネント

#### NdlBookSearchResult（型定義）

**責務**: NDL検索結果の書籍情報を表す

```typescript
export interface NdlBookSearchResult {
  title: string;
  author: string | null;
  isbn: string | null;
  totalPages: number | null;
  coverUrl: string | null;
}
```

#### fetchBooksByTitle（関数）

**責務**: タイトルでNDL APIを検索し、書籍候補を返す

```typescript
export async function fetchBooksByTitle(
  title: string
): Promise<NdlBookSearchResult[]>;
```

- 書籍以外の資料（映像、音声等）をフィルタリング
- 最大10件に制限

#### useTitleSearch（フック）

**責務**: タイトル検索のdebounce処理と状態管理

```typescript
export function useTitleSearch(): {
  searchResults: NdlBookSearchResult[];
  isSearching: boolean;
  searchTitle: (title: string) => void;
  clearResults: () => void;
};
```

#### TitleSearchInput（コンポーネント）

**責務**: タイトル入力欄とドロップダウン候補表示

```typescript
interface TitleSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: NdlBookSearchResult) => void;
  error?: string;
}
```

## テスト戦略

### ユニットテスト

- `ndlApi.ts`: XMLパースロジック、書籍フィルタリング、ページ数抽出
- `useTitleSearch.ts`: debounce動作、検索結果の状態管理
- `TitleSearchInput.tsx`: キーボード操作、候補選択イベント

### テストケース例

```typescript
// ndlApi.test.ts
describe('fetchBooksByTitle', () => {
  it('タイトルで検索して書籍候補を返す');
  it('書籍以外の資料（映像等）を除外する');
  it('ISBNがない書籍も含める');
  it('検索結果が10件を超える場合は10件に制限する');
  it('空文字の場合は空配列を返す');
});

// TitleSearchInput.test.tsx
describe('TitleSearchInput', () => {
  it('入力欄にタイトルを入力できる');
  it('検索結果がドロップダウンで表示される');
  it('候補をクリックするとonSelectが呼ばれる');
  it('矢印キーで候補を選択できる');
  it('Enterキーで選択中の候補を確定できる');
  it('Escapeキーでドロップダウンを閉じる');
});
```

---

## パフォーマンス考慮事項

- debounce 500msで過剰なAPI呼び出しを防止
- AbortControllerで前回のリクエストをキャンセル
- 検索結果は10件に制限しDOMノード数を抑制
