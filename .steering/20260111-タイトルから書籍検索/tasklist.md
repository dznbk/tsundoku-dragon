# タスクリスト

## タスク完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール

- 全てのタスクを `[x]` にすること
- 未完了タスク `[ ]` を残したまま作業を終了しない
- 「時間の都合」「難しい」などの理由でのスキップは禁止

### スキップが許可されるケース

技術的理由に該当する場合のみ:

- 実装方針の変更により機能自体が不要になった
- アーキテクチャ変更により別の実装方法に置き換わった

スキップ時は理由を明記:

```markdown
- [~] タスク名 (スキップ理由: 具体的な技術的理由)
```

---

## 進捗

- 開始: 2026-01-11
- 完了: 2026-01-11

---

## フェーズ1: API層の実装

- [x] `NdlBookSearchResult`型を`ndlApi.ts`に追加
- [x] `fetchBooksByTitle`関数を`ndlApi.ts`に追加
- [x] XMLパースロジックで書籍以外の資料をフィルタリング
- [x] `ndlApi.test.ts`にタイトル検索のテストを追加

## フェーズ2: フック層の実装

- [x] `useTitleSearch.ts`フックを新規作成
- [x] debounce処理とAbortController実装
- [x] `useTitleSearch.test.ts`テストを追加

## フェーズ3: UI層の実装

- [x] `TitleSearchInput.tsx`コンポーネントを新規作成
- [x] `TitleSearchInput.module.css`スタイルを作成（SkillTagInputを参考）
- [x] キーボード操作（↑↓Enter Escape）を実装
- [x] `TitleSearchInput.test.tsx`テストを追加
- [x] `index.ts`にTitleSearchInputをエクスポート

## フェーズ4: 統合

- [x] `bookFormAtoms.ts`に検索結果選択時の自動入力ロジック用atomを追加
- [x] `BookForm.tsx`にTitleSearchInputを組み込む
- [x] 候補選択時にISBN・ページ数を自動入力する処理を実装
- [x] 既存のISBN入力機能が引き続き動作することを確認

## フェーズ5: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- 既存のSkillTagInputコンポーネントを参考にしたことで、UIパターンやスタイリングの一貫性を保てた
- NDL OpenSearch APIの活用により、ISBNがない書籍でもタイトル検索で登録可能になった
- debounce処理とAbortControllerの組み合わせで、効率的なAPI呼び出しを実現

### 改善点

- テストでXML宣言の前に空白があるとDOMParserがパースエラーを起こす問題に気づくのに時間がかかった
- fetch mockの設定において、Response型への適切なキャストが必要だった

### 次回への学び

- XML関連のテストでは、XML宣言（`<?xml ...?>`）が文書の先頭にあることを確認する
- vi.stubGlobalを使用したfetch mockでは、型アサーション（`as unknown as Response`）が必要
- jsdom環境でのDOMParser動作は本番ブラウザと同様の厳密なXML構文を要求する

---

## 追加対応 (2026-01-11)

### フィードバック内容

- タイトル検索でISBNがハイフン付き（例：`978-4-297-15354-0`）の場合、ISBNが抽出されない
- タイトル検索で書影が表示されない（ISBN抽出失敗が原因）
- ISBN直接入力時にタイトルが自動入力されなくなっている（既存機能のリグレッション）
- テストのmockに実在の書籍データが使われている

### 追加タスク

- [x] ISBN抽出ロジックでハイフン付きISBNを処理（`ndlApi.ts`）
- [x] ISBN入力時のタイトル自動入力機能の修復（`useBookInfo.ts`, `ndlApi.ts`）
- [x] テストのmockデータをダミー書籍に変更（`ndlApi.test.ts`）
- [x] 品質チェック（test, lint, typecheck, format:check）

### 追加対応の振り返り

- 完了日: 2026-01-11
- 対応内容:
  - ハイフン付きISBN（例: `978-4-297-15354-0`）を正しく抽出できるよう正規表現を修正
  - ISBN入力時にタイトルも自動入力される機能を追加（`NdlBookInfo`に`title`を追加）
  - タイトル自動入力は既存タイトルが空の場合のみ動作（ユーザー入力を上書きしない）
  - テストのmockデータを実在書籍からダミーデータに変更
- 学び: useEffect内で状態を参照しつつ依存配列から除外する場合はrefパターンを使用する
