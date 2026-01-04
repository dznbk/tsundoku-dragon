# Firebase Auth連携

## 概要

APIに Firebase Auth 認証を導入し、`X-User-Id`ヘッダーによる一時認証を正式な認証に置き換える。

## 背景

- 現在は`X-User-Id`ヘッダーで開発用の一時認証を行っている
- 複数デバイスからのアクセスにはSNS認証が必要（設計決定済み）
- セキュリティ上、正式な認証なしでのデプロイは不可

## 要件

### 機能要件

- [ ] Firebase Auth の ID トークンを検証できる
- [ ] 認証が必要なエンドポイントを保護できる
- [ ] 認証済みユーザーのFirebase UIDを取得できる
- [ ] 未認証リクエストに401エラーを返す
- [ ] 無効なトークンに401エラーを返す

### 非機能要件

- Cloudflare Workers環境で動作すること
- レイテンシ: トークン検証は100ms以下
- firebase-admin SDKは使用不可（Workers非対応のため）

## 受け入れ条件

- [ ] 有効なIDトークン付きリクエストが認証を通過する
- [ ] 無効/期限切れトークンが401で拒否される
- [ ] Authorization ヘッダーなしのリクエストが401で拒否される
- [ ] 既存のBook APIが認証付きで動作する
- [ ] テストが全てパスする

## 対象外（スコープ外）

- フロントエンドでのFirebase Auth実装（別タスク）
- ユーザープロフィールのDynamoDB保存（別タスク）
- Twitter/Google認証の設定（Firebaseコンソールでの設定は手動）

## 参考ドキュメント

- [planning/data-design.md](../../planning/data-design.md) - USER#PROFILE設計
- [docs/CONTEXT.md](../../docs/CONTEXT.md) - 技術選定理由
