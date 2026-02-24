import { describe, it, expect } from 'vitest';
import { AppError, BadRequestError, NotFoundError } from './errors';

describe('AppError', () => {
  it('statusCodeとmessageを保持する', () => {
    const error = new AppError(400, 'test error');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('test error');
    expect(error.name).toBe('AppError');
  });

  it('Errorのインスタンスである', () => {
    const error = new AppError(500, 'test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('BadRequestError', () => {
  it('statusCodeが400である', () => {
    const error = new BadRequestError('invalid input');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('invalid input');
    expect(error.name).toBe('BadRequestError');
  });

  it('AppErrorのインスタンスである', () => {
    const error = new BadRequestError('test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(BadRequestError);
  });
});

describe('NotFoundError', () => {
  it('statusCodeが404である', () => {
    const error = new NotFoundError('not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('not found');
    expect(error.name).toBe('NotFoundError');
  });

  it('AppErrorのインスタンスである', () => {
    const error = new NotFoundError('test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NotFoundError);
  });
});
