import { nanoid } from 'nanoid';
import type { Book } from '@tsundoku-dragon/shared';
import { BookRepository } from '../repositories/bookRepository';
import { SkillRepository } from '../repositories/skillRepository';
import type { CreateBookInput } from '../types/api';
import type { Env } from '../lib/dynamodb';

export class BookService {
  private repository: BookRepository;
  private skillRepository: SkillRepository;

  constructor(env: Env) {
    this.repository = new BookRepository(env);
    this.skillRepository = new SkillRepository(env);
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
    for (const skillName of skills) {
      // グローバルスキルに存在する場合はスキップ
      const isGlobal = await this.skillRepository.hasGlobalSkill(skillName);
      if (isGlobal) continue;

      // カスタムスキルに既に存在する場合はスキップ
      const isCustom = await this.skillRepository.hasUserCustomSkill(
        userId,
        skillName
      );
      if (isCustom) continue;

      // 新規スキルをカスタムスキルとして登録
      await this.skillRepository.saveUserCustomSkill(userId, skillName);
    }
  }

  async listBooks(userId: string): Promise<Book[]> {
    return this.repository.findByUserId(userId);
  }

  async getBook(userId: string, bookId: string): Promise<Book | null> {
    return this.repository.findById(userId, bookId);
  }
}
