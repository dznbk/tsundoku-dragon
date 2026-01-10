# 設計書

## 意思決定

### 採用した設計

ダークテーマのGoogleログインボタンを採用し、プロジェクトのダークモードUIと調和させる。

### 代替案との比較

| 案                          | メリット                                       | デメリット                       | 採用 |
| --------------------------- | ---------------------------------------------- | -------------------------------- | ---- |
| ダークテーマ（#131314背景） | プロジェクトのダークモードUIと調和、視認性良好 | ライトテーマより目立たない可能性 | ✓    |
| ライトテーマ（#FFFFFF背景） | 高コントラストで目立つ                         | ダークモードUIから浮いてしまう   | -    |
| ニュートラル（#F2F2F2背景） | 中間的な存在感                                 | ダークモードとの相性が悪い       | -    |

### 選定理由

- プロジェクトはダークモード一択（visual-design.md参照）
- ダークテーマボタンならページ全体の統一感を維持しつつ、ガイドライン準拠が可能
- 「G」ロゴは標準カラー版を白背景の円形領域に配置（ガイドライン準拠）

## データフロー

### ログイン操作

1. ユーザーがGoogleログインボタンをクリック
2. ボタンがローディング状態に変化
3. Firebase Authの`signInWithGoogle()`を呼び出し
4. 成功：ホーム画面へリダイレクト / 失敗：エラーメッセージ表示

（既存フローと変更なし）

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                                             | 種別 | 責務                                   |
| -------------------------------------------------------------------- | ---- | -------------------------------------- |
| `apps/web/public/assets/google-g-logo.svg`                           | 新規 | Google公式「G」ロゴ                    |
| `apps/web/src/features/auth/components/GoogleLoginButton.tsx`        | 新規 | ガイドライン準拠のGoogleログインボタン |
| `apps/web/src/features/auth/components/GoogleLoginButton.module.css` | 新規 | Googleボタン専用スタイル               |
| `apps/web/src/pages/LoginPage.tsx`                                   | 変更 | LoginButtonをGoogleLoginButtonに置換   |
| `apps/web/src/features/auth/components/LoginButton.tsx`              | 削除 | 不要になるため削除                     |
| `apps/web/src/features/auth/components/LoginButton.module.css`       | 削除 | 不要になるため削除                     |
| `apps/web/src/pages/LoginPage.module.css`                            | 変更 | loginButtonスタイルを削除              |

### 主要コンポーネント

#### GoogleLoginButton

**責務**: Googleブランドガイドライン準拠のログインボタンを表示し、Firebase Auth経由でGoogleログインを実行する

**インターフェース**:

```typescript
interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({
  className,
}: GoogleLoginButtonProps): JSX.Element;
```

**スタイル仕様**（ダークテーマ）:

```css
/* Google公式ガイドラインに基づくダークテーマ */
.button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #131314;
  border: 1px solid #8e918f;
  border-radius: 4px; /* 矩形ボタン */
  padding: 10px 12px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #e3e3e3;
}

.logoContainer {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 18px;
  height: 18px;
}
```

## テスト戦略

### ユニットテスト

- GoogleLoginButton: ボタンクリック時にsignInWithGoogleが呼ばれることを確認
- GoogleLoginButton: ローディング中は「ログイン中...」表示、ボタン無効化
- GoogleLoginButton: エラー時にエラーメッセージが表示される

### 既存テストの更新

- LoginPage関連のテストでimportパスを更新

---

## 依存ライブラリ

### フォント追加

Google推奨フォント「Roboto」をボタンに使用。プロジェクト全体では引き続き「Noto Sans JP」を使用。

```html
<!-- index.htmlに追加 -->
<link
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
  rel="stylesheet"
/>
```

### アセット

Google公式「G」ロゴSVGを取得し、`public/assets/`に配置。
