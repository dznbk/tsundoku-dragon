import { auth } from '../../../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    'VITE_API_URL environment variable is not set. Please define VITE_API_URL in your environment configuration.'
  );
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError('User is not authenticated', 401);
  }

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed');
    throw new ApiError(message, response.status);
  }

  // Handle empty responses (e.g., 204 No Content)
  const contentLength = response.headers.get('content-length');
  if (response.status === 204 || contentLength === '0') {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<T>(response);
  },
};

export { ApiError };
