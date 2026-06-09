import { describe, it, expect } from 'vitest';
import { AppError, BadRequestError, NotFoundError, ErrorCode } from './errors';

describe('ErrorCode', () => {
  it('全てのエラーコードが定義されている', () => {
    expect(ErrorCode.BOOK_NOT_FOUND).toBe('BOOK_NOT_FOUND');
    expect(ErrorCode.CANNOT_UPDATE_ARCHIVED_BOOK).toBe(
      'CANNOT_UPDATE_ARCHIVED_BOOK'
    );
    expect(ErrorCode.BOOK_IS_ALREADY_ARCHIVED).toBe('BOOK_IS_ALREADY_ARCHIVED');
    expect(ErrorCode.BOOK_NOT_IN_READING_STATUS).toBe(
      'BOOK_NOT_IN_READING_STATUS'
    );
    expect(ErrorCode.CAN_ONLY_RESET_COMPLETED_BOOKS).toBe(
      'CAN_ONLY_RESET_COMPLETED_BOOKS'
    );
  });
});

describe('AppError', () => {
  it('statusCodeとmessageを保持する', () => {
    const error = new AppError(400, 'test error');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('test error');
    expect(error.name).toBe('AppError');
  });

  it('codeを保持する', () => {
    const error = new AppError(404, 'not found', ErrorCode.BOOK_NOT_FOUND);

    expect(error.code).toBe(ErrorCode.BOOK_NOT_FOUND);
  });

  it('codeが未指定の場合はundefined', () => {
    const error = new AppError(500, 'test');

    expect(error.code).toBeUndefined();
  });

  it('Errorのインスタンスである', () => {
    const error = new AppError(500, 'test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('BadRequestError', () => {
  it('statusCodeが400でcodeを保持する', () => {
    const error = new BadRequestError(
      ErrorCode.CANNOT_UPDATE_ARCHIVED_BOOK,
      'Cannot update archived book'
    );

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ErrorCode.CANNOT_UPDATE_ARCHIVED_BOOK);
    expect(error.message).toBe('Cannot update archived book');
    expect(error.name).toBe('BadRequestError');
  });

  it('AppErrorのインスタンスである', () => {
    const error = new BadRequestError(
      ErrorCode.BOOK_IS_ALREADY_ARCHIVED,
      'test'
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(BadRequestError);
  });
});

describe('NotFoundError', () => {
  it('statusCodeが404でcodeを保持する', () => {
    const error = new NotFoundError(ErrorCode.BOOK_NOT_FOUND, 'Book not found');

    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ErrorCode.BOOK_NOT_FOUND);
    expect(error.message).toBe('Book not found');
    expect(error.name).toBe('NotFoundError');
  });

  it('AppErrorのインスタンスである', () => {
    const error = new NotFoundError(ErrorCode.BOOK_NOT_FOUND, 'test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NotFoundError);
  });
});
