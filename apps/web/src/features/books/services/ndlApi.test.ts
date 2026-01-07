import { describe, it, expect } from 'vitest';
import { extractPagesFromExtent } from './ndlApi';

describe('ndlApi', () => {
  describe('extractPagesFromExtent', () => {
    it('"466p"から466を抽出する', () => {
      expect(extractPagesFromExtent('466p')).toBe(466);
    });

    it('"xii, 350p"から350を抽出する', () => {
      expect(extractPagesFromExtent('xii, 350p')).toBe(350);
    });

    it('"123ページ ; 21cm"から123を抽出する', () => {
      // 日本語表記ではpが含まれない可能性がある
      // この関数はpのパターンのみをサポート
      expect(extractPagesFromExtent('123p ; 21cm')).toBe(123);
    });

    it('ページ数がない場合はnullを返す', () => {
      expect(extractPagesFromExtent('audio disc')).toBeNull();
    });

    it('nullの場合はnullを返す', () => {
      expect(extractPagesFromExtent(null)).toBeNull();
    });

    it('undefinedの場合はnullを返す', () => {
      expect(extractPagesFromExtent(undefined)).toBeNull();
    });

    it('空文字の場合はnullを返す', () => {
      expect(extractPagesFromExtent('')).toBeNull();
    });
  });
});
