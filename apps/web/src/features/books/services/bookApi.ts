import { apiClient } from '../../../lib/apiClient';

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

export async function createBook(input: CreateBookInput): Promise<Book> {
  return apiClient.post<Book>('/books', input);
}

export async function getBooks(): Promise<Book[]> {
  const data = await apiClient.get<{ books: Book[] }>('/books');
  return data.books;
}

export async function getBook(bookId: string): Promise<Book> {
  return apiClient.get<Book>(`/books/${bookId}`);
}

export async function updateBook(
  bookId: string,
  input: UpdateBookInput
): Promise<Book> {
  return apiClient.put<Book>(`/books/${bookId}`, input);
}

export async function deleteBook(bookId: string): Promise<void> {
  return apiClient.delete(`/books/${bookId}`);
}

export async function resetBook(bookId: string): Promise<Book> {
  return apiClient.post<Book>(`/books/${bookId}/reset`, {});
}

export async function getBookLogs(
  bookId: string,
  options?: { limit?: number; cursor?: string }
): Promise<BattleLogsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.cursor) params.set('cursor', options.cursor);

  const query = params.toString();
  const path = `/books/${bookId}/logs${query ? `?${query}` : ''}`;

  return apiClient.get<BattleLogsResponse>(path);
}

export async function recordBattle(
  bookId: string,
  input: RecordBattleInput
): Promise<RecordBattleResult> {
  return apiClient.post<RecordBattleResult>(`/books/${bookId}/logs`, input);
}
