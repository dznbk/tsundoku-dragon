import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient, type Env } from '../lib/dynamodb';

export interface GlobalSkill {
  name: string;
  category: string;
}

export interface UserSkill {
  name: string;
  createdAt: string;
}

export class SkillRepository {
  private client;
  private tableName: string;

  constructor(env: Env) {
    this.client = createDynamoDBClient(env);
    this.tableName = env.DYNAMODB_TABLE_NAME;
  }

  async findGlobalSkills(): Promise<GlobalSkill[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': 'GLOBAL',
          ':skPrefix': 'SKILL#',
        },
      })
    );
    return (result.Items ?? []).map((item) => ({
      name: (item.SK as string).replace('SKILL#', ''),
      category: item.category as string,
    }));
  }

  async findUserCustomSkills(userId: string): Promise<UserSkill[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'CUSTOM_SKILL#',
        },
      })
    );
    return (result.Items ?? []).map((item) => ({
      name: (item.SK as string).replace('CUSTOM_SKILL#', ''),
      createdAt: item.createdAt as string,
    }));
  }
}
