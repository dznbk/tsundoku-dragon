# ビジュアルデザイン仕様

## 概要

本ドキュメントでは、積読＆ドラゴンズのビジュアルデザイン方針を定義する。
画面構成・機能については [screen-design.md](./screen-design.md) を参照。

---

## デザインコンセプト

**SFC時代のRPG風（ドラクエ系）**

- スーパーファミコン時代のRPG（ドラクエ5,6、FF4-6、クロノトリガー等）を参考にしたUI
- 見た目からワクワク感を演出し、読書をゲームとして楽しめる体験を提供
- 日常的に使う読書管理アプリとしての使いやすさも両立

### 参考にするゲームUI

- ドラゴンクエストシリーズ（SFC版）
  - 黒〜濃紺のウィンドウ背景
  - 白い枠線
  - シンプルで視認性の高いレイアウト

---

## カラーモード

**ダークモード一択**

SFC時代のRPGは基本的に黒背景であり、RPG感を徹底するためダークモードのみをサポートする。

---

## カラーパレット

| 用途                 | 色名       | HEX       | 備考                       |
| -------------------- | ---------- | --------- | -------------------------- |
| 背景（ベース）       | 黒         | `#0a0a0a` | 最も暗い背景色             |
| ウィンドウ背景（上） | 濃紺（明） | `#1a2d4a` | グラデーションの明るい側   |
| ウィンドウ背景（下） | 濃紺（暗） | `#0d1a2d` | グラデーションの暗い側     |
| ウィンドウ枠         | 白         | `#ffffff` | ウィンドウの外枠           |
| テキスト（通常）     | 白         | `#ffffff` | メインのテキスト色         |
| テキスト（薄）       | グレー     | `#a0a0a0` | 補助的なテキスト、無効状態 |
| HP / ダメージ        | オレンジ   | `#f39c12` | HPバー、与ダメージ表示     |
| 経験値 / レベル      | 黄色       | `#f1c40f` | 経験値バー、レベル表示     |
| 回復 / 成功          | 緑         | `#27ae60` | 成功メッセージ、回復表示   |
| 危険 / 警告          | 赤         | `#e74c3c` | エラー、警告、HP低下       |

### AI生成時のカラー指示

素材をAI生成する際は、上記のカラーパレットを指定すること。
例: 「背景色 #0a0a0a、アクセント色 #f39c12 のSFC風ドラゴンイラスト」

---

## ウィンドウスタイル

ドラクエ風のウィンドウデザインを基本コンポーネントとする。

### 特徴

- **形状**: 角丸の四角形（border-radius: 8px程度）
- **外枠**: 白（#ffffff）、2〜3pxの太さ
- **背景**: 濃紺のグラデーション（上: #1a2d4a → 下: #0d1a2d）
- **内側余白**: 16px程度

### CSS実装例

```css
.dq-window {
  background: linear-gradient(180deg, #1a2d4a 0%, #0d1a2d 100%);
  border: 3px solid #ffffff;
  border-radius: 8px;
  padding: 16px;
  color: #ffffff;
}
```

### 適用箇所

- カード（本カード、スキルカード）
- モーダル
- 入力フォーム
- メッセージウィンドウ
- ステータス表示

---

## フォント

### 通常UI

読みやすさを優先し、ゴシック体を使用。

**推奨フォント:**

- Noto Sans JP（Google Fonts）
- システムフォントフォールバック

```css
font-family: 'Noto Sans JP', system-ui, sans-serif;
```

### 演出時（戦闘メッセージ等）

RPG感を強調するため、ピクセルフォントを使用。

**推奨フォント:**

- DotGothic16（Google Fonts）

```css
font-family: 'DotGothic16', monospace;
```

### 適用ルール

| 場面                       | フォント     |
| -------------------------- | ------------ |
| 通常のUI（ナビ、ラベル等） | Noto Sans JP |
| 本文テキスト               | Noto Sans JP |
| 戦闘メッセージウィンドウ   | DotGothic16  |
| ダメージ表示               | DotGothic16  |
| レベルアップ通知           | DotGothic16  |

---

## レスポンシブ対応

**モバイルファースト**

スマホでの読書記録を主な利用シーンと想定し、小さい画面から設計して大きい画面に拡張する。

