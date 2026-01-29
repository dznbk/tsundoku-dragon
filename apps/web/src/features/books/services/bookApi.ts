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

export interface BattleLog {
  id: string;
  bookId: string;
  pagesRead: number;
  memo?: string;
  createdAt: string;
}

export interface BattleLogsResponse {
  logs: BattleLog[];
  nextCursor?: string;
}

export interface RecordBattleInput {
  pagesRead: number;
  memo?: string;
}

export interface SkillResult {
  skillName: string;
  expGained: number;
  previousLevel: number;
  currentLevel: number;
  currentExp: number;
  leveledUp: boolean;
}

export interface RecordBattleResult {
  log: BattleLog;
  book: Book;
  defeat: boolean;
  expGained: number;
  defeatBonus: number;
  skillResults: SkillResult[];
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

export async function getBookLogs(
  user: User,
  bookId: string,
  options?: { limit?: number; cursor?: string }
): Promise<BattleLogsResponse> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.cursor) params.set('cursor', options.cursor);

  const queryString = params.toString();
  const url = `${apiUrl}/books/${bookId}/logs${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to fetch book logs', response.status);
  }

  return response.json();
}

export async function recordBattle(
  user: User,
  bookId: string,
  input: RecordBattleInput
): Promise<RecordBattleResult> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/books/${bookId}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new ApiError('Failed to record battle', response.status);
  }

  return response.json();
}
