# UI/デザイン改修: visual-design.md準拠

## 概要

現在のUIをSFC時代のRPG風（ドラクエ系）デザインに改修し、visual-design.mdの仕様に準拠させる。

## 背景

- 現状のUIがvisual-design.mdのデザインコンセプトに沿っていない
- 「積読＆ドラゴンズ」のRPG感を見た目から演出する必要がある
- 統一されたデザインシステムを構築することで、今後の画面追加をスムーズにする

## 要件

### 機能要件

- [x] Googleフォント（Noto Sans JP, DotGothic16）の読み込み設定
- [x] CSS変数でカラーパレット・フォントを定義
- [x] 背景色を`#0a0a0a`に変更（ダークモード一択）
- [x] ライトモード対応を削除
- [x] DQウィンドウスタイルのコンポーネントを作成
- [x] DQスタイルのボタンコンポーネントを作成
- [x] ログイン画面にDQスタイルを適用
- [x] ホーム画面にDQスタイルを適用
- [x] ロゴ画像（public/assets/logo.png）を各画面に配置

### 非機能要件

- WCAG 2.1 Level AA準拠（コントラスト比4.5:1以上）
- モバイルファースト（レスポンシブ対応）
- CSS Modulesを使用（スコープのローカル化）

## 受け入れ条件

- [x] visual-design.mdで定義されたカラーパレットが全て使用可能
- [x] DQウィンドウスタイルが共通コンポーネントとして存在
- [x] ログイン画面・ホーム画面がRPG風のデザインになっている
- [x] ロゴ画像が適切なサイズで表示されている
- [x] `npm test`, `npm run lint`, `npm run typecheck` がパス

## 対象外（スコープ外）

- 戦闘画面のアニメーション実装
- ドラゴン画像の追加
- 新規画面の追加（本の登録、本の詳細など）

## 参考ドキュメント

- [planning/visual-design.md](../../../planning/visual-design.md)
- [planning/screen-design.md](../../../planning/screen-design.md)
- [GitHub Issue #13](https://github.com/dznbk/tsundoku-dragon/issues/13)
