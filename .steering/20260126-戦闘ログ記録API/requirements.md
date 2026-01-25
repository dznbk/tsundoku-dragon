# 戦闘ログ記録API

## 概要

読書の進捗を記録するAPI。本の currentPage を更新し、討伐時は status を completed に変更する。

## 背景

- ユーザーが読書した内容を記録する機能が必要
- 本を「敵（ドラゴン）」として討伐するゲーム性を実現するため、読んだページ数を「ダメージ」として記録する
- 全ページ読了時は「討伐完了」として status を completed に変更

## 要件

### 機能要件

- [x] `POST /books/:id/logs` エンドポイントを追加
- [x] リクエストボディで `pagesRead`（必須）と `memo`（任意）を受け取る
- [x] pagesRead が残りページ数を超えた場合、自動補正する
- [x] BattleLog を作成・保存する
- [x] Book の currentPage を更新する
- [x] currentPage == totalPages の場合、status を completed に変更する
- [x] 討伐したかどうか（defeat）をレスポンスに含める

### 非機能要件

- バリデーション: pagesRead は1以上の整数、memo は最大1000文字

## 受け入れ条件

- [x] 正常系: ログ記録、currentPage 更新が行える
- [x] 正常系: 討伐時に status が completed になる
- [x] 正常系: pagesRead が残りページを超えた場合、自動補正される
- [x] 異常系: 存在しない本は 404 を返す
- [x] 異常系: reading 以外の status は 400 を返す

## 対象外（スコープ外）

- 経験値計算・スキル更新ロジック（Issue #56 で対応）
- 戦闘画面UI（Issue #57 で対応）

## 参考ドキュメント

- [planning/data-design.md](../../../planning/data-design.md) - 戦闘ログのデータ構造
- [GitHub Issue #55](https://github.com/dznbk/tsundoku-dragon/issues/55)
