import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * アプリケーション全体のエラーコードを一元管理する enum
 */
export enum ErrorCode {
  BOOK_NOT_FOUND = 'BOOK_NOT_FOUND',
  CANNOT_UPDATE_ARCHIVED_BOOK = 'CANNOT_UPDATE_ARCHIVED_BOOK',
  BOOK_IS_ALREADY_ARCHIVED = 'BOOK_IS_ALREADY_ARCHIVED',
  BOOK_NOT_IN_READING_STATUS = 'BOOK_NOT_IN_READING_STATUS',
  CAN_ONLY_RESET_COMPLETED_BOOKS = 'CAN_ONLY_RESET_COMPLETED_BOOKS',
}

/**
 * アプリケーションエラーの基底クラス
 * HTTPステータスコードとエラーコードを保持し、グローバルエラーハンドラで変換される
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: ErrorCode
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * ビジネスルール違反を表す400エラー
 */
export class BadRequestError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

/**
 * リソースが見つからないことを表す404エラー
 */
export class NotFoundError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

/**
 * グローバルエラーハンドラ
 * AppErrorはステータスコード付きJSONで返し、それ以外は500を返す
 */
export function handleError(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    return c.json(
      { error: err.message, ...(err.code && { code: err.code }) },
      err.statusCode as ContentfulStatusCode
    );
  }
  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
}
