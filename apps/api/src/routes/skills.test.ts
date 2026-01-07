import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import skills from './skills';

const mockFindGlobalSkills = vi.fn();
const mockFindUserCustomSkills = vi.fn();

vi.mock('../repositories/skillRepository', () => ({
  SkillRepository: class {
    findGlobalSkills = mockFindGlobalSkills;
    findUserCustomSkills = mockFindUserCustomSkills;
  },
}));

vi.mock('../middleware/auth', () => ({
  getAuthUserId: vi.fn(() => 'test-user'),
  authMiddleware: vi.fn(),
  getFirebaseToken: vi.fn(),
}));

describe('Skills Routes', () => {
  const mockEnv = {
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_REGION: 'ap-northeast-1',
    DYNAMODB_TABLE_NAME: 'test-table',
    FIREBASE_PROJECT_ID: 'test-project',
    PUBLIC_JWK_CACHE_KEY: 'test-cache-key',
    PUBLIC_JWK_CACHE_KV: {} as KVNamespace,
  };

  const app = new Hono().route('/skills', skills);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /skills', () => {
    it('グローバルスキルとユーザースキルを返す', async () => {
      mockFindGlobalSkills.mockResolvedValueOnce([
        { name: 'React', category: 'フロントエンド' },
        { name: 'TypeScript', category: 'プログラミング言語' },
      ]);
      mockFindUserCustomSkills.mockResolvedValueOnce([
        { name: 'MySkill', createdAt: '2024-01-01T00:00:00Z' },
      ]);

      const res = await app.request('/skills', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        globalSkills: string[];
        userSkills: string[];
      };
      expect(body.globalSkills).toEqual(['React', 'TypeScript']);
      expect(body.userSkills).toEqual(['MySkill']);
    });

    it('空のスキル一覧を返す', async () => {
      mockFindGlobalSkills.mockResolvedValueOnce([]);
      mockFindUserCustomSkills.mockResolvedValueOnce([]);

      const res = await app.request('/skills', {}, mockEnv);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        globalSkills: string[];
        userSkills: string[];
      };
      expect(body.globalSkills).toEqual([]);
      expect(body.userSkills).toEqual([]);
    });
  });
});
