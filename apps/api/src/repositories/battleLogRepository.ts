import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { BattleLog } from '@tsundoku-dragon/shared';
import { createDynamoDBClient, type Env } from '../lib/dynamodb';

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

export class BattleLogRepository {
  private client;
  private tableName: string;

  constructor(env: Env) {
    this.client = createDynamoDBClient(env);
    this.tableName = env.DYNAMODB_TABLE_NAME;
  }

  private buildPK(userId: string): string {
    return `USER#${userId}`;
  }

  private buildSKPrefix(bookId: string): string {
    return `BOOK#${bookId}#LOG#`;
  }

  async findByBookId(
    userId: string,
    bookId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedBattleLogs> {
    // まず全件数を取得（SELECT COUNT）
    const countResult = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': this.buildPK(userId),
          ':skPrefix': this.buildSKPrefix(bookId),
        },
        Select: 'COUNT',
      })
    );

    const totalCount = countResult.Count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    // ページネーション対応でログを取得（降順 = 最新順）
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': this.buildPK(userId),
          ':skPrefix': this.buildSKPrefix(bookId),
        },
        ScanIndexForward: false, // 降順（最新順）
        Limit: limit * page, // 必要なページまでのアイテムを取得
      })
    );

    const allItems = result.Items ?? [];
    const startIndex = (page - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);
    const logs = paginatedItems.map((item) => this.toBattleLog(item));

    return {
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private toBattleLog(item: Record<string, unknown>): BattleLog {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PK, SK, ...log } = item;
    return log as unknown as BattleLog;
  }
}
