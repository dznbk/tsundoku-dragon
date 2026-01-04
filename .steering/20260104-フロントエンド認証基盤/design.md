# 設計書

## 意思決定

### 採用した設計

Feature-basedアーキテクチャに従い、`features/auth/` ディレクトリに認証関連のコードを配置する。認証状態管理にはReact Context APIを使用し、シンプルな構成を維持する。

### 代替案との比較

| 案          | メリット                     | デメリット               | 採用 |
| ----------- | ---------------------------- | ------------------------ | ---- |
| Context API | シンプル、追加ライブラリ不要 | 大規模になると複雑化     | ✓    |
| Zustand     | 軽量な状態管理               | 新規依存追加             | -    |
| Redux       | 大規模アプリ向け             | オーバーエンジニアリング | -    |

### 選定理由

- 開発ガイドラインに「状態管理は必要になるまで導入しない（useState/useContext優先）」とある
- 認証状態の管理は複雑ではなく、Context APIで十分対応可能
- 将来的に複雑化した場合に状態管理ライブラリを導入すればよい

## データフロー

### ログインフロー

1. ユーザーがログインボタンをクリック
2. Firebase Auth の signInWithPopup を呼び出し
3. Google認証画面でユーザーが認証
4. 認証成功後、AuthContext が状態を更新
5. 保護されたページへリダイレクト

### API呼び出しフロー

1. コンポーネントが apiClient を通じてAPIを呼び出し
2. apiClient が現在のユーザーのIDトークンを取得
3. Authorization ヘッダーにトークンを付与してリクエスト
4. バックエンドがトークンを検証してレスポンス

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                          | 種別 | 責務                    |
| ------------------------------------------------- | ---- | ----------------------- |
| `src/lib/firebase.ts`                             | 新規 | Firebase初期化          |
| `src/features/auth/contexts/AuthContext.tsx`      | 新規 | 認証状態管理            |
| `src/features/auth/hooks/useAuth.ts`              | 新規 | 認証操作フック          |
| `src/features/auth/components/LoginButton.tsx`    | 新規 | ログインボタン          |
| `src/features/auth/components/ProtectedRoute.tsx` | 新規 | ルート保護              |
| `src/features/auth/services/authApi.ts`           | 新規 | 認証付きAPIクライアント |
| `src/features/auth/index.ts`                      | 新規 | 公開API                 |
| `src/App.tsx`                                     | 変更 | AuthProviderでラップ    |
| `src/pages/LoginPage.tsx`                         | 新規 | ログイン画面            |

### 主要コンポーネント

#### AuthContext

**責務**: 認証状態のグローバル管理

**インターフェース**:

```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

#### useAuth

**責務**: AuthContextへのアクセスを提供するカスタムフック

**インターフェース**:

```typescript
function useAuth(): AuthContextValue;
```

#### ProtectedRoute

**責務**: 認証済みユーザーのみアクセス可能なルートを保護

**インターフェース**:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

#### authApi (apiClient)

**責務**: Firebase IDトークンを自動付与するAPIクライアント

**インターフェース**:

```typescript
interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
```

## テスト戦略

### ユニットテスト

- `useAuth`: ログイン/ログアウト操作のテスト
- `ProtectedRoute`: 認証状態に応じた表示切り替えのテスト
- `authApi`: トークン付与のテスト

### 統合テスト（必要な場合）

- ログインフロー全体のテスト（Firebase SDKのモック使用）

---

## 依存ライブラリ

| ライブラリ | バージョン | 用途         |
| ---------- | ---------- | ------------ |
| firebase   | ^11.x      | Firebase SDK |

## セキュリティ考慮事項

- Firebase設定値は `VITE_` プレフィックス付きの環境変数で管理
- IDトークンは `getIdToken()` で取得し、有効期限切れ時は自動更新
- トークンはローカルストレージには保存しない（Firebase SDKが管理）
