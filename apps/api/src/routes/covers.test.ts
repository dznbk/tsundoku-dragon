import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import covers from './covers';
import { handleError } from '../lib/errors';

const mockGetCoverImageUrl = vi.fn();

vi.mock('../services/coverService', () => ({
  CoverService: class {
    getCoverImageUrl = mockGetCoverImageUrl;
  },
}));

describe('Covers Routes', () => {
  const mockEnv = {
    RAKUTEN_APPLICATION_ID: 'test-app-id',
  };

  const app = new Hono();
  app.route('/covers', covers);
  app.onError(handleError);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /covers/:isbn', () => {
    it('書影が見つかった場合、画像URLへの302リダイレクトを返す', async () => {
      mockGetCoverImageUrl.mockResolvedValueOnce(
        'https://thumbnail.image.rakuten.co.jp/test.jpg?_ex=400x400'
      );

      const res = await app.request('/covers/9784798150727', {}, mockEnv);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe(
        'https://thumbnail.image.rakuten.co.jp/test.jpg?_ex=400x400'
      );
      expect(res.headers.get('Cache-Control')).toContain('max-age');
      expect(mockGetCoverImageUrl).toHaveBeenCalledWith('9784798150727');
    });

    it('ハイフン付きISBNを正規化して検索する', async () => {
      mockGetCoverImageUrl.mockResolvedValueOnce(null);

      await app.request('/covers/978-4-7981-5072-7', {}, mockEnv);

      expect(mockGetCoverImageUrl).toHaveBeenCalledWith('9784798150727');
    });

    it('書影が見つからない場合、404を返す', async () => {
      mockGetCoverImageUrl.mockResolvedValueOnce(null);

      const res = await app.request('/covers/9784798150727', {}, mockEnv);

      expect(res.status).toBe(404);
      expect(res.headers.get('Cache-Control')).toContain('max-age');
    });

    it('不正なISBNの場合、400を返す', async () => {
      const res = await app.request('/covers/invalid-isbn', {}, mockEnv);

      expect(res.status).toBe(400);
      expect(mockGetCoverImageUrl).not.toHaveBeenCalled();
    });

    it('桁数が不正なISBNの場合、400を返す', async () => {
      const res = await app.request('/covers/12345', {}, mockEnv);

      expect(res.status).toBe(400);
      expect(mockGetCoverImageUrl).not.toHaveBeenCalled();
    });
  });
});
