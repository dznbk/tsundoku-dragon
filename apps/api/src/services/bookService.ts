import { nanoid } from 'nanoid';
import type { Book } from '@tsundoku-dragon/shared';
import { BookRepository } from '../repositories/bookRepository';
import type { CreateBookInput } from '../types/api';
import type { Env } from '../lib/dynamodb';

export class BookService {
  private repository: BookRepository;

  constructor(env: Env) {
    this.repository = new BookRepository(env);
  }

  async createBook(userId: string, input: CreateBookInput): Promise<Book> {
    const now = new Date().toISOString();
    const book: Book = {
      id: nanoid(),
      userId,
      title: input.title,
      isbn: input.isbn,
      totalPages: input.totalPages,
      currentPage: 0,
      status: 'reading',
      skills: input.skills ?? [],
      round: 1,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.save(book);
    return book;
  }

  async listBooks(userId: string): Promise<Book[]> {
    return this.repository.findByUserId(userId);
  }

  async getBook(userId: string, bookId: string): Promise<Book | null> {
    return this.repository.findById(userId, bookId);
  }
}
