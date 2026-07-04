import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCoverUrl } from './coverUrl';

describe('getCoverUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ISBN-13から書影APIのURLを組み立てる', () => {
    expect(getCoverUrl('9784798150727')).toBe(
      'https://api.example.com/covers/9784798150727'
    );
  });

  it('ISBN-10から書影APIのURLを組み立てる', () => {
    expect(getCoverUrl('4798150720')).toBe(
      'https://api.example.com/covers/4798150720'
    );
  });

  it('ハイフン付きISBNを正規化する', () => {
    expect(getCoverUrl('978-4-7981-5072-7')).toBe(
      'https://api.example.com/covers/9784798150727'
    );
  });

  it('ISBNがnullの場合はnullを返す', () => {
    expect(getCoverUrl(null)).toBeNull();
  });

  it('ISBNがundefinedの場合はnullを返す', () => {
    expect(getCoverUrl(undefined)).toBeNull();
  });

  it('ISBNが空文字の場合はnullを返す', () => {
    expect(getCoverUrl('')).toBeNull();
  });

  it('桁数が不正なISBNの場合はnullを返す', () => {
    expect(getCoverUrl('12345')).toBeNull();
  });

  it('数字以外を含むISBNの場合はnullを返す', () => {
    expect(getCoverUrl('97847981507ab')).toBeNull();
  });
});
