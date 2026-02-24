# ルートハンドラのエラーハンドリング共通化

## 概要

`routes/books.ts` に重複するtry-catchパターンを共通化し、カスタムエラークラスとグローバルエラーハンドラで一括処理する。

## 背景

- 各ルートハンドラに同じ構造のtry-catchブロックがコピペされている（4箇所）
- エラーレスポンスの形式を変更する際に全箇所を修正する必要がある
- 新しいルートを追加するたびに同じボイラープレートが増える

## 要件

### 機能要件

- [ ] カスタムエラークラスを定義する（AppError基底クラス、BadRequestError）
- [ ] サービス層でカスタムエラークラスをthrowする
- [ ] Honoの`app.onError`でグローバルエラーハンドラを設定する
- [ ] 各ルートハンドラからtry-catchを除去し、エラーをthrowするだけにする

### 非機能要件

- 既存のAPIレスポンス形式（`{ error: string }`）を維持する
- 既存テストが全てパスする（テストコードの修正は許容）
- HTTPステータスコードの挙動が変わらない

## 受け入れ条件

- [ ] `routes/books.ts` からtry-catchブロックが除去されている
- [ ] エラーレスポンスのHTTPステータスコードと形式が変わらない
- [ ] 全テスト（unit, integration）がパスする
- [ ] lint, typecheck, format:check がパスする

## 対象外（スコープ外）

- NotFoundError（404）の共通化（現状nullチェックのパターンが明確で、Errorにする必要がない）
- フロントエンドへの影響（APIレスポンス形式は変更なし）
- `skills.ts` の変更（try-catchがないため不要）

## 参考

- [GitHub Issue #76](https://github.com/dznbk/tsundoku-dragon/issues/76)
