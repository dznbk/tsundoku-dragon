import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to define mocks that vi.mock can reference
const { mockGetIdToken, mockAuth } = vi.hoisted(() => {
  const mockGetIdToken = vi.fn().mockResolvedValue('mock-id-token');
  const mockAuth = {
    currentUser: {
      getIdToken: mockGetIdToken,
    } as { getIdToken: typeof mockGetIdToken } | null,
  };
  return { mockGetIdToken, mockAuth };
});

vi.mock('../../../lib/firebase', () => ({
  auth: mockAuth,
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
import { apiClient, ApiError } from './authApi';

// Helper to create mock response with headers
function createMockResponse(options: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
}) {
  return {
    ...options,
    status: options.status ?? 200,
    headers: {
      get: () => null,
    },
  };
}

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = {
      getIdToken: mockGetIdToken,
    };
  });

  describe('get', () => {
    it('makes GET request with auth header', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        })
      );

      const result = await apiClient.get('/test');

      expect(mockGetIdToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-id-token',
          }),
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('throws ApiError when user is not authenticated', async () => {
      mockAuth.currentUser = null;

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/test')).rejects.toThrow(
        'User is not authenticated'
      );
    });

    it('throws ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not found'),
        })
      );

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('post', () => {
    it('makes POST request with body and auth header', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: () => Promise.resolve({ id: 1 }),
        })
      );

      const result = await apiClient.post('/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('put', () => {
    it('makes PUT request with body and auth header', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: () => Promise.resolve({ updated: true }),
        })
      );

      const result = await apiClient.put('/test/1', { name: 'updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        })
      );
      expect(result).toEqual({ updated: true });
    });
  });

  describe('delete', () => {
    it('makes DELETE request with auth header', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: () => Promise.resolve({ deleted: true }),
        })
      );

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ deleted: true });
    });

    it('handles 204 No Content response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => '0' },
      });

      const result = await apiClient.delete('/test/1');

      expect(result).toBeUndefined();
    });
  });
});
