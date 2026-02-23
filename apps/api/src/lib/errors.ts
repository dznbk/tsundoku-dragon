import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * アプリケーションエラーの基底クラス
 * HTTPステータスコードを保持し、グローバルエラーハンドラで変換される
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * ビジネスルール違反を表す400エラー
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

/**
 * グローバルエラーハンドラ
 * AppErrorはステータスコード付きJSONで返し、それ以外は500を返す
 */
export function handleError(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    return c.json(
      { error: err.message },
      err.statusCode as ContentfulStatusCode
    );
  }
  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
}
