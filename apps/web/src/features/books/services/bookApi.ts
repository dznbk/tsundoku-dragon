import type { User } from 'firebase/auth';

export interface CreateBookInput {
  title: string;
  isbn?: string;
  totalPages: number;
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
