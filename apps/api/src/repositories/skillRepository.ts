import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient, type Env } from '../lib/dynamodb';
import { levelFromExp } from '../lib/expCalculator';

export interface GlobalSkill {
  name: string;
  category: string;
}

export interface UserSkill {
  name: string;
  createdAt: string;
}

export interface UserSkillExp {
  name: string;
  exp: number;
  level: number;
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

  async hasGlobalSkill(skillName: string): Promise<boolean> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: 'GLOBAL',
          SK: `SKILL#${skillName}`,
        },
      })
    );
    return result.Item !== undefined;
  }

  async hasUserCustomSkill(
    userId: string,
    skillName: string
  ): Promise<boolean> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `CUSTOM_SKILL#${skillName}`,
        },
      })
    );
    return result.Item !== undefined;
  }

  async saveUserCustomSkill(userId: string, skillName: string): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${userId}`,
          SK: `CUSTOM_SKILL#${skillName}`,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }

  async findUserSkillExps(userId: string): Promise<UserSkillExp[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'SKILL#',
        },
      })
    );
    return (result.Items ?? []).map((item) => ({
      name: (item.SK as string).replace('SKILL#', ''),
      exp: (item.exp as number) ?? 0,
      level: (item.level as number) ?? 1,
    }));
  }

  async findUserSkillExp(
    userId: string,
    skillName: string
  ): Promise<UserSkillExp | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `SKILL#${skillName}`,
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return {
      name: skillName,
      exp: (result.Item.exp as number) ?? 0,
      level: (result.Item.level as number) ?? 1,
    };
  }

  async upsertUserSkillExp(
    userId: string,
    skillName: string,
    expToAdd: number
  ): Promise<UserSkillExp> {
    // Step 1: exp をアトミックに加算
    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `SKILL#${skillName}`,
        },
        UpdateExpression: 'ADD exp :expToAdd',
        ExpressionAttributeValues: {
          ':expToAdd': expToAdd,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    if (!result.Attributes) {
      throw new Error(
        `DynamoDB UpdateCommand の応答に Attributes が含まれていません: userId=${userId}, skillName=${skillName}`
      );
    }
    const newExp = result.Attributes.exp as number;
    const newLevel = levelFromExp(newExp);

    // Step 2: level を更新（level は DynamoDB 予約語）
    // NOTE: Step 1 と Step 2 はアトミックではない。
    // Step 2 が失敗した場合、exp が加算されたまま level が古い状態で残るが、
    // 次回 upsertUserSkillExp が呼ばれると level は再計算されて修復される。
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `SKILL#${skillName}`,
        },
        UpdateExpression: 'SET #level = :newLevel',
        ExpressionAttributeNames: {
          '#level': 'level',
        },
        ExpressionAttributeValues: {
          ':newLevel': newLevel,
        },
      })
    );

    return {
      name: skillName,
      exp: newExp,
      level: newLevel,
    };
  }
}
