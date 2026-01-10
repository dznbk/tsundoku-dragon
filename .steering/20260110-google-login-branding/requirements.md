# Googleログインボタンのブランドガイドライン準拠

## 概要

GoogleのSign-In Branding Guidelinesに準拠したログインボタンのデザインに変更する。

## 背景

- PR #14 のレビューで指摘があり、現在の実装がGoogleのブランドガイドラインに準拠しているか確認が必要
- Googleの認証機能を使用する場合、ブランドガイドラインへの準拠が必須
- 現在の実装はドラクエ風の独自スタイルを使用しており、公式ロゴやスタイルを使用していない

## 要件

### 機能要件

- [x] 現在の実装がガイドラインに準拠しているか確認
- [ ] Google公式「G」ロゴを使用（標準カラー版）
- [ ] ボタンスタイルをガイドライン準拠に変更
- [ ] ボタンテキストを適切なローカライズ版に設定

### 非機能要件

- アクセシビリティ：WCAG 2.1 Level AA準拠を維持
- ボタンのローディング状態とエラー表示の維持

## 受け入れ条件

- [ ] Google公式「G」ロゴが白背景に標準色で表示されている
- [ ] ボタンの背景色がガイドラインで許可された色（ライト/ダーク/ニュートラル）である
- [ ] ボタンテキストが「Googleでログイン」となっている
- [ ] ローディング中、エラー時の挙動が維持されている
- [ ] 既存のテストが通る

## 対象外（スコープ外）

- Twitter認証ボタンの追加（将来対応）
- ログインページ全体のリデザイン

## 参考ドキュメント

- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- [Issue #15](https://github.com/dznbk/tsundoku-dragon/issues/15)
- [planning/visual-design.md](../../../planning/visual-design.md)