### ブレークポイント

| 名前 | 幅       | 想定デバイス               |
| ---- | -------- | -------------------------- |
| base | 0〜      | スマホ（縦）               |
| sm   | 640px〜  | スマホ（横）、小タブレット |
| md   | 768px〜  | タブレット                 |
| lg   | 1024px〜 | PC                         |

### CSS実装例

```css
/* base: スマホ縦（デフォルト） */
.container {
  padding: 16px;
}

/* sm: 640px以上 */
@media (min-width: 640px) {
  .container {
    padding: 24px;
  }
}

/* md: 768px以上 */
@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}

/* lg: 1024px以上 */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    margin: 0 auto;
  }
}
```

---

## アクセシビリティ

**WCAG 2.1 Level AA 準拠を目指す**

### 必須対応項目

#### キーボード操作

- すべてのインタラクティブ要素がキーボードで操作可能
- フォーカス順序が論理的
- フォーカス状態が視覚的に明確

#### 色とコントラスト

- テキストのコントラスト比 4.5:1 以上
- 大きなテキスト（18pt以上）は 3:1 以上
- 色だけに依存しない情報伝達（アイコン、テキストを併用）

#### 画像とメディア

- すべての画像にalt属性を設定
- 装飾的な画像は `alt=""` で空にする
- アイコンボタンには aria-label を設定

#### フォーム

- すべての入力にラベルを関連付け
- エラーメッセージはテキストで明示
- 必須項目を明示

#### 構造

- 見出しレベル（h1〜h6）を適切に使用
- ランドマーク（header, main, nav, footer）を使用
- スキップリンクを設置

### コントラスト比の確認

カラーパレットの主要な組み合わせ:

| 組み合わせ                              | コントラスト比 | 判定 |
| --------------------------------------- | -------------- | ---- |
| 白文字 (#ffffff) / 背景 (#0a0a0a)       | 約 19.4:1      | OK   |
| 白文字 (#ffffff) / ウィンドウ (#0d1a2d) | 約 15.5:1      | OK   |
| グレー文字 (#a0a0a0) / 背景 (#0a0a0a)   | 約 8.5:1       | OK   |
| オレンジ (#f39c12) / 背景 (#0a0a0a)     | 約 8.2:1       | OK   |

ダークモード + 明るい文字色のため、コントラスト比は十分確保できる。

---

## CSS技術選定

**CSS Modules を使用する**

### 選定理由

- スコープが自動でローカル化され、命名衝突を防げる
- 素のCSSの知識がそのまま使える（学習コスト低）
- Viteで標準サポート（追加依存なし）
- ドラクエ風の独自スタイルが多いため、ユーティリティCSS（Tailwind等）の恩恵が薄い

### ファイル命名規則

```
ComponentName.tsx        # コンポーネント
ComponentName.module.css # スタイル
```

### 使用例

```css
/* Button.module.css */
.button {
  background: linear-gradient(180deg, #1a2d4a 0%, #0d1a2d 100%);
  border: 3px solid #ffffff;
  border-radius: 8px;
  padding: 12px 24px;
  color: #ffffff;
  cursor: pointer;
}

.button:hover {
  background: linear-gradient(180deg, #2a3d5a 0%, #1a2d3d 100%);
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

export function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

### グローバルスタイル

以下はグローバルCSS（index.css）で定義:

- CSS変数（カラーパレット、フォント）
- リセットCSS
- 基本的なbody/htmlスタイル

```css
/* index.css */
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

---

## AI生成素材のガイドライン

### 共通指示

素材をAI生成する際は、以下を基本プロンプトに含める:

```
スタイル: SFC（スーパーファミコン）時代のJRPG風
参考: ドラゴンクエスト5, 6のUI・グラフィック
配色: ダークテーマ（背景 #0a0a0a、アクセント #f39c12）
```

### ドラゴン（敵）画像

- SFC時代のドット絵風、またはそれを高解像度化したスタイル
- 正面向き、単体
- 背景透過推奨

### アイコン

- シンプルなピクセルアート風
- 単色または2〜3色
- 16x16、32x32、64x64のサイズバリエーション

### 背景

- 必要に応じて作成
- ダンジョン風、城内風など
- メインコンテンツの邪魔にならない暗めのトーン
