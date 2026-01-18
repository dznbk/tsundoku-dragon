import { nanoid } from 'nanoid';
import type { Book } from '@tsundoku-dragon/shared';
import { BookRepository } from '../repositories/bookRepository';
import { SkillRepository } from '../repositories/skillRepository';
import {
  BattleLogRepository,
  type PaginatedBattleLogs,
} from '../repositories/battleLogRepository';
import type { CreateBookInput, UpdateBookInput } from '../types/api';
import type { Env } from '../lib/dynamodb';

export class BookService {
  private repository: BookRepository;
  private skillRepository: SkillRepository;
  private battleLogRepository: BattleLogRepository;

  constructor(env: Env) {
    this.repository = new BookRepository(env);
    this.skillRepository = new SkillRepository(env);
    this.battleLogRepository = new BattleLogRepository(env);
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

    // 新規スキルをカスタムスキルに自動登録
    await this.registerNewSkillsAsCustomSkills(userId, input.skills ?? []);

    return book;
  }

  private async registerNewSkillsAsCustomSkills(
    userId: string,
    skills: string[]
  ): Promise<void> {
    if (skills.length === 0) return;

    // 2回のDB呼び出しで既存スキルを一括取得
    const [globalSkills, customSkills] = await Promise.all([
      this.skillRepository.findGlobalSkills(),
      this.skillRepository.findUserCustomSkills(userId),
    ]);

    const existingNames = new Set([
      ...globalSkills.map((s) => s.name),
      ...customSkills.map((s) => s.name),
    ]);

    const newSkills = skills.filter((name) => !existingNames.has(name));

    // 新規スキルを並列保存
    await Promise.all(
      newSkills.map((name) =>
        this.skillRepository.saveUserCustomSkill(userId, name)
      )
    );
  }

  async listBooks(userId: string): Promise<Book[]> {
    const books = await this.repository.findByUserId(userId);
    // archived状態の本は除外
    return books.filter((book) => book.status !== 'archived');
  }

  async getBook(userId: string, bookId: string): Promise<Book | null> {
    return this.repository.findById(userId, bookId);
  }

  async updateBook(
    userId: string,
    bookId: string,
    input: UpdateBookInput
  ): Promise<Book | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    const updates: Parameters<BookRepository['update']>[2] = {
      updatedAt: new Date().toISOString(),
    };

    if (input.title !== undefined) {
      updates.title = input.title;
    }
    if (input.totalPages !== undefined) {
      updates.totalPages = input.totalPages;
    }
    if (input.skills !== undefined) {
      updates.skills = input.skills;
      // 新規スキルをカスタムスキルに自動登録
      await this.registerNewSkillsAsCustomSkills(userId, input.skills);
    }

    return this.repository.update(userId, bookId, updates);
  }

  async deleteBook(userId: string, bookId: string): Promise<boolean> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return false;
    }
    await this.repository.softDelete(userId, bookId);
    return true;
  }

  async resetBook(userId: string, bookId: string): Promise<Book | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    // 討伐済みでない場合はリセット不可
    if (book.status !== 'completed') {
      return null;
    }

    return this.repository.update(userId, bookId, {
      currentPage: 0,
      status: 'reading',
      round: book.round + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  async getBattleLogs(
    userId: string,
    bookId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedBattleLogs | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }
    return this.battleLogRepository.findByBookId(userId, bookId, page, limit);
  }
}
