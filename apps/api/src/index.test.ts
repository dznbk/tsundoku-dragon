import { Hono } from 'hono';
import { describe, it, expect } from 'vitest';
import app from './index';
import { BadRequestError, handleError } from './lib/errors';

const mockEnv = {
  ALLOWED_ORIGINS: 'http://localhost:5173',
};

describe('API', () => {
  it('responds to health check', async () => {
    const res = await app.request('/health', {}, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: 'ok' });
  });
});

describe('グローバルエラーハンドラ', () => {
  const testApp = new Hono();
  testApp.get('/test-bad-request', () => {
    throw new BadRequestError('test bad request');
  });
  testApp.get('/test-unknown', () => {
    throw new Error('unexpected error');
  });
  testApp.onError(handleError);

  it('AppErrorを対応するステータスコードとJSONで返す', async () => {
    const res = await testApp.request('/test-bad-request');

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('test bad request');
  });

  it('AppError以外のエラーは500を返す', async () => {
    const res = await testApp.request('/test-unknown');

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Internal Server Error');
  });
});
