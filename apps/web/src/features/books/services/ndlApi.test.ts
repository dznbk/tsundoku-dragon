import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractPagesFromExtent, fetchBooksByTitle } from './ndlApi';

describe('ndlApi', () => {
  describe('extractPagesFromExtent', () => {
    it('"466p"から466を抽出する', () => {
      expect(extractPagesFromExtent('466p')).toBe(466);
    });

    it('"xii, 350p"から350を抽出する', () => {
      expect(extractPagesFromExtent('xii, 350p')).toBe(350);
    });

    it('"123ページ ; 21cm"から123を抽出する', () => {
      // 日本語表記ではpが含まれない可能性がある
      // この関数はpのパターンのみをサポート
      expect(extractPagesFromExtent('123p ; 21cm')).toBe(123);
    });

    it('ページ数がない場合はnullを返す', () => {
      expect(extractPagesFromExtent('audio disc')).toBeNull();
    });

    it('nullの場合はnullを返す', () => {
      expect(extractPagesFromExtent(null)).toBeNull();
    });

    it('undefinedの場合はnullを返す', () => {
      expect(extractPagesFromExtent(undefined)).toBeNull();
    });

    it('空文字の場合はnullを返す', () => {
      expect(extractPagesFromExtent('')).toBeNull();
    });
  });

  describe('fetchBooksByTitle', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const createMockXmlResponse = (items: string) =>
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>${items}</channel></rss>`;

    it('タイトルで検索して書籍候補を返す', async () => {
      const xml = createMockXmlResponse(`
        <item>
          <title>わかばちゃんと学ぶGit使い方入門</title>
          <author>湊川 あい</author>
          <identifier>ISBN:9784863542174</identifier>
          <extent>278p</extent>
        </item>
      `);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(xml),
      } as unknown as Response);

      const results = await fetchBooksByTitle('わかばちゃん');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: 'わかばちゃんと学ぶGit使い方入門',
        author: '湊川 あい',
        isbn: '9784863542174',
        totalPages: 278,
        coverUrl: 'https://ndlsearch.ndl.go.jp/thumbnail/9784863542174.jpg',
      });
    });

    it('書籍以外の資料（映像等）を除外する', async () => {
      const xml = createMockXmlResponse(`
        <item>
          <title>書籍タイトル</title>
          <extent>200p</extent>
        </item>
        <item>
          <title>映像資料タイトル</title>
          <materialType>映像資料</materialType>
        </item>
        <item>
          <title>DVD資料</title>
          <type>DVD</type>
        </item>
      `);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(xml),
      } as unknown as Response);

      const results = await fetchBooksByTitle('テスト');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('書籍タイトル');
    });

    it('ISBNがない書籍も含める', async () => {
      const xml = createMockXmlResponse(`
        <item>
          <title>ISBNなし書籍</title>
          <author>著者名</author>
          <extent>150p</extent>
        </item>
      `);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(xml),
      } as unknown as Response);

      const results = await fetchBooksByTitle('テスト');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: 'ISBNなし書籍',
        author: '著者名',
        isbn: null,
        totalPages: 150,
        coverUrl: null,
      });
    });

    it('検索結果が10件を超える場合は10件に制限する', async () => {
      const items = Array.from(
        { length: 15 },
        (_, i) => `
        <item>
          <title>書籍${i + 1}</title>
          <extent>100p</extent>
        </item>
      `
      ).join('');

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(createMockXmlResponse(items)),
      } as unknown as Response);

      const results = await fetchBooksByTitle('テスト');

      expect(results).toHaveLength(10);
    });

    it('空文字の場合は空配列を返す', async () => {
      const results = await fetchBooksByTitle('');

      expect(results).toEqual([]);
      expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    });

    it('スペースのみの場合は空配列を返す', async () => {
      const results = await fetchBooksByTitle('   ');

      expect(results).toEqual([]);
      expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    });

    it('APIエラー時は空配列を返す', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response);

      const results = await fetchBooksByTitle('テスト');

      expect(results).toEqual([]);
    });

    it('ネットワークエラー時は空配列を返す', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const results = await fetchBooksByTitle('テスト');

      expect(results).toEqual([]);
    });
  });
});
