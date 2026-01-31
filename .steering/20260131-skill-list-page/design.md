# 設計書

## 意思決定

### 採用した設計

Issue #60 の仕様に準拠し、`features/skills/` ディレクトリを新規作成してスキル関連コンポーネントをまとめる。既存の `features/books/services/skillApi.ts` は移動せず、新規作成する hooks/utils から参照する。

### 代替案との比較

| 案                             | メリット                             | デメリット                          | 採用 |
| ------------------------------ | ------------------------------------ | ----------------------------------- | ---- |
| 案A: features/skills/ 新規作成 | 責務が明確、将来の拡張に対応しやすい | 既存skillApi.tsとの二重管理の可能性 | ✓    |
| 案B: features/books/ に追加    | 既存構造を維持                       | skills と books の責務が混在        | -    |

### 選定理由

- Issue #60 で明示的に `features/skills/` ディレクトリ構造が指定されている
- スキル関連機能は books とは独立した責務を持つ
- 既存の `skillApi.ts` は books feature から参照されているため、移動せずに再利用

## データフロー

### スキル一覧表示

1. SkillListPage マウント時に useSkills フック呼び出し
2. useSkills が getSkills API を呼び出し
3. レスポンスの userSkillExps をステートに保存
4. ソート・フィルタを適用して SkillCard リストをレンダリング

### 経験値進捗計算

1. UserSkillExp から totalExp と level を取得
2. expCalculator.getExpProgress() で現在レベル内経験値と次レベル必要経験値を計算
3. ExpBar コンポーネントに渡してプログレスバー表示

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                       | 種別 | 責務                       |
| -------------------------------------------------------------- | ---- | -------------------------- |
| `apps/web/src/pages/SkillListPage.tsx`                         | 新規 | スキル一覧画面             |
| `apps/web/src/pages/SkillListPage.module.css`                  | 新規 | スキル一覧画面スタイル     |
| `apps/web/src/features/skills/components/SkillCard.tsx`        | 新規 | スキルカードコンポーネント |
| `apps/web/src/features/skills/components/SkillCard.module.css` | 新規 | スキルカードスタイル       |
| `apps/web/src/features/skills/components/ExpBar.tsx`           | 新規 | 経験値バーコンポーネント   |
| `apps/web/src/features/skills/components/ExpBar.module.css`    | 新規 | 経験値バースタイル         |
| `apps/web/src/features/skills/components/index.ts`             | 新規 | コンポーネントエクスポート |
| `apps/web/src/features/skills/hooks/useSkills.ts`              | 新規 | スキル取得フック           |
| `apps/web/src/features/skills/utils/expCalculator.ts`          | 新規 | 経験値計算ユーティリティ   |
| `apps/web/src/App.tsx`                                         | 変更 | ページ遷移追加             |
| `apps/web/src/pages/HomePage.tsx`                              | 変更 | スキル一覧リンク追加       |

### 主要コンポーネント

#### SkillListPage

**責務**: スキル一覧画面のコンテナ

**インターフェース**:

```typescript
interface SkillListPageProps {
  onBack: () => void;
}
```

**状態**:

- `sortBy`: `'level' | 'name'` - ソート種別
- `filterText`: string - フィルタテキスト

#### SkillCard

**責務**: 個別スキルの表示

**インターフェース**:

```typescript
interface SkillCardProps {
  name: string;
  level: number;
  currentExp: number; // 現在レベル内での経験値
  expToNextLevel: number; // 次のレベルに必要な経験値
  totalExp: number; // 累計経験値
}
```

#### ExpBar

**責務**: 経験値プログレスバーの表示

**インターフェース**:

```typescript
interface ExpBarProps {
  current: number; // 現在レベル内での経験値
  max: number; // 次のレベルに必要な経験値
}
```

**HpBar との違い**:

- 色が `--color-exp`（黄色系）
- ラベルが「EXP」
- アニメーション機能は不要（静的表示）

#### useSkills

**責務**: スキルデータの取得

**インターフェース**:

```typescript
interface UseSkillsResult {
  skills: UserSkillExp[];
  isLoading: boolean;
  error: string | null;
}

function useSkills(): UseSkillsResult;
```

#### expCalculator

**責務**: 経験値・レベル計算

**インターフェース**:

```typescript
// 指定レベルで次のレベルに必要な経験値
export function expForLevel(level: number): number;

// 累計経験値から現在レベル内進捗を計算
export function getExpProgress(
  totalExp: number,
  level: number
): {
  currentLevelExp: number;
  expToNextLevel: number;
};
```

## テスト戦略

### ユニットテスト

- `expCalculator`: expForLevel, getExpProgress の計算が正しいこと
- `SkillCard`: props に応じた正しい表示
- `ExpBar`: プログレスバーの幅が正しいこと
- `SkillListPage`: ソート・フィルタが正しく動作すること

### 統合テスト（必要な場合）

- 不要（既存APIを使用し、ロジックはフロントエンドで完結）

---

## エラーハンドリング

- スキル取得失敗時: 「スキルの取得に失敗しました」メッセージ表示
- スキルが0件の場合: 「まだスキルがありません。本を読んでスキルを獲得しましょう！」メッセージ表示
- フィルタ該当なしの場合: 「該当するスキルがありません」メッセージ表示
