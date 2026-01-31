# 設計書

## 意思決定

### 採用した設計

BattleMessage コンポーネントを再利用し、VictoryScreen コンポーネントで状態管理・メッセージ生成を行う。

### 代替案との比較

| 案                                     | メリット                   | デメリット               | 採用 |
| -------------------------------------- | -------------------------- | ------------------------ | ---- |
| BattleMessage を再利用                 | コード再利用、一貫した演出 | -                        | ✓    |
| VictoryScreen 内で独自のメッセージ実装 | 完全なカスタマイズ可能     | 重複コード、保守コスト増 | -    |

### 選定理由

- BattleMessage はタイピングエフェクト付きメッセージ表示を提供
- 同じピクセルフォント・DQWindow スタイルを使用するため、一貫したUI
- 既にテスト済みのコンポーネントを再利用することでバグリスク低減

## データフロー

### 討伐演出フロー

1. BattlePage が victory 状態になり、battleResult を保持
2. VictoryScreen に props として結果データを渡す
3. VictoryScreen がメッセージを生成し、BattleMessage で順番に表示
4. 全メッセージ完了後、「ホームへもどる」ボタンを表示
5. ボタンクリックで onGoHome コールバックを実行

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                          | 種別 | 責務                                  |
| ----------------------------------------------------------------- | ---- | ------------------------------------- |
| `apps/web/src/features/books/components/VictoryScreen.tsx`        | 新規 | 討伐演出画面コンポーネント            |
| `apps/web/src/features/books/components/VictoryScreen.module.css` | 新規 | VictoryScreen のスタイル              |
| `apps/web/src/features/books/components/VictoryScreen.test.tsx`   | 新規 | VictoryScreen のユニットテスト        |
| `apps/web/src/features/books/components/index.ts`                 | 変更 | VictoryScreen のエクスポート追加      |
| `apps/web/src/pages/BattlePage.tsx`                               | 変更 | victory 状態時に VictoryScreen を表示 |

### 主要コンポーネント

#### VictoryScreen

**責務**: 討伐時の演出（メッセージ表示・ボタン表示）を管理

**インターフェース**:

```typescript
interface VictoryScreenProps {
  bookTitle: string;
  expGained: number;
  defeatBonus: number;
  skillResults: SkillResult[];
  onGoHome: () => void;
}

interface SkillResult {
  skillName: string;
  expGained: number;
  previousLevel: number;
  currentLevel: number;
  currentExp: number;
  leveledUp: boolean;
}

// 内部状態
type VictoryState =
  | 'defeat' // 「たおした！」表示中
  | 'exp' // 経験値表示中
  | 'levelup' // レベルアップ表示中
  | 'complete'; // 全演出完了、ボタン表示
```

**メッセージ生成ロジック**:

```typescript
function generateVictoryMessages(
  bookTitle: string,
  expGained: number,
  defeatBonus: number,
  skillResults: SkillResult[]
): string[] {
  const messages: string[] = [
    `${bookTitle} を たおした！`,
    `けいけんち ${expGained} ポイント かくとく！`,
  ];

  if (defeatBonus > 0) {
    messages.push(`とうばつボーナス ${defeatBonus} ポイント！`);
  }

  const leveledUpSkills = skillResults.filter((s) => s.leveledUp);
  for (const skill of leveledUpSkills) {
    messages.push(
      `スキル『${skill.skillName}』が レベル${skill.currentLevel} に あがった！`
    );
  }

  return messages;
}
```

## テスト戦略

### ユニットテスト

- VictoryScreen: 討伐メッセージが表示される
- VictoryScreen: 経験値が正しく表示される
- VictoryScreen: 討伐ボーナスがある場合のみボーナスメッセージが表示される
- VictoryScreen: レベルアップしたスキルが全て表示される
- VictoryScreen: 複数スキルがレベルアップした場合、順番に表示される
- VictoryScreen: 全演出完了後に「ホームへもどる」ボタンが表示される
- VictoryScreen: ボタンクリックで onGoHome が呼ばれる
