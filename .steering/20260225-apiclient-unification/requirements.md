# 要件定義: bookApi/skillApiの共通apiClient統一

## 背景

- `authApi.ts` に汎用的な `apiClient` が既に実装されている
- `bookApi.ts`（8関数）と `skillApi.ts`（1関数）はそれを使わず、個別に fetch + token取得 + エラーハンドリングを実装している
- 各関数で `User` オブジェクトを引き回す必要があり、hooks層が煩雑

## 要件

1. `bookApi.ts` の全API関数を `apiClient` を使うように書き換える
2. `skillApi.ts` の `getSkills` を `apiClient` を使うように書き換える
3. API関数から `User` 引数を削除する（`apiClient` が `auth.currentUser` から自動取得）
4. 呼び出し元（hooks、pages）から不要になった `user` 引数を削除する
5. `apiClient` を `authApi.ts` から `lib/apiClient.ts` に移動する（authとの責務分離）
6. `ApiError` クラスの重複を解消する（`bookApi.ts` と `authApi.ts` の両方にある）

## スコープ外

- APIレスポンスの型定義変更
- バックエンド側の変更
- 新規API関数の追加

## 影響ファイル

### 直接変更

- `apps/web/src/lib/apiClient.ts` — 新規（authApi.tsから移動）
- `apps/web/src/features/auth/services/authApi.ts` — apiClient/ApiErrorを削除、再export
- `apps/web/src/features/auth/services/authApi.test.ts` — import先変更
- `apps/web/src/features/auth/index.ts` — export先変更
- `apps/web/src/features/books/services/bookApi.ts` — apiClient使用に書き換え
- `apps/web/src/features/books/services/skillApi.ts` — apiClient使用に書き換え

### 呼び出し元変更（User引数削除）

- `apps/web/src/features/books/hooks/useBooks.ts`
- `apps/web/src/features/books/hooks/useBook.ts`
- `apps/web/src/features/books/hooks/useBattle.ts`
- `apps/web/src/features/books/hooks/useBattleLogs.ts`
- `apps/web/src/features/books/hooks/useUserStatus.ts`
- `apps/web/src/features/skills/hooks/useSkills.ts`
- `apps/web/src/pages/BookRegisterPage.tsx`
