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
    return this.repository.findByUserId(userId);
  }

  async getBook(userId: string, bookId: string): Promise<Book | null> {
    return this.repository.findById(userId, bookId);
  }
}
