import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import {
  titleAtom,
  isbnAtom,
  totalPagesAtom,
  skillsAtom,
  formErrorsAtom,
  isFormValidAtom,
  formDataAtom,
  coverUrlAtom,
  resetFormAtom,
} from './bookFormAtoms';

describe('bookFormAtoms', () => {
  describe('isFormValidAtom', () => {
    it('タイトルとページ数が有効な場合はtrueを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(totalPagesAtom, '100');

      expect(store.get(isFormValidAtom)).toBe(true);
    });

    it('タイトルが空の場合はfalseを返す', () => {
      const store = createStore();
      store.set(titleAtom, '');
      store.set(totalPagesAtom, '100');

      expect(store.get(isFormValidAtom)).toBe(false);
    });

    it('タイトルが空白のみの場合はfalseを返す', () => {
      const store = createStore();
      store.set(titleAtom, '   ');
      store.set(totalPagesAtom, '100');

      expect(store.get(isFormValidAtom)).toBe(false);
    });

    it('ページ数が空の場合はfalseを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(totalPagesAtom, '');

      expect(store.get(isFormValidAtom)).toBe(false);
    });

    it('ページ数が0以下の場合はfalseを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(totalPagesAtom, '0');

      expect(store.get(isFormValidAtom)).toBe(false);
    });

    it('ページ数が数値でない場合はfalseを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(totalPagesAtom, 'abc');

      expect(store.get(isFormValidAtom)).toBe(false);
    });
  });

  describe('formDataAtom', () => {
    it('フォームデータを正しく返す', () => {
      const store = createStore();
      store.set(titleAtom, '  テスト本  ');
      store.set(isbnAtom, '978-4-xxx');
      store.set(totalPagesAtom, '200');
      store.set(skillsAtom, ['React', 'TypeScript']);

      const formData = store.get(formDataAtom);

      expect(formData.title).toBe('テスト本');
      expect(formData.isbn).toBe('978-4-xxx');
      expect(formData.totalPages).toBe(200);
      expect(formData.skills).toEqual(['React', 'TypeScript']);
    });

    it('ISBNが空の場合はundefinedを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(isbnAtom, '');
      store.set(totalPagesAtom, '100');

      const formData = store.get(formDataAtom);

      expect(formData.isbn).toBeUndefined();
    });

    it('スキルが空の場合はundefinedを返す', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(totalPagesAtom, '100');
      store.set(skillsAtom, []);

      const formData = store.get(formDataAtom);

      expect(formData.skills).toBeUndefined();
    });
  });

  describe('resetFormAtom', () => {
    it('全ての入力値をリセットする', () => {
      const store = createStore();
      store.set(titleAtom, 'テスト本');
      store.set(isbnAtom, '978-4-xxx');
      store.set(totalPagesAtom, '200');
      store.set(skillsAtom, ['React']);
      store.set(coverUrlAtom, 'https://example.com/cover.jpg');
      store.set(formErrorsAtom, { title: 'エラー' });

      store.set(resetFormAtom);

      expect(store.get(titleAtom)).toBe('');
      expect(store.get(isbnAtom)).toBe('');
      expect(store.get(totalPagesAtom)).toBe('');
      expect(store.get(skillsAtom)).toEqual([]);
      expect(store.get(coverUrlAtom)).toBeNull();
      expect(store.get(formErrorsAtom)).toEqual({});
    });
  });
});
