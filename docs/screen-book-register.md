# 本の登録画面 設計書

更新日: 2026-01-07

## 概要

新しい積ん読を「敵（ドラゴン）」として登録し、戦いの準備をする画面。

**画面の目的**: 買った本・読みたい本を「敵」として登録し、討伐対象に追加する。

---

## 設計選択

| 項目         | 選択                                            |
| ------------ | ----------------------------------------------- |
| レイアウト   | シングルページフォーム                          |
| スキル選択UI | タグ入力（オートコンプリート付き）              |
| 書影         | ISBNからリアルタイムプレビュー                  |
| ページ数     | ISBN入力時に自動取得（NDL API）、手動変更も可能 |
| 登録完了後   | 成功メッセージ表示、続けて登録可能              |
| スキルマスタ | グローバルスキルのシードデータ投入              |
| 状態管理     | Jotai                                           |

---

## 入力項目

| フィールド | 必須 | 入力形式 | バリデーション | 備考                             |
| ---------- | ---- | -------- | -------------- | -------------------------------- |
| title      | ○    | テキスト | 1文字以上      | -                                |
| totalPages | ○    | 数値     | 正の整数       | ISBN入力時に自動取得、手動変更可 |
| isbn       | ×    | テキスト | 10桁 or 13桁   | 書影・ページ数取得に使用         |
| skills     | ×    | タグ入力 | 複数選択可     | 新規追加可                       |

---

## ISBN入力時の自動取得機能

### NDL OpenSearch API

```
GET https://ndlsearch.ndl.go.jp/api/opensearch?isbn={ISBN}
```

**取得できる情報:**

- `dc:extent`: ページ数（例: "466p"）
- 書影URL: `https://ndlsearch.ndl.go.jp/thumbnail/{ISBN}.jpg`

### 自動取得フロー

```
ISBN入力 (debounce 500ms)
    ↓
NDL OpenSearch API呼び出し
    ↓
XMLレスポンスをパース
    ↓
┌─────────────────────────────────────┐
│ ページ数: dc:extent から抽出        │
│   "466p" → 466                      │
│   正規表現: /(\d+)p/                │
├─────────────────────────────────────┤
│ 書影: thumbnail URL を設定          │
└─────────────────────────────────────┘
    ↓
フォームに自動入力（ユーザーは変更可能）
```

---

## UI構成

### モバイル（base〜sm）

```
┌─────────────────────────────────┐
│ ← 戻る        本を登録する      │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────┐     │
│  │                       │     │
│  │      書影プレビュー    │     │
│  │       (中央配置)       │     │
│  │                       │     │
│  └───────────────────────┘     │
│                                 │
│  タイトル *                     │
│  [__________________________]   │
│                                 │
│  ISBN                           │
│  [__________________________]   │
│                                 │
│  ページ数 * (自動取得)          │
│  [________] ページ              │
│                                 │
│  スキル                         │
│  [React] [TS] [+入力_____▼]    │
│                                 │
│  ┌───────────────────────┐     │
│  │    討伐対象に追加     │     │
│  └───────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

### タブレット・PC（md〜lg）

```
┌─────────────────────────────────────────────────┐
│ ← 戻る                           本を登録する   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────┐  タイトル *                      │
│  │           │  [________________________________]
│  │   書影    │                                  │
│  │ プレビュー │  ISBN                            │
│  │           │  [________________________________]
│  │           │                                  │
│  │           │  ページ数 * (自動取得)            │
│  └───────────┘  [________] ページ               │
│                                                 │
│  スキル                                         │
│  [React] [TypeScript] [Go] [+入力_________▼]   │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │          討伐対象に追加             │        │
│  └─────────────────────────────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ファイル構成

### フロントエンド

```
apps/web/src/
├── features/
│   └── books/
│       ├── components/
│       │   ├── BookForm.tsx              # フォーム本体
│       │   ├── BookForm.module.css
│       │   ├── BookCoverPreview.tsx      # 書影プレビュー
│       │   ├── BookCoverPreview.module.css
│       │   ├── SkillTagInput.tsx         # タグ入力
│       │   ├── SkillTagInput.module.css
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useBookInfo.ts            # ISBN→書誌情報取得
│       │   └── useSkillSuggestions.ts    # スキル候補取得
│       ├── stores/
│       │   └── bookFormAtoms.ts          # Jotai Atoms
│       ├── services/
│       │   ├── bookApi.ts                # 本登録API
│       │   └── ndlApi.ts                 # NDL API呼び出し
│       └── index.ts
├── pages/
│   ├── BookRegisterPage.tsx
│   └── BookRegisterPage.module.css
└── App.tsx                               # ルーティング追加
```

