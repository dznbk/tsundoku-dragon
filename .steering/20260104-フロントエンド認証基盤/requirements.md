# フロントエンド認証基盤

## 概要

Firebase Authを使用したフロントエンドの認証基盤を構築し、ログイン/ログアウト機能と認証状態管理を実装する。

## 背景

- バックエンドにはFirebase Auth認証ミドルウェアが既に実装済み
- フロントエンドからAPIを呼び出す際にFirebase IDトークンを付与する必要がある
- ユーザーの認証状態に応じた画面制御が必要

## 要件

### 機能要件

- [ ] Firebase SDKの初期化
- [ ] Google認証でのログイン/ログアウト
- [ ] 認証状態の管理（Context API）
- [ ] 認証済みユーザーのみアクセス可能なルート保護
- [ ] API呼び出し時にIDトークンを自動付与

### 非機能要件

- セキュリティ: Firebase設定は環境変数で管理
- UX: ローディング状態の適切な表示
- 保守性: 既存のリポジトリ構造に従った実装

## 受け入れ条件

- [ ] Googleアカウントでログインできる
- [ ] ログイン状態がリロード後も維持される
- [ ] ログアウトできる
- [ ] 未認証時はログイン画面にリダイレクトされる
- [ ] 認証済みAPIへのリクエストにIDトークンが付与される
- [ ] 全てのテストが通る

## 対象外（スコープ外）

- Twitter認証（MVPではGoogle認証のみ）
- パスワード認証
- ログイン画面のデザイン（最小限のUI）
- ルーティングライブラリの導入（将来対応）

## 参考ドキュメント

- [planning/screen-design.md](../../planning/screen-design.md) - ログイン画面の設計
- [docs/development-guidelines.md](../../docs/development-guidelines.md) - 開発ガイドライン
- [docs/repository-structure.md](../../docs/repository-structure.md) - リポジトリ構造
