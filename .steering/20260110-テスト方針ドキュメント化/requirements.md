# テスト方針のドキュメント化（mockの使用方針）

## 概要

mockの使用方針と統合テストの位置づけを明確化し、チーム全体でテスト方針を共有するためのドキュメントを作成する。

## 背景

- 現在、テストの基本方針（Googleテストサイズ基準）は記載されているが、mockの使用判断基準が明文化されていない
- デトロイト派（本物を使えるなら使うべき）の考え方を文書化する必要がある
- 統合テストの実行方法やデバッグ方法が明記されていない

## 要件

### 機能要件

- [x] `docs/development-guidelines.md`に「mockの使用方針」セクションを追加
  - デトロイト派の基本原則
  - レイヤー別のmock/実物使い分け表
  - 判断基準（制御可能性、コスト）
- [x] `docs/integration-testing.md`を新規作成
  - 統合テストの目的と重要性
  - Unit vs Integration vs E2Eの使い分け
  - ローカル実行方法
  - デバッグ方法
  - テストデータ管理のベストプラクティス
- [x] DynamoDB Localの制限事項を文書化
  - TTL、Streams、Global Tables等の非対応機能

### 非機能要件

- ドキュメントは日本語で記述
- 既存のドキュメント構成に合わせた形式

## 受け入れ条件

- [x] 新規参加者がテスト方針を理解できる
- [x] ローカルでの統合テスト実行手順が明確
- [x] デバッグ方法が記載されている
- [x] DynamoDB Localの制限事項が明記されている

## 対象外（スコープ外）

- 実際のテストコードの作成・修正
- CI/CDパイプラインの変更
- DynamoDB Localのセットアップスクリプト作成

## 参考ドキュメント

- [docs/development-guidelines.md](../../docs/development-guidelines.md) - 既存の開発ガイドライン
- [GitHub Issue #24](https://github.com/dznbk/tsundoku-dragon/issues/24)
