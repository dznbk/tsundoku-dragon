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

- 開始: 2026-01-28
- 完了: 2026-01-28

---

## フェーズ1: 経験値計算ユーティリティ

- [x] `apps/api/src/lib/expCalculator.ts` を作成
  - [x] `expForLevel(level)` - 指定レベルに必要な経験値
  - [x] `levelFromExp(totalExp)` - 累計経験値からレベル計算
  - [x] `defeatBonus(totalPages)` - 討伐ボーナス計算
- [x] `apps/api/src/lib/expCalculator.test.ts` を作成
  - [x] `expForLevel` のテスト（境界値: 1, 2）
  - [x] `levelFromExp` のテスト（境界値: 0, 49, 50）
  - [x] `defeatBonus` のテスト（350, 99）

## フェーズ2: SkillRepository 拡張

- [x] `SkillRepository.upsertUserSkillExp` メソッドを追加
  - [x] 既存レコードがあれば exp 加算、level 再計算
  - [x] 存在しなければ新規作成（exp=加算値, level=計算値）
- [x] `skillRepository.test.ts` に upsertUserSkillExp のテストを追加

## フェーズ3: BookService.recordBattle 拡張

- [x] `RecordBattleResult` インターフェースを拡張
  - [x] `SkillResult` インターフェースを定義
  - [x] `expGained`, `defeatBonus`, `skillResults` を追加
- [x] `recordBattle` メソッドに経験値ロジックを追加
  - [x] 経験値計算（baseExp + 討伐ボーナス）
  - [x] 各スキルへの経験値付与（並列処理）
  - [x] レスポンス構築
- [x] `bookService.test.ts` に経験値関連のテストを追加
  - [x] 経験値が各スキルに付与される
  - [x] 討伐時にボーナスが加算される
  - [x] レベルアップが正しく検出される
  - [x] 複数スキルが同時にレベルアップする場合
  - [x] スキルがない本の場合

## フェーズ4: 統合テスト

- [x] `skillRepository.integration.test.ts` を作成
  - [x] `upsertUserSkillExp` が新規作成できる
  - [x] `upsertUserSkillExp` が既存レコードを更新できる

## フェーズ5: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 経験値計算ロジックを純粋関数として分離したことで、テストが書きやすく、再利用性も高い設計になった
- Issue #56 の仕様が明確だったため、実装がスムーズに進んだ
- 並列処理を活用して複数スキルの経験値更新を効率化できた
- 統合テストも含めて全テストがパスし、品質を担保できた

### 改善点

- `SkillResult` 型を shared パッケージに移動することで、フロントエンドとの型共有がより容易になる（将来の課題）
- `upsertUserSkillExp` の戻り値に previousExp を含めれば、DB呼び出しを1回減らせる可能性がある

### 次回への学び

- 経験値システムのような計算ロジックは、早い段階で純粋関数として切り出すと、テストカバレッジを高めやすい
- フェーズを細かく分けてタスクリストを作成したことで、進捗が可視化され、作業がスムーズだった
- Issue に詳細な仕様（計算式、テスト観点）が書かれていると、実装者は迷わず作業を進められる
