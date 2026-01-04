# タスクリスト: Firebase Auth連携

## タスク完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール

- 全てのタスクを `[x]` にすること
- 未完了タスク `[ ]` を残したまま作業を終了しない
- 「時間の都合」「難しい」などの理由でのスキップは禁止

### スキップが許可されるケース

技術的理由に該当する場合のみ:

- 実装方針の変更により機能自体が不要になった
- アーキテクチャ変更により別の実装方法に置き換わった

スキップ時は理由を明記:

```markdown
- [~] タスク名 (スキップ理由: 具体的な技術的理由)
```

---

## 進捗

- 開始: 2026-01-04
- 完了: 2026-01-04

---

## フェーズ1: 依存関係とセットアップ

- [x] @hono/firebase-auth パッケージをインストール
- [x] wrangler.toml に環境変数を追加（FIREBASE_PROJECT_ID）
- [x] wrangler.toml に KV namespace バインディングを追加

## フェーズ2: 認証ミドルウェア実装

- [x] Env型を拡張（FIREBASE_PROJECT_ID, KV関連）
- [x] apps/api/src/middleware/auth.ts を作成
- [x] index.ts に認証ミドルウェアを適用
- [x] 認証不要エンドポイント（/, /health, /db/health）を除外

## フェーズ3: 既存APIの修正

- [x] books.ts の getUserId を認証トークンから取得するよう修正
- [x] X-User-Id ヘッダーによる一時認証を削除

## フェーズ4: テスト

- [x] auth.ts のユニットテストを作成
- [x] books.ts のテストを認証対応に修正
- [x] 全テストがパスすることを確認

## フェーズ5: 品質チェック

- [x] テストが通ることを確認 (`npm test`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)

---

## 振り返り

### うまくいったこと

- `@hono/firebase-auth`パッケージでHonoとの統合がスムーズだった
- 既存のLayered Architectureにmiddleware層を自然に追加できた
- テストのモック設計がシンプルで、認証をモックしやすかった

### 改善点

- `getAuthUserId`で汎用`Error`をthrowしている → `HTTPException`使用を推奨
- 認証失敗時のテストケースが不足

### 次回への学び

- Cloudflare WorkersでFirebase Authを使う場合、`@hono/firebase-auth`が最も統合しやすい
- KV NamespaceのIDはデプロイ前に`wrangler kv:namespace create`で取得が必要
- 環境変数は型定義（Env型）に追加することで型安全性を確保
