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

- 開始: 2026-02-26
- 完了: 2026-02-26

---

## フェーズ1: 基盤

- [x] `apps/web/src/shared/hooks/useAsyncData.ts` を作成
- [x] `apps/web/src/shared/hooks/useAsyncData.test.ts` を作成

## フェーズ2: 既存hook書き換え

- [~] `useBook` のfetch部分を `useAsyncData` で書き換え (スキップ理由: ミューテーション操作がsetBook/setErrorに直接アクセスするため、useAsyncDataのカプセル化と相性が悪い。無理に共通化すると複雑になる)
- [x] `useSkills` を `useAsyncData` で書き換え

## フェーズ3: 品質チェック

- [x] テストが通ることを確認 (`npm run test:all`)
- [x] リントエラーがないことを確認 (`npm run lint`)
- [x] 型エラーがないことを確認 (`npm run typecheck`)
- [x] フォーマットエラーがないことを確認 (`npm run format:check`)

---

## 振り返り

### うまくいったこと

- `useAsyncData` の設計がシンプルに収まり、`useSkills` の書き換えで約30行 → 約15行に削減できた
- `enabled` オプションで `if (!user) return` パターンを共通化でき、hook間の一貫性が向上した
- 7つのユニットテストで主要なパターン（成功/失敗/enabled制御/refetch/初期値）をカバーできた

### 計画と実績の差分

- **計画**: `useBook` と `useSkills` の2つを書き換え予定
- **実績**: `useSkills` のみ書き換え。`useBook` はミューテーション操作（update/delete/reset）が `setBook`/`setError` に直接アクセスするため、`useAsyncData` のカプセル化と相性が悪くスキップ

### 改善点

- issueの5 hookのうち実際に共通化できたのは1つだけ。Jotai atom依存（useBooks/useUserStatus）やページネーション（useBattleLogs）やミューテーション（useBook）など、各hookの個別事情が共通化の障壁になった
- `useAsyncData` は現時点で1箇所からのみ利用。`shared/` 配置の根拠として、今後の追加利用者を見込む必要がある

### 次回への学び

- データフェッチhookの共通化は、純粋なread-onlyのhookには効果的だが、ミューテーション・グローバルストア・ページネーションを持つhookには別のアプローチが必要
- 共通化の範囲を計画段階で各hookの構造を詳細に分析してから決めるべき。issueの記載内容を鵜呑みにせず、実コードの個別事情を先に洗い出す
- TanStack Query のようなライブラリ導入が、全hookの統一的な共通化には最も効果的な選択肢かもしれない（今回のスコープ外だが将来検討の余地あり）
