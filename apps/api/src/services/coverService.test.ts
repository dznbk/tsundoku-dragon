import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoverService } from './coverService';
import type { Env } from '../types/env';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createEnv(overrides: Partial<Env> = {}): Env {
  return {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
    RAKUTEN_APPLICATION_ID: 'test-app-id',
    ...overrides,
  };
}

function rakutenResponse(items: unknown[]): Response {
  return new Response(JSON.stringify({ Items: items }), { status: 200 });
}

describe('CoverService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCoverImageUrl', () => {
    it('書影が見つかった場合、サイズを400x400に変更したURLを返す', async () => {
      mockFetch.mockResolvedValueOnce(
        rakutenResponse([
          {
            Item: {
              largeImageUrl:
                'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0727/9784798150727.jpg?_ex=200x200',
            },
          },
        ])
      );

      const service = new CoverService(createEnv());
      const url = await service.getCoverImageUrl('9784798150727');

      expect(url).toBe(
        'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0727/9784798150727.jpg?_ex=400x400'
      );
    });

    it('楽天APIにISBN・アプリID・Refererを付けてリクエストする', async () => {
      mockFetch.mockResolvedValueOnce(rakutenResponse([]));

      const service = new CoverService(createEnv());
      await service.getCoverImageUrl('9784798150727');

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain(
        'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404'
      );
      expect(url).toContain('isbn=9784798150727');
      expect(url).toContain('applicationId=test-app-id');
      expect(init.headers).toMatchObject({
        Referer: 'https://tsundoku.deepon.dev/',
      });
    });

    it('検索結果が0件の場合、nullを返す', async () => {
      mockFetch.mockResolvedValueOnce(rakutenResponse([]));

      const service = new CoverService(createEnv());
      const url = await service.getCoverImageUrl('9784798150727');

      expect(url).toBeNull();
    });

    it('largeImageUrlがない場合、nullを返す', async () => {
      mockFetch.mockResolvedValueOnce(rakutenResponse([{ Item: {} }]));

      const service = new CoverService(createEnv());
      const url = await service.getCoverImageUrl('9784798150727');

      expect(url).toBeNull();
    });

    it('楽天APIがエラーレスポンスを返した場合、nullを返す', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
      );

      const service = new CoverService(createEnv());
      const url = await service.getCoverImageUrl('9784798150727');

      expect(url).toBeNull();
    });

    it('RAKUTEN_APPLICATION_IDが未設定の場合、APIを呼ばずnullを返す', async () => {
      const service = new CoverService(
        createEnv({ RAKUTEN_APPLICATION_ID: undefined })
      );
      const url = await service.getCoverImageUrl('9784798150727');

      expect(url).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
