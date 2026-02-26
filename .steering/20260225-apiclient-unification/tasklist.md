# タスクリスト: bookApi/skillApiの共通apiClient統一

- 開始日: 2026-02-25
- 完了日: 2026-02-25
- Issue: #78

## フェーズ1: apiClient の移動

- [x] `lib/apiClient.ts` を新規作成（authApi.ts から apiClient + ApiError + 関連関数を移動）
- [x] `authApi.ts` を apiClient/ApiError の再exportのみに変更
- [x] `authApi.test.ts` の import先を `lib/apiClient` に変更
- [x] `features/auth/index.ts` の export先を `lib/apiClient` に変更

## フェーズ2: bookApi / skillApi の書き換え

- [x] `bookApi.ts` を apiClient 使用に書き換え（User引数削除、ApiError削除、全8関数）
- [x] `skillApi.ts` を apiClient 使用に書き換え（User引数削除、ApiError import削除）

## フェーズ3: 呼び出し元の修正

- [x] `useBooks.ts` から user 引数の引き回しを削除
- [x] `useBook.ts` から user 引数の引き回しを削除
- [x] `useBattle.ts` から user 引数の引き回しを削除
- [x] `useBattleLogs.ts` から user 引数の引き回しを削除
- [x] `useUserStatus.ts` から user 引数の引き回しを削除
- [x] `useSkills.ts` から user 引数の引き回しを削除
- [x] `BookRegisterPage.tsx` から user 引数の引き回しとApiError import先を修正

---

## 振り返り

### 計画と実績の差分

- 当初 `authApi.ts` を re-export ファイルとして残す計画だったが、検証で不要と判明し削除した
- `auth/index.ts` の `apiClient`/`ApiError` re-export も同様に削除
- テストファイルを `lib/apiClient.test.ts` にリネーム・移動（コロケーション原則に準拠）
- `resetBook` の `undefined` ボディを `{}` に修正

### 残課題（スコープ外）

- hooks に残る `if (!user) return` ガードと `user` 依存配列の整理（ProtectedRoute の保護前提で不要な可能性）
- `skillApi.ts` が `features/books/services/` にある配置問題（`features/skills/services/` が適切）
