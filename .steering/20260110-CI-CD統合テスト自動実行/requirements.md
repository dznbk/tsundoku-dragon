# CI/CDでの統合テスト自動実行

## 概要

GitHub ActionsでDynamoDB Localを起動し、統合テストを自動実行することでPR時の品質を担保する。

## 背景

- Issue #21（統合テスト環境の構築）、Issue #22（BookRepositoryの統合テスト実装）が完了済み
- ローカルでは統合テストが実行可能だが、CI環境での自動実行が未設定
- PRマージ前に統合テストを自動実行することで、データベース連携部分の品質を担保したい

## 要件

### 機能要件

- [ ] `.github/workflows/ci.yml`に`integration-test`ジョブを追加
- [ ] GitHub Actions servicesでDynamoDB Localを起動
  - ヘルスチェック設定
  - ポート8000でサービス公開
- [ ] テーブル作成の自動化
  - `npx tsx scripts/create-table.ts --local --test`実行
  - 環境変数設定（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY）
- [ ] CI環境での統合テスト実行
  - DYNAMODB_ENDPOINT=http://localhost:8000設定
  - `npm run test:integration`実行

### 非機能要件

- 実行時間が2分以内
- フレイキーなテストがない（安定して成功する）

## 受け入れ条件

- [ ] PR作成時に統合テストが自動実行される
- [ ] 統合テストが失敗したらマージがブロックされる
- [ ] 実行時間が2分以内
- [ ] 3回連続で成功する（フレイキーでない）

## 対象外（スコープ外）

- E2Eテストの追加
- 本番環境へのデプロイ自動化
- テストカバレッジの計測

## 参考ドキュメント

- [docs/integration-testing.md](../../docs/integration-testing.md)
- [GitHub Issue #23](https://github.com/dznbk/tsundoku-dragon/issues/23)
