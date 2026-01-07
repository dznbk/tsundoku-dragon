export interface NdlBookInfo {
  totalPages: number | null;
  coverUrl: string | null;
}

export async function fetchBookInfoByIsbn(isbn: string): Promise<NdlBookInfo> {
  const cleanIsbn = isbn.replace(/-/g, '');

  if (!cleanIsbn || !/^\d{10}$|^\d{13}$/.test(cleanIsbn)) {
    return { totalPages: null, coverUrl: null };
  }

  const url = `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${cleanIsbn}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { totalPages: null, coverUrl: null };
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    // ページ数抽出
    const extent = doc.querySelector('extent')?.textContent;
    const pagesMatch = extent?.match(/(\d+)p/);
    const totalPages = pagesMatch ? parseInt(pagesMatch[1], 10) : null;

    // 書影URL
    const coverUrl = `https://ndlsearch.ndl.go.jp/thumbnail/${cleanIsbn}.jpg`;

    return { totalPages, coverUrl };
  } catch {
    return { totalPages: null, coverUrl: null };
  }
}

export function extractPagesFromExtent(
  extent: string | null | undefined
): number | null {
  if (!extent) return null;
  const match = extent.match(/(\d+)p/);
  return match ? parseInt(match[1], 10) : null;
}
