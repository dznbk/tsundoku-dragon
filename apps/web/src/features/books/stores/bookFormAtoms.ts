import { atom } from 'jotai';

// フォーム入力値
export const titleAtom = atom('');
export const isbnAtom = atom('');
export const totalPagesAtom = atom('');
export const skillsAtom = atom<string[]>([]);

// フォームエラー
export const formErrorsAtom = atom<{
  title?: string;
  totalPages?: string;
}>({});

// 送信状態
export const isSubmittingAtom = atom(false);
export const submitErrorAtom = atom<string | null>(null);
export const successMessageAtom = atom<string | null>(null);

// ISBN自動取得状態
export const bookInfoLoadingAtom = atom(false);
export const coverUrlAtom = atom<string | null>(null);

// バリデーション（派生atom）
export const isFormValidAtom = atom((get) => {
  const title = get(titleAtom);
  const totalPages = get(totalPagesAtom);
  const pages = parseInt(totalPages, 10);
  return title.trim().length > 0 && !isNaN(pages) && pages > 0;
});

// API送信用データ（派生atom）
export const formDataAtom = atom((get) => ({
  title: get(titleAtom).trim(),
  isbn: get(isbnAtom).trim() || undefined,
  totalPages: parseInt(get(totalPagesAtom), 10),
  skills: get(skillsAtom).length > 0 ? get(skillsAtom) : undefined,
}));

// リセットアクション
export const resetFormAtom = atom(null, (_get, set) => {
  set(titleAtom, '');
  set(isbnAtom, '');
  set(totalPagesAtom, '');
  set(skillsAtom, []);
  set(coverUrlAtom, null);
  set(formErrorsAtom, {});
  set(submitErrorAtom, null);
  set(successMessageAtom, null);
});
