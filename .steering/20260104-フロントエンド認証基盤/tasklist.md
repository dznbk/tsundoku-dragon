# タスクリスト

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

## フェーズ1: 基盤セットアップ

- [x] Firebase SDKのインストール (`firebase` パッケージ)
- [x] Firebase初期化ファイルの作成 (`src/lib/firebase.ts`)
- [x] 環境変数の型定義 (`src/vite-env.d.ts` の拡張)

## フェーズ2: 認証コンテキスト

- [x] AuthContext の作成 (`src/features/auth/contexts/AuthContext.tsx`)
- [x] useAuth フックの作成 (`src/features/auth/hooks/useAuth.ts`)
- [x] AuthProvider を App.tsx に統合

## フェーズ3: 認証UI

- [x] LoginButton コンポーネントの作成
- [x] LoginPage の作成 (`src/pages/LoginPage.tsx`)
- [x] ProtectedRoute コンポーネントの作成

## フェーズ4: APIクライアント

- [x] 認証付きAPIクライアントの作成 (`src/features/auth/services/authApi.ts`)
- [x] features/auth の公開API整理 (`src/features/auth/index.ts`)

## フェーズ5: テスト

- [x] AuthContext のテスト
- [x] useAuth フックのテスト
- [x] ProtectedRoute のテスト
- [x] authApi のテスト

## フェーズ6: 品質チェック

- [x] テストが通ることを確認 (`npm test`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)

---

## 振り返り

### うまくいったこと

- Feature-based構造に沿った認証モジュールの整理
- vi.hoistedを使用したVitestモックの適切な実装
- Context APIによるシンプルな認証状態管理
- 17テストすべて成功（100%パス）

### 改善点

- TypeScript `erasableSyntaxOnly` オプションへの対応（パラメータプロパティは使用不可）
- テスト作成時のvi.mockホイスティング問題の事前考慮が必要

### 次回への学び

- Vitestでモック変数を参照する場合は`vi.hoisted()`を使用
- `erasableSyntaxOnly: true`の環境ではクラスのパラメータプロパティを避ける
- React Router導入前はシンプルな条件分岐で画面切り替えを実装し、後から拡張

### 申し送り事項

- Twitter認証はMVP後に対応予定（requirements.mdでスコープ外として定義）
- LoginButtonのテストは追加推奨（現在はProtectedRouteとAuthContextでカバー）
- ローディングスピナーの共通コンポーネント化は将来検討
