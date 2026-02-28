# データフェッチhookの重複パターンを共通化する

## 概要

`useBooks`, `useBook`, `useBattleLogs`, `useSkills`, `useUserStatus` の5つのhookに重複するloading/error/fetchパターンを汎用hookに抽出し、コードの重複を削減する。

## 背景

- 5つのhookが同一のfetchパターン（isLoading/error/try-catch-finally）を繰り返している
- 新しいデータフェッチhookを追加するたびにボイラープレートが増える
- エラーハンドリングのパターンが統一されていない（useUserStatusはエラーを握りつぶすなど）

## 要件

### 機能要件

- [ ] 汎用データフェッチhook `useAsyncData` を作成する
- [ ] `useBook`, `useSkills` を `useAsyncData` で書き換える
- [ ] 外部APIが変わらないこと（各hookの返り値の型が維持される）

### 非機能要件

- 既存のテストがすべてパスすること
- 型安全性が維持されること

## 受け入れ条件

- [ ] `useAsyncData` が `shared/hooks/` に配置されている
- [ ] `useBook`, `useSkills` が `useAsyncData` を使って書き換えられている
- [ ] 各hookの外部インターフェース（返り値の型）が維持されている
- [ ] 全テスト・lint・typecheck・formatがパスする

## 対象外（スコープ外）

- **useBooks**: Jotai atomでグローバルストアに書き込むため、`useAsyncData`のローカルstate管理パターンに合わない。別途リファクタリングが必要。
- **useUserStatus**: 同様にJotai atomに依存。かつエラーを意図的に無視する独自パターン。
- **useBattleLogs**: ページネーション（loadMore / nextCursor）を持つため、単純なfetchパターンとは異なる。共通化するにはページネーション対応の別hookが必要。
- **useBook のミューテーション操作**: update/delete/resetはfetchとは別の関心。fetchのみを共通化対象とする。

## 参考ドキュメント

- [GitHub Issue #79](https://github.com/dznbk/tsundoku-dragon/issues/79)
- [docs/repository-structure.md](../../docs/repository-structure.md)
