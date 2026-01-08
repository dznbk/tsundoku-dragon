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

- 開始: 2026-01-07
- 完了: 2026-01-07

---

## フェーズ1: 基盤構築

- [x] Jotai パッケージを apps/web に追加
- [x] features/books/ ディレクトリ構造を作成
- [x] bookFormAtoms.ts を作成（フォーム状態管理）

## フェーズ2: NDL API連携

- [x] ndlApi.ts を作成（ISBN→書誌情報取得）
- [x] useBookInfo.ts を作成（debounce付きフック）

## フェーズ3: フォームコンポーネント

- [x] BookCoverPreview.tsx を作成（書影プレビュー）
- [x] BookForm.tsx を作成（フォーム本体）

## フェーズ4: スキルAPI（バックエンド）

- [x] skillRepository.ts を作成（データアクセス）
- [x] skillService.ts を作成（ビジネスロジック）
- [x] skills.ts ルートを作成（GET /skills）
- [x] index.ts にスキルルートを登録

## フェーズ5: スキルタグ入力

- [x] useSkillSuggestions.ts を作成（候補取得フック）
- [x] SkillTagInput.tsx を作成（タグ入力UI）

## フェーズ6: 本登録API連携

- [x] bookApi.ts を作成（フロントエンドAPI呼び出し）

## フェーズ7: ページ統合

- [x] BookRegisterPage.tsx を作成（ページコンポーネント）
- [x] App.tsx にルーティング追加

## フェーズ8: テスト

- [x] bookFormAtoms.test.ts を作成
- [x] ndlApi.test.ts を作成
- [x] SkillTagInput.test.tsx を作成
- [x] skills.test.ts を作成（APIテスト）

## フェーズ9: 品質チェック

- [x] テストが通ることを確認 (`npm test`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)

---

## 振り返り

### うまくいったこと

- 設計書（docs/screen-book-register.md）に詳細が記載されていたため、実装がスムーズに進んだ
- 既存のバックエンドパターン（books API）を参考に、skills APIを同じアーキテクチャで実装できた
- Jotaiの導入が初めてだったが、シンプルなAPI設計で学習コストが低かった
- テスト、リント、型チェックが全てパスし、品質を担保できた

### 改善点

- テストカバレッジが不足している（useBookInfo, BookForm等のテストが未実装）
- BookRegisterPageでローカル状態とJotai状態を二重管理している（シンプル化の余地あり）
- AbortControllerを作成しているが実際には使用していない（リソース管理の改善余地）

### 次回への学び

- 設計書を先に詳細化しておくと、実装がスムーズに進む
- 状態管理は一箇所に集約する（ローカル状態とグローバル状態の混在を避ける）
- テストは実装と同時に書くことで、カバレッジ不足を防げる

### 申し送り事項

- **追加テスト**: useBookInfo.test.ts, BookForm.test.tsx の実装を推奨
- **リファクタリング**: BookRegisterPageのローカル状態をJotai atomに統合
- **パフォーマンス**: スキル候補のキャッシュ実装（現状は問題ないが、明示的にした方が安全）
