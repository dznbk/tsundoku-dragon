# 設計書

## 意思決定

### 採用した設計

BattlePage の状態遷移を管理し、各フェーズで適切なコンポーネントを表示する。

### 代替案との比較

| 案                           | メリット             | デメリット             | 採用 |
| ---------------------------- | -------------------- | ---------------------- | ---- |
| 状態マシン方式               | 明確な状態遷移       | 状態数が増えると複雑化 | ✓    |
| Promise チェーン             | 直感的な順次処理     | 中断が難しい           | -    |
| アニメーションライブラリ使用 | 高度なアニメーション | 追加依存、学習コスト   | -    |

### 選定理由

- 状態が明確に定義されており、各状態での表示・入力可否が判断しやすい
- 既存の BattlePage との統合が容易
- CSSアニメーションとの相性が良い

## データフロー

### 戦闘開始フロー

1. BattlePage がマウントされる
2. `transition` 状態で BattleTransition を表示
3. 書影表示（1秒） → クロスフェード（0.5秒） → ドラゴン表示
4. BattleTransition の onComplete で `idle` 状態に遷移
5. 通常の戦闘画面を表示

### 攻撃フロー

1. ユーザーが「こうげき」ボタンを押す
2. API 呼び出し → 成功時に `attacking` 状態に遷移
3. BattleMessage で攻撃メッセージを表示
4. メッセージ完了後に `animating` 状態に遷移
5. HpBar がアニメーション
6. アニメーション完了後に `idle` 状態に戻る（または `victory` 状態）

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                             | 種別 | 責務                             |
| -------------------------------------------------------------------- | ---- | -------------------------------- |
| `apps/web/src/features/books/components/BattleMessage.tsx`           | 新規 | タイピング風メッセージ表示       |
| `apps/web/src/features/books/components/BattleMessage.module.css`    | 新規 | BattleMessage のスタイル         |
| `apps/web/src/features/books/components/BattleTransition.tsx`        | 新規 | 書影→ドラゴン変化演出            |
| `apps/web/src/features/books/components/BattleTransition.module.css` | 新規 | BattleTransition のスタイル      |
| `apps/web/src/features/books/components/HpBar.tsx`                   | 変更 | アニメーション機能追加           |
| `apps/web/src/features/books/components/HpBar.module.css`            | 変更 | アニメーション用スタイル         |
| `apps/web/src/features/books/components/index.ts`                    | 変更 | 新規コンポーネントのエクスポート |
| `apps/web/src/pages/BattlePage.tsx`                                  | 変更 | 状態遷移管理の追加               |

### 主要コンポーネント

#### BattleMessage

**責務**: ドラクエ風のメッセージウィンドウを表示し、1文字ずつタイピング表示する

**インターフェース**:

```typescript
interface BattleMessageProps {
  messages: string[]; // 表示するメッセージ配列
  onComplete: () => void; // 全メッセージ表示完了時
  typingSpeed?: number; // 1文字あたりのms（デフォルト50）
  messageInterval?: number; // メッセージ間の待機ms（デフォルト1000）
}
```

#### BattleTransition

**責務**: 戦闘開始時に書影からドラゴンへのフェード遷移を表示する

**インターフェース**:

```typescript
interface BattleTransitionProps {
  isbn?: string; // 書影取得用ISBN（なければドラゴンのみ）
  rank: DragonRank; // ドラゴンランク（1-5）
  onComplete: () => void; // トランジション完了時
}
```

#### HpBar（拡張）

**責務**: HPバーの表示とアニメーション

**インターフェース**:

```typescript
interface HpBarProps {
  current: number;
  max: number;
  animateTo?: number; // この値に向かってアニメーション
  animationDuration?: number; // アニメーション時間(ms)
  onAnimationComplete?: () => void; // アニメーション完了時
}
```

### BattlePage の状態遷移

```typescript
type BattleState =
  | 'transition' // 書影→ドラゴン変化中
  | 'idle' // 入力待ち
  | 'attacking' // 攻撃メッセージ表示中
  | 'animating' // HPバーアニメーション中
  | 'victory'; // 討伐完了（#59で処理）
```

## テスト戦略

### ユニットテスト

- BattleMessage: メッセージが1文字ずつ表示される、複数メッセージの順次表示、onComplete コールバック
- BattleTransition: フェード遷移、ISBN なしの場合の動作、onComplete コールバック
- HpBar: アニメーション動作、onAnimationComplete コールバック

### 統合テスト（必要な場合）

- BattlePage の状態遷移が正しく動作すること

## メッセージ生成

```typescript
function generateAttackMessages(
  playerName: string, // ユーザー名 or 「あなた」
  bookTitle: string,
  damage: number
): string[] {
  return [
    `${playerName}のこうげき！`,
    `${bookTitle} に ${damage} のダメージ！`,
  ];
}
```
