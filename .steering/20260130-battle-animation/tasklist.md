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

- 開始: 2026-01-30
- 完了: 2026-01-30

---

## フェーズ1: 新規コンポーネント作成

- [x] BattleMessage コンポーネントを実装する
  - [x] BattleMessage.tsx を作成（タイピング表示ロジック）
  - [x] BattleMessage.module.css を作成（DQWindow風スタイル）
  - [x] BattleMessage.test.tsx を作成
- [x] BattleTransition コンポーネントを実装する
  - [x] BattleTransition.tsx を作成（書影→ドラゴンフェード）
  - [x] BattleTransition.module.css を作成（フェードアニメーション）
  - [x] BattleTransition.test.tsx を作成

## フェーズ2: 既存コンポーネント拡張

- [x] HpBar にアニメーション機能を追加する
  - [x] HpBar.tsx に animateTo, animationDuration, onAnimationComplete props を追加
  - [~] HpBar.module.css にアニメーションスタイルを追加 (スキップ理由: 既存のCSS transitionで対応可能、JavaScriptでアニメーション制御)
  - [x] HpBar.test.tsx にアニメーションテストを追加

## フェーズ3: BattlePage 統合

- [x] BattlePage の状態遷移を実装する
  - [x] BattleState 型を定義
  - [x] 状態管理ロジックを追加（useState）
  - [x] transition 状態で BattleTransition を表示
  - [x] attacking 状態で BattleMessage を表示
  - [x] animating 状態で HpBar アニメーションを実行
- [x] index.ts に新規コンポーネントのエクスポートを追加

## フェーズ4: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 状態マシン方式（BattleState）により、各状態での表示・操作可否が明確に管理できた
- 既存のDQWindowコンポーネントを活用し、デザインの一貫性を保てた
- タイピングエフェクト、フェードアニメーション、HPバーアニメーションの3つの演出を統合できた
- requestAnimationFrameを使用したスムーズなHPバーアニメーションを実現
- テストでタイマーモックを使用し、時間依存のテストを確実に行えた

### 改善点

- HpBarのアニメーションテストでrequestAnimationFrameのモックが複雑だった
  - 最終的にリアルタイマー + waitForで解決したが、fake timerとの組み合わせをもっと調べておくべきだった

### 次回への学び

- アニメーション関連のテストでは、fake timerとrequestAnimationFrameの組み合わせに注意が必要
- 状態遷移が複雑になる場合は、最初に状態図を描いてから実装すると良い
- 演出のタイミング（duration）は定数として切り出しておくと調整しやすい

### 将来の改善提案（#59以降で検討）

- メッセージスキップ機能の追加（クリックで即完了）
- アニメーション速度のユーザー設定
- 画像読み込みエラー時のフォールバック強化
