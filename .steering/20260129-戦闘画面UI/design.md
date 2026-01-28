# 設計書

## 意思決定

### 採用した設計

Issue #57で定義されたファイル構成に従い、戦闘画面関連のコンポーネントを`features/books/`配下に配置する。API呼び出しは既存の`bookApi.ts`に追加し、フックは新規に`useBattle.ts`を作成する。

### 代替案との比較

| 案                         | メリット                         | デメリット             | 採用 |
| -------------------------- | -------------------------------- | ---------------------- | ---- |
| features/books/配下に配置  | 既存パターンに沿う、凝集度が高い | -                      | ✓    |
| features/battle/を新規作成 | 責務が明確に分離                 | 既存パターンから外れる | -    |

### 選定理由

- 戦闘機能は「本」に紐づいた機能であり、`features/books/`に配置するのが自然
- 既存の`bookApi.ts`、`useBook.ts`のパターンに沿うことで一貫性を保つ
- Issue #57のファイル構成指示に従う

## データフロー

### 戦闘（攻撃）

1. ユーザーが読んだページ数を入力
2. 「こうげき」ボタンをクリック
3. `useBattle.attack(pagesRead, memo?)` を呼び出し
4. `battleApi.recordBattle()` → `POST /books/:id/logs`
5. APIレスポンスを受け取り、状態を更新
6. HPバーが新しい値を反映

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                         | 種別 | 責務                         |
| ---------------------------------------------------------------- | ---- | ---------------------------- |
| `apps/web/src/pages/BattlePage.tsx`                              | 新規 | 戦闘画面ページ               |
| `apps/web/src/pages/BattlePage.module.css`                       | 新規 | 戦闘画面スタイル             |
| `apps/web/src/features/books/components/EnemyDisplay.tsx`        | 新規 | 敵（ドラゴン）表示           |
| `apps/web/src/features/books/components/EnemyDisplay.module.css` | 新規 | 敵表示スタイル               |
| `apps/web/src/features/books/components/HpBar.tsx`               | 新規 | HPバー（アニメーション対応） |
| `apps/web/src/features/books/components/HpBar.module.css`        | 新規 | HPバースタイル               |
| `apps/web/src/features/books/components/BattleInput.tsx`         | 新規 | 戦闘入力フォーム             |
| `apps/web/src/features/books/components/BattleInput.module.css`  | 新規 | 入力フォームスタイル         |
| `apps/web/src/features/books/hooks/useBattle.ts`                 | 新規 | 戦闘API呼び出しフック        |
| `apps/web/src/features/books/services/bookApi.ts`                | 変更 | recordBattle関数を追加       |
| `apps/web/src/features/books/utils/dragonRank.ts`                | 新規 | ドラゴンランク計算           |
| `apps/web/src/App.tsx`                                           | 変更 | battleページルーティング追加 |

### 主要コンポーネント

#### BattlePage

**責務**: 戦闘画面全体のレイアウトと状態管理

**インターフェース**:

```typescript
interface BattlePageProps {
  bookId: string;
  onBack: () => void;
  onDefeat: () => void;
}
```

#### EnemyDisplay

**責務**: 敵（ドラゴン）の表示（画像、タイトル、HPバー）

**インターフェース**:

```typescript
interface EnemyDisplayProps {
  title: string;
  currentHp: number;
  maxHp: number;
  rank: 1 | 2 | 3 | 4 | 5;
}
```

#### HpBar

**責務**: HPバーの表示（ProgressBarとは異なるHP専用スタイル）

**インターフェース**:

```typescript
interface HpBarProps {
  current: number;
  max: number;
}
```

#### BattleInput

**責務**: 読んだページ数とメモの入力フォーム

**インターフェース**:

```typescript
interface BattleInputProps {
  remainingPages: number;
  onAttack: (pagesRead: number, memo?: string) => void;
  disabled?: boolean;
}
```

#### useBattle

**責務**: 戦闘API呼び出しと状態管理

**インターフェース**:

```typescript
interface UseBattleResult {
  attack: (pagesRead: number, memo?: string) => Promise<RecordBattleResult>;
  isLoading: boolean;
  error: string | null;
}

function useBattle(bookId: string): UseBattleResult;
```

#### dragonRank

**責務**: ページ数からドラゴンランクを計算

**インターフェース**:

```typescript
function getDragonRank(totalPages: number): 1 | 2 | 3 | 4 | 5;
```

## テスト戦略

### ユニットテスト

- `dragonRank.ts`: 各閾値での正しいランク計算
- `HpBar`: current/maxに応じたバー幅表示
- `BattleInput`: バリデーション（1未満拒否、残りページ超過時の自動補正）
- `EnemyDisplay`: ランクに応じた表示
- `useBattle`: API呼び出しのモック

### 統合テスト（必要な場合）

- 既存の`POST /books/:id/logs`統合テストで担保済み

---

## エラーハンドリング

- API呼び出し失敗時: `error`状態に設定し、ユーザーにメッセージ表示
- ネットワークエラー: 「攻撃に失敗しました」メッセージ

## セキュリティ考慮事項

- 認証: 既存のFirebase Auth + Bearer tokenを使用
- 入力検証: pagesReadは1以上の整数、memoは1000文字以内（API側で検証済み）
