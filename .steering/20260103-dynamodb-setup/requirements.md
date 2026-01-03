# DynamoDB接続基盤

## 概要

Cloudflare WorkersからDynamoDBに接続するための基盤を構築する。

## 背景

- 本アプリのデータ永続化にDynamoDBを使用する
- ローカル開発環境とAWS本番環境の両方で動作させる必要がある
- CONTEXT.mdの「次にやること」でDynamoDB接続が挙げられている

## 要件

### 機能要件

- [ ] ローカル開発時はDynamoDB Local（Docker）に接続できる
- [ ] 本番環境ではAWS DynamoDBに接続できる
- [ ] 環境変数で接続先を切り替えられる
- [ ] シングルテーブル設計に基づくテーブルを作成できる

### 非機能要件

- AWS無料枠内で運用（プロビジョンドモード 5 RCU / 5 WCU）
- 認証情報はコードにハードコードしない

## 受け入れ条件

- [ ] `docker compose up` でDynamoDB Localが起動する
- [ ] `wrangler dev` でAPIがDynamoDB Localに接続できる
- [ ] `/db/health` エンドポイントで接続確認ができる

## 対象外（スコープ外）

- 本番環境へのデプロイ（シークレット設定のみ記載）
- CRUD APIの実装（次のタスク）
- Firebase Auth連携

## 参考ドキュメント

- [planning/data-design.md](../../planning/data-design.md) - DynamoDBスキーマ設計
- [docs/CONTEXT.md](../../docs/CONTEXT.md) - 技術スタック・進捗
