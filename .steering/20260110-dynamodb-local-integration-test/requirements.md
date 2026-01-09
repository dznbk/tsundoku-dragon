# DynamoDB Local統合テスト環境の構築

## 概要

mockだけでは検証できないDynamoDB実動作を確認するため、DynamoDB Localを使った統合テスト環境を構築する。

## 背景

- 現在のテストは完全にmockベースで、実DB動作を検証できていない
- デトロイト派（本物を使えるなら本物を使う）の考え方に基づき、制御可能なDynamoDB Localを使った統合テスト層を追加する
- 統合テストにより、DynamoDBクエリの構文エラーやシリアライズ問題を早期発見できる

## 要件

### 機能要件

- [ ] DynamoDB Localを使ったテスト環境のセットアップヘルパーを提供
- [ ] 統合テスト専用のvitest設定ファイルを用意
- [ ] 既存のユニットテストから統合テストを分離
- [ ] テストデータのシード・クリーンアップユーティリティを提供
- [ ] npm scriptで簡単にDB起動・テスト実行ができる

### 非機能要件

- 既存のユニットテスト（`npm test`）に影響を与えない
- CI環境でも実行可能な構成にする
- 開発者が簡単にセットアップできる手順を提供

## 受け入れ条件

- [ ] `npm run db:setup`でDynamoDB Localとテーブルが準備できる
- [ ] `npm run test:integration`が実行できる（テストなしでも成功）
- [ ] `npm run test:all`でunit + integrationが両方実行できる
- [ ] 既存のunitテスト（`npm test`）で`*.integration.test.ts`が除外される

## 対象外（スコープ外）

- E2Eテスト環境の構築
- CI/CDパイプラインへの統合（今回はローカル実行のみ）
- 実際の統合テストケースの実装（環境構築のみ）

## 参考ドキュメント

- [docs/integration-testing.md](../../docs/integration-testing.md)
- [docs/development-guidelines.md](../../docs/development-guidelines.md)
- [planning/data-design.md](../../planning/data-design.md)
- GitHub Issue: https://github.com/dznbk/tsundoku-dragon/issues/21
