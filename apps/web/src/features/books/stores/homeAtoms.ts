import { atom } from 'jotai';
import type { Book } from '../services/bookApi';
import type { UserSkillExp } from '../services/skillApi';

// 本一覧
export const booksAtom = atom<Book[]>([]);
export const booksLoadingAtom = atom(false);
export const booksErrorAtom = atom<string | null>(null);

// 討伐済み表示フラグ
export const showCompletedAtom = atom(false);

// スキル経験値
export const userSkillExpsAtom = atom<UserSkillExp[]>([]);
export const skillsLoadingAtom = atom(false);

// フィルタリングされた本一覧（派生atom）
export const filteredBooksAtom = atom((get) => {
  const books = get(booksAtom);
  const showCompleted = get(showCompletedAtom);

  if (showCompleted) {
    return books.filter((book) => book.status !== 'archived');
  }
  return books.filter((book) => book.status === 'reading');
});

// 総討伐数（派生atom）
export const completedCountAtom = atom((get) => {
  const books = get(booksAtom);
  return books.filter((book) => book.status === 'completed').length;
});

// 総読了ページ数（派生atom）
export const totalPagesReadAtom = atom((get) => {
  const books = get(booksAtom);
  return books.reduce((sum, book) => sum + book.currentPage, 0);
});

// 上位3スキル（派生atom）
export const topSkillsAtom = atom((get) => {
  const skills = get(userSkillExpsAtom);
  return [...skills]
    .sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return b.exp - a.exp;
    })
    .slice(0, 3);
});
