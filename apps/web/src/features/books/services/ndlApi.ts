export interface NdlBookInfo {
  totalPages: number | null;
  coverUrl: string | null;
}

export interface NdlBookSearchResult {
  title: string;
  author: string | null;
  isbn: string | null;
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

const MAX_SEARCH_RESULTS = 10;

// 書籍以外の資料タイプをフィルタリングするためのキーワード
const NON_BOOK_TYPES = [
  '録音資料',
  '映像資料',
  'ビデオ',
  'DVD',
  'CD',
  'カセット',
  '電子資料',
];

function isBookMaterial(item: Element): boolean {
  // dc:typeやmaterialTypeで判定
  const materialType = item.querySelector('materialType')?.textContent;
  if (materialType && NON_BOOK_TYPES.some((t) => materialType.includes(t))) {
    return false;
  }

  // extentにページ数(p)が含まれていれば書籍として扱う
  const extent = item.querySelector('extent')?.textContent;
  if (extent && /\d+p/.test(extent)) {
    return true;
  }

  // dc:typeで判定
  const dcType = item.querySelector('type')?.textContent;
  if (dcType && NON_BOOK_TYPES.some((t) => dcType.includes(t))) {
    return false;
  }

  // extentがない場合でも、明示的に除外されなければ書籍として扱う
  return true;
}

function extractIsbnFromItem(item: Element): string | null {
  // identifier要素からISBNを探す
  const identifiers = item.querySelectorAll('identifier');
  for (const id of identifiers) {
    const text = id.textContent;
    if (text) {
      // ISBN-13またはISBN-10のパターン
      const isbnMatch = text.match(/(\d{13}|\d{10})/);
      if (isbnMatch) {
        return isbnMatch[1];
      }
    }
  }
  return null;
}

export async function fetchBooksByTitle(
  title: string
): Promise<NdlBookSearchResult[]> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return [];
  }

  const url = `https://ndlsearch.ndl.go.jp/api/opensearch?title=${encodeURIComponent(trimmedTitle)}&cnt=${MAX_SEARCH_RESULTS * 2}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    const items = doc.querySelectorAll('item');
    const results: NdlBookSearchResult[] = [];

    for (const item of items) {
      if (results.length >= MAX_SEARCH_RESULTS) break;

      if (!isBookMaterial(item)) continue;

      const itemTitle = item.querySelector('title')?.textContent;
      if (!itemTitle) continue;

      const author = item.querySelector('author, creator')?.textContent ?? null;
      const isbn = extractIsbnFromItem(item);
      const extent = item.querySelector('extent')?.textContent;
      const totalPages = extractPagesFromExtent(extent);
      const coverUrl = isbn
        ? `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`
        : null;

      results.push({
        title: itemTitle,
        author,
        isbn,
        totalPages,
        coverUrl,
      });
    }

    return results;
  } catch {
    return [];
  }
}
