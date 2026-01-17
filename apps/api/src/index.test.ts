import { describe, it, expect } from 'vitest';
import app from './index';

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
