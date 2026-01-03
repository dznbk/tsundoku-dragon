import { verifyFirebaseAuth, getFirebaseToken } from '@hono/firebase-auth';
import type { Context, MiddlewareHandler, Next } from 'hono';
import type { Env } from '../lib/dynamodb';

/**
 * Firebase Auth認証ミドルウェア
 * 環境変数からprojectIdを取得してトークンを検証
 */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
  const middleware = verifyFirebaseAuth({
    projectId: c.env.FIREBASE_PROJECT_ID,
  });
  return middleware(c, next);
};

/**
 * 認証済みユーザーのFirebase UIDを取得
 * @throws 認証されていない場合はエラー
 */
export function getAuthUserId(c: Context<{ Bindings: Env }>): string {
  const token = getFirebaseToken(c);
  if (!token) {
    throw new Error('User is not authenticated');
  }
  return token.uid;
}

// re-export for convenience
export { getFirebaseToken };
