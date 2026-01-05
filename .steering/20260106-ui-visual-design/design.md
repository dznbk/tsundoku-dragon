# 設計書

## 意思決定

### 採用した設計

visual-design.mdの仕様をそのまま実装し、CSS Modulesで共通コンポーネントを作成する。

### 代替案との比較

| 案           | メリット                       | デメリット               | 採用 |
| ------------ | ------------------------------ | ------------------------ | ---- |
| CSS Modules  | スコープ自動化、学習コスト低   | 動的スタイルに若干の手間 | ✓    |
| Tailwind CSS | ユーティリティクラスで高速開発 | DQスタイルとの相性が悪い | -    |
| CSS-in-JS    | 動的スタイル対応               | ランタイムオーバーヘッド | -    |

### 選定理由

- ドラクエ風の独自スタイルが多いため、ユーティリティCSSの恩恵が薄い
- Viteで標準サポートされており追加依存なし
- visual-design.mdでもCSS Modulesを推奨

## コンポーネント設計

### 追加・変更するファイル

| ファイル                                      | 種別 | 責務                               |
| --------------------------------------------- | ---- | ---------------------------------- |
| `apps/web/index.html`                         | 変更 | Googleフォント読み込み追加         |
| `apps/web/src/index.css`                      | 変更 | CSS変数定義、グローバルスタイル    |
| `apps/web/src/components/DQWindow.tsx`        | 新規 | DQウィンドウコンポーネント         |
| `apps/web/src/components/DQWindow.module.css` | 新規 | DQウィンドウスタイル               |
| `apps/web/src/components/DQButton.tsx`        | 新規 | DQボタンコンポーネント             |
| `apps/web/src/components/DQButton.module.css` | 新規 | DQボタンスタイル                   |
| `apps/web/src/pages/LoginPage.tsx`            | 変更 | ロゴ配置、DQコンポーネント使用     |
| `apps/web/src/pages/LoginPage.module.css`     | 新規 | LoginPage用CSS Modules（置き換え） |
| `apps/web/src/pages/LoginPage.css`            | 削除 | 旧スタイル削除                     |
| `apps/web/src/App.tsx`                        | 変更 | ヘッダー改修、ロゴ配置             |
| `apps/web/src/App.module.css`                 | 新規 | App用CSS Modules（置き換え）       |
| `apps/web/src/App.css`                        | 削除 | 旧スタイル削除                     |

### 主要コンポーネント

#### DQWindow

**責務**: ドラクエ風のウィンドウ表示（カード、モーダル、メッセージ等に使用）

**インターフェース**:

```typescript
interface DQWindowProps {
  children: React.ReactNode;
  className?: string;
}
```

**スタイル**:

- 背景: 濃紺グラデーション（#1a2d4a → #0d1a2d）
- 枠線: 白 3px
- 角丸: 8px
- 内側余白: 16px

#### DQButton

**責務**: ドラクエ風のボタン表示

**インターフェース**:

```typescript
interface DQButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}
```

**スタイル**:

- DQウィンドウと同じグラデーション背景
- ホバー時に若干明るく
- フォーカス時にアウトライン表示

## CSS変数定義

```css
:root {
  /* カラーパレット */
  --color-bg-base: #0a0a0a;
  --color-bg-window-light: #1a2d4a;
  --color-bg-window-dark: #0d1a2d;
  --color-border: #ffffff;
  --color-text: #ffffff;
  --color-text-muted: #a0a0a0;
  --color-hp: #f39c12;
  --color-exp: #f1c40f;
  --color-success: #27ae60;
  --color-danger: #e74c3c;

  /* フォント */
  --font-main: 'Noto Sans JP', system-ui, sans-serif;
  --font-pixel: 'DotGothic16', monospace;
}
```

## テスト戦略

### ユニットテスト

- DQWindow: children が正しくレンダリングされることを確認
- DQButton: クリックイベントが発火することを確認

### 統合テスト

- LoginPage: DQコンポーネントが表示されること
- App: 認証後にホーム画面が表示されること
