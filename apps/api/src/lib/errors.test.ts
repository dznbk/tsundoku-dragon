import { describe, it, expect } from 'vitest';
import { AppError, BadRequestError } from './errors';

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