### バックエンド

```
apps/api/src/
├── routes/skills.ts                      # GET /skills
├── services/skillService.ts
├── repositories/skillRepository.ts
└── scripts/seed-global-skills.ts         # シードスクリプト
```

---

## コンポーネント設計

### BookRegisterPage

**責務**: ページレイアウト、成功/エラーメッセージ表示

```typescript
interface Props {
  onBack: () => void; // 戻るボタン
}
```

### BookForm

**責務**: フォーム全体のレイアウト、送信処理

```typescript
interface Props {
  onSubmit: (data: CreateBookInput) => Promise<void>;
  isSubmitting: boolean;
}
```

### BookCoverPreview

**責務**: ISBNから書影取得・表示

```typescript
interface Props {
  isbn: string;
  coverUrl: string | null;
  isLoading: boolean;
  className?: string;
}
```

### SkillTagInput

**責務**: タグ追加/削除、オートコンプリート

```typescript
interface Props {
  value: string[];
  onChange: (skills: string[]) => void;
  suggestions: string[];
  isLoadingSuggestions: boolean;
}
```

**キーボード操作**:

- Enter: タグ追加（候補選択 or 新規）
- Backspace: 末尾タグ削除
- ↑↓: 候補選択

**アクセシビリティ**:

- `role="combobox"`, `role="listbox"`, `role="option"`
- `aria-expanded`, `aria-autocomplete="list"`
- `aria-activedescendant`（キーボード選択）

---

## Jotai Atoms設計

```typescript
// features/books/stores/bookFormAtoms.ts
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
export const resetFormAtom = atom(null, (get, set) => {
  set(titleAtom, '');
  set(isbnAtom, '');
  set(totalPagesAtom, '');
  set(skillsAtom, []);
  set(coverUrlAtom, null);
  set(formErrorsAtom, {});
  set(submitErrorAtom, null);
  set(successMessageAtom, null);
});
```

---

## API設計

### 既存API（変更なし）

```
POST /books
Request: { title, isbn?, totalPages, skills? }
Response: Book object (201)
```

### 新規API: スキル一覧取得

```
GET /skills
Response: {
  globalSkills: string[],  // グローバルスキル名
  userSkills: string[]     // ユーザー独自スキル名
}
```

### フロントエンド: NDL API呼び出し

```typescript
// features/books/services/ndlApi.ts
interface NdlBookInfo {
  totalPages: number | null;
  coverUrl: string | null;
}

export async function fetchBookInfoByIsbn(isbn: string): Promise<NdlBookInfo> {
  const cleanIsbn = isbn.replace(/-/g, '');
  const url = `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${cleanIsbn}`;

  const response = await fetch(url);
  const xmlText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  // ページ数抽出
  const extent = doc.querySelector('extent')?.textContent;
  const pagesMatch = extent?.match(/(\d+)p/);
  const totalPages = pagesMatch ? parseInt(pagesMatch[1], 10) : null;

  // 書影URL
  const coverUrl = `https://ndlsearch.ndl.go.jp/thumbnail/${cleanIsbn}.jpg`;

  return { totalPages, coverUrl };
}
```

---

## レスポンシブ対応

### ブレークポイント（visual-design.md準拠）

| 名前 | 幅       | レイアウト                   |
| ---- | -------- | ---------------------------- |
| base | 0〜      | 書影上、フォーム下（縦積み） |
| sm   | 640px〜  | 同上                         |
| md   | 768px〜  | 書影左、フォーム右（横並び） |
| lg   | 1024px〜 | max-width: 800px で中央配置  |

### CSS実装

```css
.formContainer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.coverSection {
  display: flex;
  justify-content: center;
}

.fieldsSection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .formContainer {
    flex-direction: row;
    padding: 24px;
  }

  .coverSection {
    flex-shrink: 0;
    width: 180px;
  }

  .fieldsSection {
    flex: 1;
  }
}

