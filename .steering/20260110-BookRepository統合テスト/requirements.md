# BookRepositoryの統合テスト実装

## 概要

BookRepositoryの実DB動作を検証する統合テストを実装し、DynamoDBクエリの正確性とPK/SK設計の動作を保証する。

## 背景

- ユニットテストではmockを使用しているため、実際のDynamoDBクエリ構文が正しいか検証できない
- PK/SK設計やマーシャリング（データ型変換）の動作確認には実DBが必要
- Issue #21で構築したDynamoDB Local環境を活用してリポジトリ層の品質を担保する

## 要件

### 機能要件

- [x] `bookRepository.integration.test.ts` ファイルを作成
- [x] `save()` & `findById()` のラウンドトリップテスト
- [x] `findByUserId()` の複数件クエリテスト（begins_withクエリの実動作検証）
- [x] 空クエリ・エッジケーステスト（データなしユーザー、存在しないIDの処理）
- [x] afterAllでのデータクリーンアップ確認

### 非機能要件

- テスト実行時間が2-3秒以内
- 既存のユニットテストに影響を与えない

## 受け入れ条件

- [x] すべてのCRUD操作（save, findById, findByUserId）が実DBで正しく動作
- [x] テストデータが適切にクリーンアップされる
- [x] 既存のユニットテストに影響がない
- [x] テスト実行時間が許容範囲内

## 対象外（スコープ外）

- SkillRepositoryの統合テスト（別issueで対応）
- E2Eテスト
- パフォーマンステスト（負荷テスト）

## 参考ドキュメント

- [docs/integration-testing.md](../../docs/integration-testing.md) - 統合テストガイド
- [docs/development-guidelines.md](../../docs/development-guidelines.md) - 開発ガイドライン（mockの使用方針）
- GitHub Issue: https://github.com/dznbk/tsundoku-dragon/issues/22
