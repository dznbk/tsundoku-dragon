import {
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Book } from '@tsundoku-dragon/shared';
import { createDynamoDBClient, type Env } from '../lib/dynamodb';

export class BookRepository {
  private client;
  private tableName: string;

  constructor(env: Env) {
    this.client = createDynamoDBClient(env);
    this.tableName = env.DYNAMODB_TABLE_NAME;
  }

  private buildPK(userId: string): string {
    return `USER#${userId}`;
  }

  private buildSK(bookId: string): string {
    return `BOOK#${bookId}`;
  }

  async save(book: Book): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: this.buildPK(book.userId),
          SK: this.buildSK(book.id),
          ...book,
        },
      })
    );
  }

  async findByUserId(userId: string): Promise<Book[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': this.buildPK(userId),
          ':skPrefix': 'BOOK#',
        },
      })
    );
    return (result.Items ?? []).map((item) => this.toBook(item));
  }

  async findById(userId: string, bookId: string): Promise<Book | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: this.buildPK(userId),
          SK: this.buildSK(bookId),
        },
      })
    );
    return result.Item ? this.toBook(result.Item) : null;
  }

  async update(
    userId: string,
    bookId: string,
    updates: Partial<
      Pick<
        Book,
        | 'title'
        | 'totalPages'
        | 'skills'
        | 'status'
        | 'currentPage'
        | 'round'
        | 'updatedAt'
      >
    >
  ): Promise<Book | null> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) {
      return this.findById(userId, bookId);
    }

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: this.buildPK(userId),
          SK: this.buildSK(bookId),
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes ? this.toBook(result.Attributes) : null;
  }

  async softDelete(userId: string, bookId: string): Promise<void> {
    await this.update(userId, bookId, {
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });
  }

  private toBook(item: Record<string, unknown>): Book {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PK, SK, ...book } = item;
    return book as unknown as Book;
  }
}
