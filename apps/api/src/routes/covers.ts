import { Hono } from 'hono';
import type { Env } from '../types/env';
import { CoverService } from '../services/coverService';

const covers = new Hono<{ Bindings: Env }>();

// 書影ありは30日キャッシュ。なしは後から書影が登録される可能性があるため1日に留める
const FOUND_CACHE_CONTROL = 'public, max-age=2592000';
const NOT_FOUND_CACHE_CONTROL = 'public, max-age=86400';

function getEdgeCache(): Cache | undefined {
  // ローカル・テスト環境ではCache APIが存在しない
  return typeof caches !== 'undefined' ? caches.default : undefined;
}

covers.get('/:isbn', async (c) => {
  const isbn = c.req.param('isbn').replace(/-/g, '');
  if (!/^(\d{10}|\d{13})$/.test(isbn)) {
    return c.json({ error: 'Invalid ISBN' }, 400);
  }

  // エッジキャッシュで楽天APIのレート制限（目安1req/秒）から保護する
  const cache = getEdgeCache();
  const cacheKey = new Request(c.req.url);
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const service = new CoverService(c.env);
  const imageUrl = await service.getCoverImageUrl(isbn);

  // <img src>から直接参照できるよう、画像URLへの302リダイレクトで返す
  const response = imageUrl
    ? new Response(null, {
        status: 302,
        headers: {
          Location: imageUrl,
          'Cache-Control': FOUND_CACHE_CONTROL,
        },
      })
    : c.json({ error: 'Cover not found' }, 404, {
        'Cache-Control': NOT_FOUND_CACHE_CONTROL,
      });

  if (cache) {
    const putPromise = cache.put(cacheKey, response.clone());
    try {
      c.executionCtx.waitUntil(putPromise);
    } catch {
      await putPromise;
    }
  }

  return response;
});

export default covers;
