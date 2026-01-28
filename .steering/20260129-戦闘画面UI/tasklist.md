# タスクリスト

## タスク完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール

- 全てのタスクを `[x]` にすること
- 未完了タスク `[ ]` を残したまま作業を終了しない
- 「時間の都合」「難しい」などの理由でのスキップは禁止

### スキップが許可されるケース

技術的理由に該当する場合のみ:

- 実装方針の変更により機能自体が不要になった
- アーキテクチャ変更により別の実装方法に置き換わった

スキップ時は理由を明記:

```markdown
- [~] タスク名 (スキップ理由: 具体的な技術的理由)
```

---

## 進捗

- 開始: 2026-01-29
- 完了: 2026-01-29

---

## フェーズ1: ユーティリティ・API層

- [x] dragonRank ユーティリティを実装（`apps/web/src/features/books/utils/dragonRank.ts`）
- [x] dragonRank のユニットテストを実装
- [x] recordBattle 関数を bookApi.ts に追加
- [x] useBattle フックを実装（`apps/web/src/features/books/hooks/useBattle.ts`）

## フェーズ2: UIコンポーネント

- [x] HpBar コンポーネントを実装（`apps/web/src/features/books/components/HpBar.tsx`）
- [x] HpBar のスタイルを実装（`HpBar.module.css`）
- [x] HpBar のユニットテストを実装
- [x] EnemyDisplay コンポーネントを実装（`apps/web/src/features/books/components/EnemyDisplay.tsx`）
- [x] EnemyDisplay のスタイルを実装（`EnemyDisplay.module.css`）
- [x] EnemyDisplay のユニットテストを実装
- [x] BattleInput コンポーネントを実装（`apps/web/src/features/books/components/BattleInput.tsx`）
- [x] BattleInput のスタイルを実装（`BattleInput.module.css`）
- [x] BattleInput のユニットテストを実装

## フェーズ3: ページ統合

- [x] BattlePage を実装（`apps/web/src/pages/BattlePage.tsx`）
- [x] BattlePage のスタイルを実装（`BattlePage.module.css`）
- [x] App.tsx に battle ページのルーティングを追加
- [x] コンポーネントの export を index.ts に追加

## フェーズ4: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- Issue #57の詳細な仕様に従い、予定通りの構成で実装できた
- 既存の`useBook`や`bookApi`のパターンを踏襲し、一貫性のあるコードを維持できた
- アクセシビリティ（aria属性、キーボード操作）を最初から意識して実装した
- visual-design.mdに準拠したドラクエ風のUIを実現した
- テストを網羅的に実装し、エッジケースもカバーした

### 改善点

- HpBarの`current`プロパティ名が「読んだページ数」であることが分かりにくいかもしれない（ドキュメントコメントで補足済み）

### 次回への学び

- Issue仕様が詳細であるほど、実装がスムーズに進む
- ドラゴン画像は仮の絵文字で実装し、将来のAI生成素材に置き換え可能な構造にしておく
- 戦闘演出（アニメーション、メッセージ）は #58 で対応予定
