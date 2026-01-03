import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
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

  private toBook(item: Record<string, unknown>): Book {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PK, SK, ...book } = item;
    return book as unknown as Book;
  }
}
