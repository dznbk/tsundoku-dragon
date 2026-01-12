# カスタムスキル自動登録のN+1問題解消

## 概要

本登録時のカスタムスキル自動登録処理におけるN+1問題を解消し、DB呼び出し回数を削減する。

## 背景

- PR #32 で実装したカスタムスキル自動登録機能において、スキルごとにDynamoDB呼び出しが発生
- 最悪ケース: スキル数 × 3回のDB呼び出し（例: 5スキル登録時に最大15回）
- パフォーマンス改善の余地がある

### 現状の問題コード（bookService.ts:40-59）

```typescript
for (const skillName of skills) {
  const isGlobal = await this.skillRepository.hasGlobalSkill(skillName); // 呼び出し1
  if (isGlobal) continue;
  const isCustom = await this.skillRepository.hasUserCustomSkill(
    userId,
    skillName
  ); // 呼び出し2
  if (isCustom) continue;
  await this.skillRepository.saveUserCustomSkill(userId, skillName); // 呼び出し3
}
```

## 要件

### 機能要件

- [x] グローバルスキルとカスタムスキルの存在チェックを一括取得方式に変更
- [x] 新規スキルの保存を並列実行に変更
- [x] 既存の機能（本登録時のスキル自動登録）の動作を維持

### 非機能要件

- DB読み込み回数を固定2回に削減（スキル数に依存しない）
- DB書き込みは並列実行で効率化

## 受け入れ条件

- [x] 改善後のDB呼び出しパターンが実現されている
  - 読み込み: 2回（グローバルスキル一括 + カスタムスキル一括）
  - 書き込み: 新規スキル数分（並列実行）
- [x] 既存のテストがすべてパスする
- [x] 新しい一括取得ロジックに対応したテストが追加されている
- [x] API変更なし（後方互換性維持）

## 対象外（スコープ外）

- フロントエンド側の変更
- グローバルスキルが大量（1000件以上）になった場合の最適化
  - 現状29件、管理者が手動追加のため数百件程度に収まる想定

## 参考

- GitHub Issue: https://github.com/dznbk/tsundoku-dragon/issues/34
- 関連PR: #32
