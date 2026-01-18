// 共通の型定義
// TODO: 実装時に追加

export type BookStatus = 'reading' | 'completed' | 'archived';

export interface Book {
  id: string;
  userId: string;
  title: string;
  isbn?: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  skills: string[];
  round: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  name: string;
  level: number;
  totalExp: number;
}

export interface BattleLog {
  id: string;
  bookId: string;
  userId: string;
  pagesRead: number;
  memo?: string;
  createdAt: string;
}
