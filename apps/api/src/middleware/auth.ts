import { verifyFirebaseAuth, getFirebaseToken } from '@hono/firebase-auth';
import { WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers';
import type { Context, MiddlewareHandler, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../types/env';

/**
 * Firebase Auth認証ミドルウェア
 * 環境変数からprojectIdを取得してトークンを検証
 * Workers KVで公開鍵をキャッシュしてパフォーマンス向上
 */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
  const middleware = verifyFirebaseAuth({
    projectId: c.env.FIREBASE_PROJECT_ID,
    keyStoreInitializer: () =>
      WorkersKVStoreSingle.getOrInitialize(
        c.env.PUBLIC_JWK_CACHE_KEY,
        c.env.PUBLIC_JWK_CACHE_KV
      ),
  });
  return middleware(c, next);
};

/**
 * 認証済みユーザーのFirebase UIDを取得
 * @throws 認証されていない場合は401エラー
 */
export function getAuthUserId(c: Context<{ Bindings: Env }>): string {
  const token = getFirebaseToken(c);
  if (!token) {
    throw new HTTPException(401, { message: 'User is not authenticated' });
  }
  return token.uid;
}

// re-export for convenience
export { getFirebaseToken };
