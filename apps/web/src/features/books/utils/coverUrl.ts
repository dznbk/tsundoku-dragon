/**
 * ISBNから書影画像URLを組み立てる
 *
 * NDL書影APIが2026-03-31で終了したため、書影はAPIの GET /covers/:isbn 経由で
 * 楽天ブックスから取得する（エンドポイントが楽天の画像URLへ302リダイレクトする）。
 * https://github.com/dznbk/tsundoku-dragon/issues/92
 *
 * @returns 書影URL。ISBNが無効な場合はnull
 */
export function getCoverUrl(isbn: string | null | undefined): string | null {
  const cleanIsbn = isbn?.replace(/-/g, '') ?? '';
  if (!/^(\d{10}|\d{13})$/.test(cleanIsbn)) {
    return null;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    return null;
  }

  return `${apiUrl}/covers/${cleanIsbn}`;
}
