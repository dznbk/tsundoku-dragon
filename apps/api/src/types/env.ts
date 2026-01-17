/**
 * Cloudflare Workers環境変数の型定義
 */
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
  // CORS
  ALLOWED_ORIGINS?: string;
};
