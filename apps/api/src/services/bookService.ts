import { nanoid } from 'nanoid';
import type { Book, BattleLog } from '@tsundoku-dragon/shared';
import {
  BookRepository,
  type LogsQueryResult,
} from '../repositories/bookRepository';
import {
  SkillRepository,
  type UserSkillExp,
} from '../repositories/skillRepository';
import type {
  CreateBookInput,
  UpdateBookInput,
  CreateBattleLogInput,
} from '../types/api';
import type { Env } from '../lib/dynamodb';
import { defeatBonus as calculateDefeatBonus } from '../lib/expCalculator';

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

  async updateBook(
    userId: string,
    bookId: string,
    input: UpdateBookInput
  ): Promise<Book | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    if (book.status === 'archived') {
      throw new Error('Cannot update archived book');
    }

    const now = new Date().toISOString();
    const updatedBook = await this.repository.update(userId, bookId, {
      title: input.title,
      totalPages: input.totalPages,
      skills: input.skills,
      updatedAt: now,
    });

    // 新規スキルをカスタムスキルに自動登録
    if (input.skills) {
      await this.registerNewSkillsAsCustomSkills(userId, input.skills);
    }

    return updatedBook;
  }

  async archiveBook(userId: string, bookId: string): Promise<boolean> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return false;
    }

    if (book.status === 'archived') {
      throw new Error('Book is already archived');
    }

    const now = new Date().toISOString();
    await this.repository.update(userId, bookId, {
      status: 'archived',
      updatedAt: now,
    });

    return true;
  }

  async resetBook(userId: string, bookId: string): Promise<Book | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    if (book.status !== 'completed') {
      throw new Error('Can only reset completed books');
    }

    const now = new Date().toISOString();
    return this.repository.update(userId, bookId, {
      currentPage: 0,
      round: book.round + 1,
      status: 'reading',
      updatedAt: now,
    });
  }

  async getBookLogs(
    userId: string,
    bookId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<LogsQueryResult | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    return this.repository.findLogs(userId, bookId, options);
  }

  async recordBattle(
    userId: string,
    bookId: string,
    input: CreateBattleLogInput
  ): Promise<RecordBattleResult | null> {
    const book = await this.repository.findById(userId, bookId);
    if (!book) {
      return null;
    }

    if (book.status !== 'reading') {
      throw new Error('Book is not in reading status');
    }

    const now = new Date().toISOString();
    const remainingPages = book.totalPages - book.currentPage;
    const actualPagesRead = Math.min(input.pagesRead, remainingPages);
    const newCurrentPage = book.currentPage + actualPagesRead;
    const isDefeated = newCurrentPage >= book.totalPages;

    const log: BattleLog = {
      id: nanoid(),
      bookId,
      pagesRead: actualPagesRead,
      memo: input.memo,
      createdAt: now,
    };

    await this.repository.saveLog(userId, bookId, log);

    const updatedBook = await this.repository.update(userId, bookId, {
      currentPage: newCurrentPage,
      status: isDefeated ? 'completed' : 'reading',
      updatedAt: now,
    });

    // 経験値計算
    const baseExp = actualPagesRead;
    const bonus = isDefeated ? calculateDefeatBonus(book.totalPages) : 0;
    const totalExpGained = baseExp + bonus;

    // 各スキルの経験値更新（並列処理）
    const skillResults = await this.updateSkillExps(
      userId,
      book.skills,
      totalExpGained
    );

    return {
      log,
      book: updatedBook!,
      defeat: isDefeated,
      expGained: totalExpGained,
      defeatBonus: bonus,
      skillResults,
    };
  }

  private async updateSkillExps(
    userId: string,
    skills: string[],
    expToAdd: number
  ): Promise<SkillResult[]> {
    if (skills.length === 0 || expToAdd === 0) {
      return [];
    }

    // 各スキルの現在の状態を並列取得
    const previousStates = await Promise.all(
      skills.map((skillName) =>
        this.skillRepository.findUserSkillExp(userId, skillName)
      )
    );

    // 経験値を並列更新
    const updatedStates = await Promise.all(
      skills.map((skillName) =>
        this.skillRepository.upsertUserSkillExp(userId, skillName, expToAdd)
      )
    );

    // 結果を構築
    return skills.map((skillName, index) => {
      const previous: UserSkillExp | null = previousStates[index];
      const updated: UserSkillExp = updatedStates[index];
      const previousLevel = previous?.level ?? 1;

      return {
        skillName,
        expGained: expToAdd,
        previousLevel,
        currentLevel: updated.level,
        currentExp: updated.exp,
        leveledUp: updated.level > previousLevel,
      };
    });
  }
}
