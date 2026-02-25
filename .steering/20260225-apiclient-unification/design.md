# 設計: bookApi/skillApiの共通apiClient統一

## 概要

`authApi.ts` にある `apiClient` と `ApiError` を `lib/apiClient.ts` に移動し、`bookApi.ts` と `skillApi.ts` がそれを使うように書き換える。

## 設計判断

### apiClient の配置先

`lib/apiClient.ts` に移動する。

**理由**:

- `apiClient` は認証(auth)固有のロジックではなく、アプリ全体のHTTPクライアント
- `features/auth/services/` は認証フローのサービスであるべき
- `lib/` は `firebase.ts` のようなアプリ基盤コードの配置場所として適切
- リポジトリ構造の「2箇所以上から使われる → shared/ に配置」に準じるが、lib配下のインフラ層として配置

### ApiError の配置先

`apiClient.ts` と同じファイルに同居させる。

**理由**:

- `ApiError` は API通信のエラー表現であり、`apiClient` と密結合
- 別ファイルにするほどの複雑さがない

### 後方互換性

`authApi.ts` と `features/auth/index.ts` から `apiClient` と `ApiError` を再exportする。

**理由**:

- 外部から `import { apiClient } from '../features/auth'` で参照している箇所がある可能性を考慮
- 段階的な移行が可能（今回のPRで直接参照に切り替える箇所は全て対応）

### bookApi.ts の型定義

`bookApi.ts` に残す。型定義は API レスポンスの構造を表しており、bookApi の責務。

### getBookLogs のクエリパラメータ対応

現在の `apiClient.get` はクエリパラメータをサポートしていない。`getBookLogs` で使用するため、URL構築を関数内で行う（apiClient を拡張しない）。

**理由**:

- クエリパラメータが必要なのは現時点で `getBookLogs` のみ
- YAGNI原則に従い、apiClient の拡張は必要になった時点で行う

## ファイル構成

### 新規作成

- `apps/web/src/lib/apiClient.ts` — apiClient + ApiError（authApi.tsから移動）

### 変更

- `apps/web/src/features/auth/services/authApi.ts` — apiClient/ApiError削除、lib/apiClientから再export
- `apps/web/src/features/auth/services/authApi.test.ts` — import先を lib/apiClient に変更
- `apps/web/src/features/auth/index.ts` — export先を lib/apiClient に変更
- `apps/web/src/features/books/services/bookApi.ts` — apiClient使用、User引数削除、ApiError削除
- `apps/web/src/features/books/services/skillApi.ts` — apiClient使用、User引数削除
- `apps/web/src/features/books/hooks/useBooks.ts` — user引数削除
- `apps/web/src/features/books/hooks/useBook.ts` — user引数削除
- `apps/web/src/features/books/hooks/useBattle.ts` — user引数削除
- `apps/web/src/features/books/hooks/useBattleLogs.ts` — user引数削除
- `apps/web/src/features/books/hooks/useUserStatus.ts` — user引数削除
- `apps/web/src/features/skills/hooks/useSkills.ts` — user引数削除
- `apps/web/src/pages/BookRegisterPage.tsx` — user引数削除、ApiError import先変更

## bookApi.ts の変更後イメージ

```typescript
import { apiClient } from '../../../lib/apiClient';

// 型定義はそのまま残す

export async function createBook(input: CreateBookInput): Promise<Book> {
  return apiClient.post<Book>('/books', input);
}

export async function getBooks(): Promise<Book[]> {
  const data = await apiClient.get<{ books: Book[] }>('/books');
  return data.books;
}

export async function getBook(bookId: string): Promise<Book> {
  return apiClient.get<Book>(`/books/${bookId}`);
}

export async function updateBook(
  bookId: string,
  input: UpdateBookInput
): Promise<Book> {
  return apiClient.put<Book>(`/books/${bookId}`, input);
}

export async function deleteBook(bookId: string): Promise<void> {
  return apiClient.delete(`/books/${bookId}`);
}

export async function resetBook(bookId: string): Promise<Book> {
  return apiClient.post<Book>(`/books/${bookId}/reset`, undefined);
}

export async function getBookLogs(
  bookId: string,
  options?: { limit?: number; cursor?: string }
): Promise<BattleLogsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.cursor) params.set('cursor', options.cursor);
  const query = params.toString();
  const path = `/books/${bookId}/logs${query ? `?${query}` : ''}`;
  return apiClient.get<BattleLogsResponse>(path);
}

export async function recordBattle(
  bookId: string,
  input: RecordBattleInput
): Promise<RecordBattleResult> {
  return apiClient.post<RecordBattleResult>(`/books/${bookId}/logs`, input);
}
```

## skillApi.ts の変更後イメージ

```typescript
import { apiClient } from '../../../lib/apiClient';

// 型定義はそのまま残す（ApiError importは削除）

export async function getSkills(): Promise<SkillsResponse> {
  return apiClient.get<SkillsResponse>('/skills');
}
```
