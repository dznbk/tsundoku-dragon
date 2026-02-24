# 要件定義: BookService から戦闘ロジックを BattleService に分離

## 背景

GitHub Issue #77: `BookService` が CRUD、戦闘記録、経験値計算、スキル登録と複数の責務を持っており、285行と肥大化している。

## 要件

### 機能要件

1. **BattleService の新規作成**
   - `recordBattle` メソッド（戦闘記録、ダメージ計算、経験値付与）を `BookService` から移動
   - `updateSkillsExp` プライベートメソッド（スキル経験値更新）を移動
   - `getBookLogs` メソッド（戦闘ログ取得）を移動

2. **BookService のスリム化**
   - 書籍 CRUD に専念: `createBook`, `listBooks`, `getBook`, `updateBook`, `archiveBook`, `resetBook`
   - カスタムスキル自動登録 (`registerNewSkillsAsCustomSkills`) は書籍作成・更新に付随するため BookService に残す

3. **ルート層の変更**
   - `POST /books/:id/logs`（戦闘記録）→ `BattleService.recordBattle` を呼び出す
   - `GET /books/:id/logs`（ログ取得）→ `BattleService.getBookLogs` を呼び出す

### 非機能要件

- 外部 API・レスポンス形式に変更なし（破壊的変更なし）
- 既存テストが全てパスすること
- 型定義 (`SkillResult`, `RecordBattleResult`) は BattleService に移動

## スコープ外

- 新しいエンドポイントの追加
- フロントエンドの変更
- データベーススキーマの変更
