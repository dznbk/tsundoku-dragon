# SkillRepository の upsertUserSkillExp をアトミック更新に変更

## 概要

`SkillRepository.upsertUserSkillExp` の Read-Then-Write パターンを DynamoDB の `UpdateCommand` + `ADD` 式によるアトミック更新に変更し、並行リクエスト時の経験値ロストアップデートを防止する。

## 背景

- 現在の実装は GET → 計算 → PUT の Read-Then-Write パターン
- 並行リクエスト時に先の書き込みが後のリクエストで上書きされ、経験値が消失するリスクがある
- データ整合性に関わる問題であり、ユーザー体験に直接影響する

## 要件

### 機能要件

- [ ] `upsertUserSkillExp` が DynamoDB の `UpdateCommand` + `ADD` 式でアトミックに経験値を加算する
- [ ] 新規スキル（アイテムが存在しない場合）でも正しく動作する（ADD は属性が存在しない場合 0 から加算）
- [ ] 更新後の経験値から正しいレベルを計算し、保存する
- [ ] 戻り値の `UserSkillExp` インターフェースは変更しない（後方互換性維持）

### 非機能要件

- 並行リクエスト時に経験値のロストアップデートが発生しない

## 受け入れ条件

- [ ] `upsertUserSkillExp` 内で `GetCommand` + `PutCommand` の代わりに `UpdateCommand` + `ADD` を使用している
- [ ] ユニットテストがすべてパスする
- [ ] 統合テストがすべてパスする
- [ ] 既存の `BookService.recordBattle` の動作に影響がない

## 対象外（スコープ外）

- `BookService.updateSkillsExp` のリファクタリング（呼び出し側は変更しない）
- 他のリポジトリメソッドの変更
- `level` フィールドの並行更新の完全な原子性（exp が原子的であれば level は派生値として許容）

## 参考ドキュメント

- [planning/data-design.md](../../../planning/data-design.md) - DynamoDB スキーマ設計
- [planning/exp-system.md](../../../planning/exp-system.md) - 経験値・レベル計算式
- GitHub Issue: https://github.com/dznbk/tsundoku-dragon/issues/75
