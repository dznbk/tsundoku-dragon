import { nanoid } from 'nanoid';
import type { Book, BattleLog } from '@tsundoku-dragon/shared';
import {
  BookRepository,
  type LogsQueryResult,
} from '../repositories/bookRepository';
import { SkillRepository } from '../repositories/skillRepository';
import type { CreateBattleLogInput } from '../types/api';
import type { Env } from '../lib/dynamodb';
import { BadRequestError, NotFoundError } from '../lib/errors';
import { defeatBonus as calcDefeatBonus } from '../lib/expCalculator';

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

export class BattleService {
  private bookRepository: BookRepository;
  private skillRepository: SkillRepository;

  constructor(env: Env) {
    this.bookRepository = new BookRepository(env);
    this.skillRepository = new SkillRepository(env);
  }

  async getBookLogs(
    userId: string,
    bookId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<LogsQueryResult> {
    const book = await this.bookRepository.findById(userId, bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return this.bookRepository.findLogs(userId, bookId, options);
  }

  async recordBattle(
    userId: string,
    bookId: string,
    input: CreateBattleLogInput
  ): Promise<RecordBattleResult> {
    const book = await this.bookRepository.findById(userId, bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.status !== 'reading') {
      throw new BadRequestError('Book is not in reading status');
    }

    const now = new Date().toISOString();

    // pagesRead を残りページ数に自動補正
    const remainingPages = book.totalPages - book.currentPage;
    const actualPagesRead = Math.min(input.pagesRead, remainingPages);

    // BattleLog を作成
    const log: BattleLog = {
      id: nanoid(),
      bookId,
      pagesRead: actualPagesRead,
      memo: input.memo,
      createdAt: now,
    };

    // ログを保存
    await this.bookRepository.saveLog(userId, bookId, log);

    // 本の進捗を更新
    const newCurrentPage = book.currentPage + actualPagesRead;
    const defeat = newCurrentPage >= book.totalPages;

    const updatedBook = await this.bookRepository.update(userId, bookId, {
      currentPage: newCurrentPage,
      status: defeat ? 'completed' : 'reading',
      updatedAt: now,
    });

    // 経験値計算
    const baseExp = actualPagesRead;
    const defeatBonusValue = defeat ? calcDefeatBonus(book.totalPages) : 0;
    const totalExpGained = baseExp + defeatBonusValue;

    // 各スキルの経験値更新（並列処理）
    const skillResults = await this.updateSkillsExp(
      userId,
      book.skills,
      totalExpGained
    );

    return {
      log,
      book: updatedBook!,
      defeat,
      expGained: totalExpGained,
      defeatBonus: defeatBonusValue,
      skillResults,
    };
  }

  private async updateSkillsExp(
    userId: string,
    skills: string[],
    expToAdd: number
  ): Promise<SkillResult[]> {
    if (skills.length === 0 || expToAdd === 0) {
      return [];
    }

    // 各スキルの現在の経験値を取得（並列）
    const previousExps = await Promise.all(
      skills.map((skillName) =>
        this.skillRepository.findUserSkillExp(userId, skillName)
      )
    );

    // 各スキルの経験値を更新（並列）
    const updatedExps = await Promise.all(
      skills.map((skillName) =>
        this.skillRepository.upsertUserSkillExp(userId, skillName, expToAdd)
      )
    );

    // SkillResult を構築
    return skills.map((skillName, index) => {
      const previous = previousExps[index];
      const updated = updatedExps[index];
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
