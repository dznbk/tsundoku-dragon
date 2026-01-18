import type { User } from 'firebase/auth';

export interface CreateBookInput {
  title: string;
  isbn?: string;
  totalPages: number;
  skills?: string[];
}

export interface UpdateBookInput {
  title?: string;
  totalPages?: number;
  skills?: string[];
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  isbn?: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'completed' | 'archived';
  skills: string[];
  round: number;
  createdAt: string;
  updatedAt: string;
}

export interface BattleLog {
  id: string;
  bookId: string;
  userId: string;
  pagesRead: number;
  memo?: string;
  createdAt: string;
}

export interface PaginatedBattleLogs {
  logs: BattleLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function createBook(
  user: User,
  input: CreateBookInput
): Promise<Book> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new ApiError('Failed to create book', response.status);
  }

  return response.json();
}

export async function getBooks(user: User): Promise<Book[]> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to fetch books', response.status);
  }

  const data = await response.json();
  return data.books;
}

export async function getBook(user: User, bookId: string): Promise<Book> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books/${bookId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to fetch book', response.status);
  }

  return response.json();
}

export async function updateBook(
  user: User,
  bookId: string,
  input: UpdateBookInput
): Promise<Book> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books/${bookId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new ApiError('Failed to update book', response.status);
  }

  return response.json();
}

export async function deleteBook(user: User, bookId: string): Promise<void> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books/${bookId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to delete book', response.status);
  }
}

export async function resetBook(user: User, bookId: string): Promise<Book> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books/${bookId}/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to reset book', response.status);
  }

  return response.json();
}

export async function getBattleLogs(
  user: User,
  bookId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedBattleLogs> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(
    `${apiUrl}/books/${bookId}/logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to fetch battle logs', response.status);
  }

  return response.json();
}
