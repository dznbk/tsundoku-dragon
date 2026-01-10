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

- 開始: 2026-01-10
- 完了: 2026-01-10

---

## フェーズ1: アセット準備

- [x] Google公式「G」ロゴSVGを`apps/web/public/assets/google-g-logo.svg`に配置
- [x] Robotoフォントを`apps/web/index.html`に追加

## フェーズ2: コンポーネント実装

- [x] `GoogleLoginButton.tsx`を作成（ダークテーマ、ガイドライン準拠）
- [x] `GoogleLoginButton.module.css`を作成
- [x] `GoogleLoginButton.test.tsx`を作成

## フェーズ3: 統合

- [x] `LoginPage.tsx`を更新してGoogleLoginButtonを使用
- [x] `LoginPage.module.css`から不要なloginButtonスタイルを削除
- [x] 旧`LoginButton.tsx`と`LoginButton.module.css`を削除

## フェーズ4: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- Googleブランドガイドラインの公式仕様（ダークテーマ: #131314背景、#8e918f枠線）を正確に実装できた
- プロジェクトのダークモードUIとGoogleボタンの統一感を維持しつつ、ガイドライン準拠を達成
- アクセシビリティ対応（aria-label, aria-hidden, role="alert"）を適切に実装
- 7つのテストケースで主要なシナリオを全てカバー（レンダリング、クリック、ローディング、エラー処理）
- 既存のLoginButtonコンポーネントを新しいGoogleLoginButtonに置き換え、不要ファイルを削除してコードベースをクリーンに保てた

### 改善点

- `aria-hidden="true"`の画像に対するテストで`getByRole('img', { hidden: true })`が動作しないことを発見。`container.querySelector`を使用する必要があった
- auth/index.tsのエクスポート更新を忘れてtypecheckで失敗。ファイル削除時は関連するエクスポートも確認が必要

### 次回への学び

- 外部サービスのブランドガイドライン準拠の場合、公式ドキュメントを事前に確認してカラーコード・サイズなどの仕様を正確に把握することが重要
- コンポーネント削除時は、そのコンポーネントをエクスポートしているindex.tsファイルも更新すること
- `aria-hidden="true"`要素のテストには`container.querySelector`を使用する（testing-libraryの`getByRole`は機能しない）
