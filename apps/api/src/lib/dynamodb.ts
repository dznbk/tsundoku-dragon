import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type Env = {
  // DynamoDB
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  DYNAMODB_ENDPOINT?: string;
  DYNAMODB_TABLE_NAME: string;
  // Firebase Auth
  FIREBASE_PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  PUBLIC_JWK_CACHE_KV: KVNamespace;
  FIREBASE_AUTH_EMULATOR_HOST?: string;
};

export function createDynamoDBClient(env: Env): DynamoDBDocumentClient {
  const client = new DynamoDBClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    ...(env.DYNAMODB_ENDPOINT && { endpoint: env.DYNAMODB_ENDPOINT }),
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
}