@media (min-width: 1024px) {
  .formContainer {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px;
  }
}
```

---

## シードデータ

### グローバルスキル初期データ

```typescript
const GLOBAL_SKILLS = [
  // プログラミング言語
  { name: 'JavaScript', category: 'プログラミング言語' },
  { name: 'TypeScript', category: 'プログラミング言語' },
  { name: 'Python', category: 'プログラミング言語' },
  { name: 'Go', category: 'プログラミング言語' },
  { name: 'Rust', category: 'プログラミング言語' },
  { name: 'PHP', category: 'プログラミング言語' },
  { name: 'Java', category: 'プログラミング言語' },
  { name: 'Ruby', category: 'プログラミング言語' },
  // インフラ・DB
  { name: 'AWS', category: 'インフラ' },
  { name: 'Docker', category: 'インフラ' },
  { name: 'Kubernetes', category: 'インフラ' },
  { name: 'DB', category: 'データベース' },
  { name: 'SQL', category: 'データベース' },
  // 設計・アーキテクチャ
  { name: '設計', category: 'アーキテクチャ' },
  { name: 'DDD', category: 'アーキテクチャ' },
  { name: 'クリーンアーキテクチャ', category: 'アーキテクチャ' },
  // フロントエンド
  { name: 'React', category: 'フロントエンド' },
  { name: 'Vue', category: 'フロントエンド' },
  { name: 'CSS', category: 'フロントエンド' },
  // その他
  { name: 'テスト', category: 'その他' },
  { name: 'セキュリティ', category: 'その他' },
  { name: 'アルゴリズム', category: 'その他' },
];
```

---

## バリデーション

### クライアントサイド

```typescript
const validate = (): boolean => {
  const newErrors: FormErrors = {};

  if (!title.trim()) {
    newErrors.title = 'タイトルは必須です';
  }

  const pages = parseInt(totalPages, 10);
  if (!totalPages) {
    newErrors.totalPages = 'ページ数は必須です';
  } else if (isNaN(pages) || pages <= 0) {
    newErrors.totalPages = 'ページ数は1以上の整数で入力してください';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### サーバーサイド（既存）

```typescript
// apps/api/src/types/api.ts
export const createBookSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  isbn: z.string().optional(),
  totalPages: z.number().int().positive('ページ数は1以上の整数です'),
  skills: z.array(z.string()).optional(),
});
```

---

## エラーハンドリング

### バリデーションエラー

```tsx
{
  errors.title && (
    <p className={styles.errorMessage} role="alert">
      {errors.title}
    </p>
  );
}
```

### APIエラー

```typescript
try {
  await bookApi.createBook(formData);
  setSuccessMessage('討伐対象に追加しました！');
  resetForm();
} catch (error) {
  if (error instanceof ApiError) {
    setSubmitError(
      error.status === 400
        ? '入力内容に誤りがあります'
        : '登録に失敗しました。しばらく経ってからお試しください'
    );
  }
}
```

---

## 成功時の動作

1. 成功メッセージ「討伐対象に追加しました！」を表示
2. フォームをリセット（空の状態に戻る）
3. 続けて別の本を登録可能

---

## アクセシビリティ

### フォーム要素

```tsx
<label htmlFor="title" className={styles.label}>
  タイトル <span className={styles.required}>*</span>
</label>
<input
  id="title"
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  aria-required="true"
  aria-invalid={!!errors.title}
  aria-describedby={errors.title ? 'title-error' : undefined}
/>
```

---

## テスト計画

### 単体テスト

| ファイル              | テスト内容                                   |
| --------------------- | -------------------------------------------- |
| bookFormAtoms.test.ts | バリデーション、派生atom、reset              |
| useBookInfo.test.ts   | debounce、XMLパース、エラー状態              |
| ndlApi.test.ts        | ページ数抽出（正規表現）、エラーハンドリング |

### コンポーネントテスト

| ファイル               | テスト内容                                     |
| ---------------------- | ---------------------------------------------- |
| SkillTagInput.test.tsx | Enter追加、Backspace削除、キーボード操作、aria |
| BookForm.test.tsx      | フォーム送信、自動入力後の変更                 |

### APIテスト

| ファイル       | テスト内容                 |
| -------------- | -------------------------- |
| skills.test.ts | GET /skills レスポンス形式 |

---

## 実装順序

1. Jotai導入（パッケージ追加）
2. features/books/ 基盤構築（ディレクトリ、bookFormAtoms.ts）
3. NDL API（ndlApi.ts、useBookInfo.ts）
4. BookForm コンポーネント（タイトル・ISBN・ページ数）
5. BookCoverPreview コンポーネント
6. スキルAPI（バックエンド routes/skills.ts）
7. SkillTagInput コンポーネント
8. シードスクリプト（seed-global-skills.ts）
9. BookRegisterPage・App.tsx ルーティング統合
10. テスト作成

---

## 参照ドキュメント

| ドキュメント                                                 | 参照内容                       |
| ------------------------------------------------------------ | ------------------------------ |
| [glossary.md](glossary.md)                                   | 用語統一（「積ん読」）         |
| [../planning/visual-design.md](../planning/visual-design.md) | カラー、フォント、レスポンシブ |
| [../planning/data-design.md](../planning/data-design.md)     | スキルのDB設計                 |
| [../planning/screen-design.md](../planning/screen-design.md) | 画面遷移                       |
