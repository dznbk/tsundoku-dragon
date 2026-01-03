import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authMiddleware, getAuthUserId } from './auth';
import type { Env } from '../lib/dynamodb';
import type { Context } from 'hono';

// Firebase Auth のモック
vi.mock('@hono/firebase-auth', () => ({
  verifyFirebaseAuth: vi.fn(
    () => async (_c: Context, next: () => Promise<void>) => {
      await next();
    }
  ),
  getFirebaseToken: vi.fn(),
}));

import { getFirebaseToken } from '@hono/firebase-auth';

describe('auth middleware', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('次のハンドラを呼び出す', async () => {
      const app = new Hono<{ Bindings: Env }>();
      app.use('*', authMiddleware);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test', {}, mockEnv);

      expect(res.status).toBe(200);
    });
  });

  describe('getAuthUserId', () => {
    it('トークンからuidを取得する', () => {
      vi.mocked(getFirebaseToken).mockReturnValue({
        uid: 'firebase-user-123',
        aud: 'test-project',
        auth_time: 1234567890,
        exp: 1234567890,
        iat: 1234567890,
        iss: 'https://securetoken.google.com/test-project',
        sub: 'firebase-user-123',
        firebase: {
          sign_in_provider: 'google.com',
          identities: {},
        },
      });

      const mockContext = {} as Context<{ Bindings: Env }>;
      const userId = getAuthUserId(mockContext);

      expect(userId).toBe('firebase-user-123');
    });

    it('トークンがない場合はエラー', () => {
      vi.mocked(getFirebaseToken).mockReturnValue(null);

      const mockContext = {} as Context<{ Bindings: Env }>;

      expect(() => getAuthUserId(mockContext)).toThrow(
        'User is not authenticated'
      );
    });
  });
});
