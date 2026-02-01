# 開発コンテキスト

このファイルは開発セッション間でコンテキストを引き継ぐためのものです。

## プロジェクト概要

**積読＆ドラゴンズ** - 積読消化をRPGのように楽しくやれるWebアプリ

詳細は [planning/product-concept.md](../planning/product-concept.md) を参照。

---

## 技術スタック（決定済み）

| 項目                     | 選定                      | 備考                                     |
| ------------------------ | ------------------------- | ---------------------------------------- |
| フロントエンド           | React + TypeScript        | Vite使用                                 |
| ホスティング（フロント） | Cloudflare Pages          |                                          |
| API                      | Cloudflare Workers + Hono | TypeScript                               |
| DB                       | DynamoDB                  | プロビジョンドモード（無料枠内に収める） |
| 認証                     | Firebase Auth             | Google, Twitter認証                      |
| 画像ストレージ           | Cloudflare R2             | 敵画像の保存用                           |

### 選定理由

**Cloudflare Pages / Workers / R2**

- 既にCloudflareでドメイン（deepon.dev）を運用しており、統一したかった
- 無料枠が大きく、ランニングコストを抑えられる

**DynamoDB**

- MySQLの経験が多いため、違うDBを学習したかった
- AWSアカウントを既に持っている
- 無料枠（ストレージ25GB、25RCU/WCU）で個人開発には十分

**Firebase Auth**

- 認証自体は無料（電話認証のみ有料）
- Google, Twitter認証の設定が簡単
- 情報が多く、トラブル時に解決しやすい

**React + TypeScript**

- 既存の経験あり（deepon.dev, app001.deepon.devで使用）

**Hono**

- Cloudflare Workers向けに最適化された軽量Webフレームワーク
- Express風のAPIで学習コストが低い
- TypeScript対応が良い
- 日本人作者で日本語情報が多い

### DynamoDB注意点

- 必ず**プロビジョンドモード**で作成（オンデマンドだと課金される）
- Auto Scalingは無効にする
- AWS Budgetsでアラート設定推奨

---

## 現在の進捗

### 完了

- プロダクト設計（コンセプト、データ設計、経験値システム、画面設計）
- 開発プロセス決定（GitHub Flow、Conventional Commits、テスト方針）
- CLAUDE.md作成
- プロジェクト初期セットアップ（モノレポ構成）
- CI整備（GitHub Actions: lint/typecheck/test/build、Vitest導入）
- DynamoDB接続基盤（AWS SDK v3、DynamoDB Local、テーブル作成）
- Book CRUD API（POST/GET /books、GET /books/:id）
- 開発プロセス改善（husky + lint-staged導入）
- Firebase Auth連携（API認証ミドルウェア実装）
- Firebaseコンソール設定（プロジェクト作成、Google認証有効化）
- フロントエンド認証基盤（Firebase SDK、AuthContext、ProtectedRoute、authApi）
- UI/デザイン改修（visual-design.md準拠、DQウィンドウ/ボタンコンポーネント、ロゴ配置）
- 本の登録画面（BookRegisterPage、BookForm、SkillTagInput、BookCoverPreview、Jotai統合）
- テストポリシードキュメント（docs/integration-testing.md）
- DynamoDB Local統合テスト基盤（Vitest統合、setupFiles）
- BookRepository統合テスト
- CI統合テスト（GitHub Actions対応）
- Googleログインブランディング（GoogleLoginButton、Googleロゴ）
- continue-featureコマンド（フィードバック対応ワークフロー）
- タイトル検索機能（TitleSearchInput、NDL API、useTitleSearch）
- ホーム画面（本一覧）（BookGrid、BookCard、ProgressBar、UserStatus、CompletedToggle、BottomActionBar）
- ステージング環境構築（Cloudflare Workers、GitHub Actions CD、カスタムドメイン、Cloudflare Access）
- 本の詳細画面（BookDetailPage、BookInfo、BattleLogList、BookEditModal、編集/削除/再戦API）
- 戦闘画面UI基本（BattlePage、EnemyDisplay、HpBar、BattleInput、useBattle）
- 戦闘演出（#58）（BattleMessage、HPバー減少アニメーション、攻撃メッセージ）
- 討伐演出・レベルアップ表示（#59）（DefeatOverlay、LevelUpNotification、経験値獲得表示）
- スキル一覧画面（#60）（SkillListPage、SkillCard、ExpBar、ソート機能）

### 次にやること

1. 本番環境の構築
   - 計画: [planning/deployment-plan.md](../planning/deployment-plan.md)

### スキップ

- GitHubブランチ保護ルール（GitHub Freeのprivateリポジトリでは利用不可、public化後に設定）

## 未決定事項

### ワイヤーフレーム（スキップ可）

- 各画面の具体的なレイアウト
- コンポーネント設計
- → 実装しながら決める方針

---

## 決定済み事項サマリ

| 項目             | 決定内容                                 |
| ---------------- | ---------------------------------------- |
| ターゲット       | 一般書籍含む、一人利用                   |
| 認証             | SNS認証（複数デバイス対応のため）        |
| スキル構造       | フラット、ユーザー定義可能               |
| スキル選択       | 選択肢から選ぶ or 自由入力で新規追加     |
| スキルマスタ     | グローバル + ユーザー独自の2層構造       |
| レベルアップ     | あり                                     |
| 戦闘方式         | 一方的攻撃、ドラクエ風メッセージ         |
| 敵画像           | デフォルト1種、複数対応の構造で実装      |
| スキル表示       | MVP時点はリスト表示                      |
| 本とスキル       | 1冊に複数スキル紐づけ可能                |
| 進捗記録         | 差分ログ + 本に現在ページを保持          |
| 戦闘ログ         | 履歴として残す、メモは任意               |
| 再読             | 同じエントリで進捗リセット、周回数を記録 |
| ISBN/書影        | ISBN保存、書影はopenBD/NDLサーチで取得   |
| 経験値           | 1ページ = 1exp、討伐ボーナス10%          |
| 複数スキル経験値 | 各スキルに同じ経験値（分割しない）       |
| レベル計算式     | `Lv^1.5 × 50`（累乗式）                  |
| レベル上限       | 9999                                     |
| 再読ボーナス     | なし                                     |

### データ設計

詳細は [planning/data-design.md](../planning/data-design.md) を参照。

### 経験値・レベルシステム

詳細は [planning/exp-system.md](../planning/exp-system.md) を参照。

### 画面設計

詳細は [planning/screen-design.md](../planning/screen-design.md) を参照。

---

## 開発の進め方（想定）

1. まず本の登録機能を作ってデプロイして動作確認
2. 順次機能を追加していく

---

## 議論ログ

### 2026-01-28 経験値計算・スキル更新ロジック実装

**実施した内容：**

- 戦闘ログ記録時（`POST /books/:id/logs`）の経験値計算と各スキルへの付与
- 経験値計算のユーティリティ関数（純粋関数）
- スキル経験値のUpsert処理（並列処理）
- レスポンス拡張（expGained, defeatBonus, skillResults）

**作成・修正したファイル：**

| ファイル                                                                | 内容                                     |
| ----------------------------------------------------------------------- | ---------------------------------------- |
| `apps/api/src/lib/expCalculator.ts`（新規）                             | 経験値計算ユーティリティ                 |
| `apps/api/src/lib/expCalculator.test.ts`（新規）                        | 経験値計算テスト（15件）                 |
| `apps/api/src/repositories/skillRepository.ts`                          | findUserSkillExp, upsertUserSkillExp追加 |
| `apps/api/src/repositories/skillRepository.test.ts`                     | 新メソッドのユニットテスト追加           |
| `apps/api/src/repositories/skillRepository.integration.test.ts`（新規） | 統合テスト（7件）                        |
| `apps/api/src/services/bookService.ts`                                  | recordBattle拡張、updateSkillsExp追加    |
| `apps/api/src/services/bookService.test.ts`                             | 経験値関連テスト追加                     |

**経験値計算式:**

```typescript
// レベルに必要な経験値
expForLevel(level) = floor(level^1.5 × 50)

// 累積経験値からレベルを計算
levelFromExp(totalExp) // レベル上限: 9999

// 討伐ボーナス（総ページ数の10%）
defeatBonus(totalPages) = floor(totalPages × 0.1)
```

**RecordBattleResultの拡張：**

```typescript
interface RecordBattleResult {
  log: BattleLog;
  book: Book;
  defeat: boolean;
  expGained: number; // 追加: 獲得経験値（基本+ボーナス）
  defeatBonus: number; // 追加: 討伐ボーナス（0 or ボーナス値）
  skillResults: SkillResult[]; // 追加: 各スキルの結果
}

interface SkillResult {
  skillName: string;
  expGained: number;
  previousLevel: number;
  currentLevel: number;
  currentExp: number;
  leveledUp: boolean;
}
```

**技術的な決定：**

| 決定                          | 理由                                            |
| ----------------------------- | ----------------------------------------------- |
| 純粋関数でexpCalculator実装   | テストしやすい、副作用なし                      |
| Promise.allで並列処理         | 複数スキルの経験値更新を効率化                  |
| PutCommandでUpsert            | DynamoDBのネイティブ操作、UpdateCommandより簡潔 |
| 経験値計算はBookServiceに集約 | ビジネスロジックはService層に集約する設計方針   |

**学び：**

- 境界値テスト（レベル1の49exp、レベル2の50exp）は必須
- 並列処理で各スキルの経験値更新を行う際、previousExpの取得も並列化可能
- 累乗式のレベル計算では、上限チェックを忘れずに

---

### 2026-01-18 本の詳細画面 - 詳細設計

**議論した内容：**

- 戦闘ログの表示形式と件数
- 編集機能で変更可能にする項目
- 削除時の挙動（ソフトデリート vs ハードデリート）
- 再戦（進捗リセット）時の確認フロー

**決定事項：**

| 決定                                   | 理由                           |
| -------------------------------------- | ------------------------------ |
| 戦闘ログはシンプルリスト形式           | コンパクトで一覧性重視         |
| 最新20件 + ページネーション            | 大量ログでも軽量に表示         |
| 編集可能：タイトル、総ページ数、スキル | ISBNは本の識別子なので変更不可 |
| ソフトデリート（archived状態）         | 誤削除からの復元が可能         |
| 再戦は即時実行                         | ログは保持されるので確認不要   |

**必要なAPI（未実装）：**

| API                     | 用途                                 |
| ----------------------- | ------------------------------------ |
| `GET /books/:id/logs`   | 戦闘ログ一覧（ページネーション対応） |
| `PUT /books/:id`        | 本の編集                             |
| `DELETE /books/:id`     | ソフトデリート（archived状態に変更） |
| `POST /books/:id/reset` | 再戦（進捗リセット、周回数+1）       |

**更新したファイル：**

| ファイル                    | 内容                         |
| --------------------------- | ---------------------------- |
| `planning/screen-design.md` | 本の詳細画面の詳細仕様を追記 |

---

### 2026-01-18 ステージング環境構築完了

**実施した内容：**

- Cloudflare Workers へのデプロイ設定（Web + API）
- GitHub Actions による CI/CD パイプライン構築
- カスタムドメイン設定（stg.tsundoku.deepon.dev、api-stg.tsundoku.deepon.dev）
- CORS の環境別設定（`ALLOWED_ORIGINS` 環境変数）
- Cloudflare Access によるステージング環境のアクセス制限

**作成・修正したファイル：**

| ファイル                       | 内容                             |
| ------------------------------ | -------------------------------- |
| `.github/workflows/deploy.yml` | staging 自動デプロイワークフロー |
| `apps/web/wrangler.toml`       | Web Workers 設定                 |
| `apps/api/wrangler.toml`       | staging 環境設定追加             |
| `apps/api/src/index.ts`        | CORS を環境変数で制御            |
| `apps/api/src/types/env.ts`    | ALLOWED_ORIGINS 型追加           |
| `apps/api/src/index.test.ts`   | mockEnv 追加                     |
| `planning/deployment-plan.md`  | 進捗更新                         |

**技術的な決定：**

| 決定                                     | 理由                                                        |
| ---------------------------------------- | ----------------------------------------------------------- |
| Cloudflare Pages ではなく Workers を使用 | Cloudflare が両者を統合中、Workers で静的アセットも可能     |
| CORS を環境変数で制御                    | localhost/staging/production の設定を分離、セキュリティ向上 |
| Cloudflare Access で Web のみ保護        | API を保護すると fetch リクエストがブロックされる           |
| One-time PIN 認証                        | シンプルで追加設定不要                                      |

**学び：**

- Cloudflare Workers の `[assets]` ディレクティブで静的アセットをホスティング可能
- Vite 環境変数（`VITE_*`）はビルド時に注入が必要
- Firebase 承認済みドメインにステージングドメインを追加する必要がある
- Cloudflare Access は Web フロントのみに適用し、API は除外すべき

---

### 2026-01-14 ステージング・本番環境の構築計画

**議論した内容：**

- 次にやることの優先順位（機能実装 vs インフラ整備）
- デプロイ環境の構成（staging / production）
- Webホスティング先（Cloudflare Pages）
- CDトリガー（staging: main push自動、production: 手動/タグ）
- カスタムドメイン設計（deepon.dev を使用）

**決定事項：**

| 決定                                                                   | 理由                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| Cloudflare Pages (Direct Upload)                                       | APIがCloudflare Workersなので統一。GitHub Actionsから制御可能 |
| staging: main push → 自動デプロイ                                      | 開発中の動作確認を迅速に                                      |
| production: workflow_dispatch / タグ                                   | 本番リリースは明示的に制御                                    |
| ドメイン: tsundoku.deepon.dev (prod), stg.tsundoku.deepon.dev (stg)    | 環境.サービス.ドメインの一般的パターン                        |
| API: api.tsundoku.deepon.dev (prod), api-stg.tsundoku.deepon.dev (stg) | フロントと同じ命名規則                                        |

**構成:**

| レイヤー | staging                     | production              |
| -------- | --------------------------- | ----------------------- |
| Frontend | stg.tsundoku.deepon.dev     | tsundoku.deepon.dev     |
| API      | api-stg.tsundoku.deepon.dev | api.tsundoku.deepon.dev |
| DB       | tsundoku-dragon-staging     | tsundoku-dragon-prod    |

**計画ファイル:**

- [planning/deployment-plan.md](../planning/deployment-plan.md)

---

### 2026-01-11 タイトル検索機能

**実施した内容：**

- 本の登録画面にタイトルから書籍を検索できる機能を追加
- NDL OpenSearch APIを使用したインクリメンタル検索
- 検索候補から選択してISBN・ページ数・書影を自動入力

**作成・修正したファイル：**

| ファイル                                                      | 内容                           |
| ------------------------------------------------------------- | ------------------------------ |
| `apps/web/src/features/books/components/TitleSearchInput.tsx` | タイトル検索入力コンポーネント |
| `apps/web/src/features/books/hooks/useTitleSearch.ts`         | タイトル検索フック             |
| `apps/web/src/features/books/services/ndlApi.ts`              | NDL OpenSearch API拡張         |
| `apps/web/src/features/books/stores/bookFormAtoms.ts`         | 検索状態管理（Jotai）          |
| `apps/web/src/features/books/components/BookForm.tsx`         | TitleSearchInput統合           |
| `apps/api/src/index.ts`                                       | CORSミドルウェア追加           |

**技術的な決定：**

| 決定                            | 理由                                  |
| ------------------------------- | ------------------------------------- |
| フロントから直接NDL API呼び出し | NDL APIはCORSを許可済み、プロキシ不要 |
| debounce 500ms                  | 既存のISBN検索と統一                  |
| 検索結果10件制限                | パフォーマンスとUX考慮                |
| 資料種別フィルタリング          | 書籍以外（映像・音声等）を除外        |
| キーボード操作対応              | ↑↓Enterで候補選択可能                 |

**学び：**

- NDL OpenSearch APIはRSS形式のため、XMLパース処理が必要
- `xml2js`よりもブラウザ標準の`DOMParser`の方が軽量
- CORSエラー対応でOPTIONSプリフライトリクエストを適切に処理する必要がある

---

### 2026-01-11 continue-featureコマンド

**実施した内容：**

- 実装後のフィードバック対応ワークフローを定義する`/continue-feature`コマンドを追加
- 既存ステアリングを参照して追加タスクを管理できるようにした
- steeringスキルにフィードバック対応の運用ルールを追記

**作成・修正したファイル：**

| ファイル                               | 内容                         |
| -------------------------------------- | ---------------------------- |
| `.claude/commands/continue-feature.md` | continue-featureコマンド定義 |
| `.claude/skills/steering/SKILL.md`     | フィードバック対応ルール追記 |

**決定事項：**

| 決定                             | 理由                                     |
| -------------------------------- | ---------------------------------------- |
| 軽微な修正は直接実装             | ステアリング作成のオーバーヘッドを避ける |
| 継続作業は既存ステアリングに追記 | 関連タスクをまとめて管理                 |
| 判断基準を明文化                 | 迷わず判断できるように                   |

**学び：**

- `/add-feature`は新規機能、`/continue-feature`は既存機能の改善と明確に分離
- ステアリングファイルは作業履歴としても機能する

---

### 2026-01-10 Googleログインブランディング

**実施した内容：**

- Google Sign-In Branding Guidelinesに準拠したログインボタンデザインに変更
- Google公式「G」ロゴを使用
- ボタンテキストを「Googleでログイン」に統一

**作成・修正したファイル：**

| ファイル                                                        | 内容                   |
| --------------------------------------------------------------- | ---------------------- |
| `apps/web/src/features/auth/components/GoogleLoginButton.tsx`   | ガイドライン準拠ボタン |
| `apps/web/public/assets/google-g-logo.svg`                      | Google公式ロゴSVG      |
| `apps/web/src/features/auth/components/LoginButton.tsx`（削除） | 旧ボタンコンポーネント |

**技術的な決定：**

| 決定                   | 理由                            |
| ---------------------- | ------------------------------- |
| コンポーネント名を変更 | LoginButton → GoogleLoginButton |
| Google公式ロゴを使用   | ブランドガイドライン準拠        |
| 白背景ロゴボックス     | ダークモードでも視認性確保      |

**学び：**

- 外部サービスのブランドガイドラインは必ず確認すべき
- ロゴは公式のものを使用し、勝手に色を変えない

---

### 2026-01-10 CI統合テスト

**実施した内容：**

- GitHub ActionsのCIパイプラインで統合テストを実行できるように設定
- DynamoDB Localをサービスコンテナで起動

**作成・修正したファイル：**

| ファイル                   | 内容                       |
| -------------------------- | -------------------------- |
| `.github/workflows/ci.yml` | DynamoDB Localサービス追加 |

**技術的な決定：**

| 決定                         | 理由                           |
| ---------------------------- | ------------------------------ |
| DynamoDB LocalをDockerで起動 | CIでもローカルと同じ環境で実行 |
| 既存のテストステップに統合   | 新しいジョブを作らずシンプルに |

**学び：**

- GitHub Actionsの`services`でDynamoDB Localを起動できる
- ローカルとCIで同じテスト環境を保つことが重要

---

### 2026-01-10 BookRepository統合テスト

**実施した内容：**

- `BookRepository`の統合テストを作成
- 実際のDynamoDB Localに対してCRUD操作を検証

**作成したファイル：**

| ファイル                                                       | 内容                     |
| -------------------------------------------------------------- | ------------------------ |
| `apps/api/src/repositories/bookRepository.integration.test.ts` | BookRepository統合テスト |

**技術的な決定：**

| 決定                               | 理由                   |
| ---------------------------------- | ---------------------- |
| `.integration.test.ts`サフィックス | 統合テストを明示       |
| afterEachでテストデータクリア      | テスト間の独立性を保つ |

**学び：**

- 実際のDynamoDBに対するテストで、スキーマ設計の問題を早期発見できる
- テストデータのクリーンアップを忘れずに

---

### 2026-01-10 DynamoDB Local統合テスト基盤

**実施した内容：**

- Vitestで統合テストを実行するための基盤を整備
- DynamoDB Localとの接続設定、テーブル作成スクリプト

**作成・修正したファイル：**

| ファイル                                 | 内容                       |
| ---------------------------------------- | -------------------------- |
| `apps/api/vitest.integration.config.ts`  | 統合テスト用Vitest設定     |
| `apps/api/src/test/setup-integration.ts` | 統合テストセットアップ     |
| `apps/api/src/test/helpers/dynamodb.ts`  | テストヘルパー関数         |
| `apps/api/package.json`                  | test:integrationスクリプト |

**技術的な決定：**

| 決定                           | 理由                   |
| ------------------------------ | ---------------------- |
| 統合テスト用の別設定ファイル   | ユニットテストと分離   |
| setupFilesでテーブル作成       | テスト前に環境を整える |
| DynamoDB Localをlocalhost:8000 | デフォルトポートを使用 |

**学び：**

- Vitestの`setupFiles`でテスト前処理を実行できる
- テーブル作成はべき等性を持たせる（既存テーブルは削除してから作成）

---

### 2026-01-10 テストポリシードキュメント

**実施した内容：**

- mockの使用方針と統合テストの位置づけを明確化
- デトロイト派の考え方を文書化
- 統合テストの実行方法とデバッグ方法を記載

**作成・修正したファイル：**

| ファイル                         | 内容               |
| -------------------------------- | ------------------ |
| `docs/integration-testing.md`    | 統合テストガイド   |
| `docs/development-guidelines.md` | mockの使用方針追記 |

**決定事項：**

| 決定                         | 理由                     |
| ---------------------------- | ------------------------ |
| デトロイト派を採用           | 本物を使えるなら使うべき |
| レイヤー別に方針を明文化     | 判断に迷わない           |
| DynamoDB Localの制限事項記載 | 後で困らないように       |

**学び：**

- テスト方針を明文化することでチーム全体の品質基準が統一される
- mockの使い分けは「制御可能性」と「コスト」で判断

---

### 2026-01-09 本の登録画面

**実施した内容：**

- 本の登録フォーム画面を実装
- ISBN入力で書影・ページ数を自動取得（NDL API）
- スキルタグ入力（オートコンプリート）
- Jotaiによる状態管理

**作成したファイル：**

| ファイル                                                      | 内容                      |
| ------------------------------------------------------------- | ------------------------- |
| `apps/web/src/pages/BookRegisterPage.tsx`                     | 本の登録ページ            |
| `apps/web/src/features/books/components/BookForm.tsx`         | 本登録フォーム            |
| `apps/web/src/features/books/components/SkillTagInput.tsx`    | スキルタグ入力            |
| `apps/web/src/features/books/components/BookCoverPreview.tsx` | 書影プレビュー            |
| `apps/web/src/features/books/hooks/useBookInfo.ts`            | ISBN→書籍情報取得フック   |
| `apps/web/src/features/books/hooks/useSkillSuggestions.ts`    | スキル候補取得フック      |
| `apps/web/src/features/books/services/ndlApi.ts`              | NDL API クライアント      |
| `apps/web/src/features/books/services/bookApi.ts`             | 本登録APIクライアント     |
| `apps/web/src/features/books/stores/bookFormAtoms.ts`         | フォーム状態管理（Jotai） |
| `apps/api/src/routes/skills.ts`                               | スキル取得API             |
| `apps/api/src/services/skillService.ts`                       | スキルサービス層          |
| `apps/api/src/repositories/skillRepository.ts`                | スキルリポジトリ層        |

**技術的な決定：**

| 決定                        | 理由                                       |
| --------------------------- | ------------------------------------------ |
| Jotaiで状態管理             | シンプル、Reactと相性が良い                |
| Feature-based構造           | books関連ファイルを`features/books/`に集約 |
| hooks/services/storesで分離 | 関心事の分離                               |
| NDL APIで書影取得           | 無料、ISBN→書影URLが取得可能               |
| debounce 500ms              | API負荷軽減、UX向上                        |

**学び：**

- Jotaiのatomは小さく分割すると再レンダリングが最適化される
- NDL APIはISBN-10/13どちらでも検索可能
- スキルのオートコンプリートはユーザビリティ向上に有効

---

### 2026-01-06 UI/デザイン改修（visual-design.md準拠）

**実施した内容：**

- visual-design.mdに基づくSFC時代のRPG風UIへの改修
- CSS変数でカラーパレット・フォントを一元管理
- DQWindow/DQButtonコンポーネント作成
- LoginPage/Appのスタイル改修、ロゴ画像配置
- ライトモード対応を削除（ダークモード一択）
- 日本語化、アクセシビリティ改善

**作成・修正したファイル：**

| ファイル                                                       | 内容                        |
| -------------------------------------------------------------- | --------------------------- |
| `apps/web/index.html`                                          | Googleフォント読み込み追加  |
| `apps/web/src/index.css`                                       | CSS変数、グローバルスタイル |
| `apps/web/src/components/DQWindow.tsx`                         | DQウィンドウコンポーネント  |
| `apps/web/src/components/DQWindow.module.css`                  | DQウィンドウスタイル        |
| `apps/web/src/components/DQButton.tsx`                         | DQボタンコンポーネント      |
| `apps/web/src/components/DQButton.module.css`                  | DQボタンスタイル            |
| `apps/web/src/pages/LoginPage.tsx`                             | ログインページ改修          |
| `apps/web/src/pages/LoginPage.module.css`                      | LoginPageスタイル           |
| `apps/web/src/App.tsx`                                         | App改修                     |
| `apps/web/src/App.module.css`                                  | Appスタイル                 |
| `apps/web/src/features/auth/components/LoginButton.tsx`        | 日本語化、アクセシビリティ  |
| `apps/web/src/features/auth/components/LoginButton.module.css` | エラースタイル              |

**CSS変数一覧：**

```css
--color-bg-base: #0a0a0a;
--color-bg-window-light: #1a2d4a;
--color-bg-window-dark: #0d1a2d;
--color-bg-window-light-hover: #2a3d5a;
--color-bg-window-dark-hover: #1a2d3d;
--color-border: #ffffff;
--color-text: #ffffff;
--color-text-muted: #a0a0a0;
--color-hp: #f39c12;
--color-exp: #f1c40f;
--color-success: #27ae60;
--color-danger: #e74c3c;
--font-main: 'Noto Sans JP', system-ui, sans-serif;
--font-pixel: 'DotGothic16', monospace;
```

**学び：**

- 共通コンポーネントを先に作成し、各画面で再利用するフローが効率的
- CSS変数は最初から派生色（hover等）も含めて設計すべき
- アクセシビリティ（aria-label, aria-live）は実装時点で考慮する

---

### 2026-01-04 フロントエンド認証基盤

**実施した内容：**

- Firebase SDK導入（v12.7.0）
- AuthContext / useAuth による認証状態管理
- LoginPage / LoginButton コンポーネント
- ProtectedRoute による保護ルート
- authApi（IDトークン自動付与APIクライアント）
- 環境変数バリデーション

**作成したファイル：**

| ファイル                                                   | 内容                    |
| ---------------------------------------------------------- | ----------------------- |
| `apps/web/src/lib/firebase.ts`                             | Firebase初期化          |
| `apps/web/src/features/auth/contexts/AuthContext.tsx`      | 認証コンテキスト        |
| `apps/web/src/features/auth/hooks/useAuth.ts`              | 認証フック              |
| `apps/web/src/features/auth/components/LoginButton.tsx`    | ログインボタン          |
| `apps/web/src/features/auth/components/ProtectedRoute.tsx` | 保護ルート              |
| `apps/web/src/features/auth/services/authApi.ts`           | 認証付きAPIクライアント |
| `apps/web/src/pages/LoginPage.tsx`                         | ログインページ          |
| `apps/web/src/vite-env.d.ts`                               | 環境変数型定義          |

**技術的な決定：**

| 決定                          | 理由                                  |
| ----------------------------- | ------------------------------------- |
| Context APIで認証状態管理     | シンプル、外部ライブラリ不要          |
| Feature-based構造             | `features/auth/`に関連ファイルを集約  |
| 遅延バリデーション（authApi） | テスト時のモジュールロードエラー回避  |
| vi.hoistedでモック変数定義    | Vitestのvi.mockホイスティング問題対応 |

**学び：**

- Vitestの`vi.mock()`はファイル先頭にホイスティングされるため、モック関数を参照する場合は`vi.hoisted()`を使用
- `erasableSyntaxOnly: true`の環境ではクラスのパラメータプロパティが使用不可
- ルートから`npm run lint`実行時は`apps/web`のeslintルールが読み込まれないため、`eslint-disable`コメントは避ける

---

### 2026-01-04 Firebase Auth連携

**実施した内容：**

- Firebase Auth認証ミドルウェア実装
- `@hono/firebase-auth`パッケージを使用したIDトークン検証
- `/books`エンドポイントへの認証適用

**作成・修正したファイル：**

| ファイル                               | 内容                   |
| -------------------------------------- | ---------------------- |
| `apps/api/src/middleware/auth.ts`      | 認証ミドルウェア       |
| `apps/api/src/middleware/auth.test.ts` | 認証ミドルウェアテスト |
| `apps/api/src/lib/dynamodb.ts`         | Env型拡張              |
| `apps/api/src/index.ts`                | ミドルウェア適用       |
| `apps/api/src/routes/books.ts`         | getAuthUserId使用      |
| `apps/api/wrangler.toml`               | 環境変数・KV追加       |

**技術的な決定：**

| 決定                         | 理由                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `@hono/firebase-auth`使用    | Hono公式、設定が簡単、内部でfirebase-auth-cloudflare使用 |
| Workers KVで公開鍵キャッシュ | パフォーマンス向上                                       |
| X-User-Idヘッダー廃止        | 正式な認証に置き換え                                     |
| `/books`のみ認証適用         | ヘルスチェック等は認証不要                               |

**学び：**

- Cloudflare Workersでfirebase-admin SDKは使えない。`@hono/firebase-auth`が最適解
- KV Namespace IDはデプロイ前に`wrangler kv:namespace create`で取得が必要

**デプロイ前の作業：**

```bash
# KV Namespaceを作成してIDを取得
wrangler kv:namespace create PUBLIC_JWK_CACHE_KV
# 取得したIDをwrangler.tomlに反映
```

---

### 2026-01-04 Book CRUD API実装 & 開発プロセス改善

**実施した内容：**

- 本の登録・取得API実装（POST /books、GET /books、GET /books/:id）
- レイヤードアーキテクチャで実装（routes → services → repositories）
- 開発プロセス改善（husky + lint-staged、steeringスキル修正）

**作成・修正したファイル：**

| ファイル                           | 内容                 |
| ---------------------------------- | -------------------- |
| `apps/api/src/types/api.ts`        | zodスキーマ定義      |
| `apps/api/src/repositories/*.ts`   | DynamoDBアクセス層   |
| `apps/api/src/services/*.ts`       | ビジネスロジック層   |
| `apps/api/src/routes/books.ts`     | HTTPハンドラ         |
| `.husky/pre-commit`                | pre-commitフック     |
| `.claude/skills/steering/SKILL.md` | スキル説明文修正     |
| `~/.claude/CLAUDE.md`              | グローバルルール追加 |

**技術的な決定：**

| 決定                         | 理由                                         |
| ---------------------------- | -------------------------------------------- |
| zod + @hono/zod-validator    | 型安全なバリデーション                       |
| nanoidでID生成               | UUIDより短く、URL-safe                       |
| X-User-Idヘッダーで一時認証  | Firebase Auth導入前の開発用                  |
| pre-commitでPrettier自動実行 | CI失敗を防止                                 |
| GitHub URLは`gh api`で取得   | WebFetchだと認証が必要なコンテンツに対応不可 |

**学び：**

- Vitest v4ではモッククラスを`vi.fn().mockImplementation()`で作ると動作しない。実際のクラス定義が必要
- `as Book`でキャストエラーが出る場合は`as unknown as Book`を使用

---

### 2026-01-02 スペック駆動開発ドキュメント整備

**実施した内容：**

- `GenerativeAgents/claude-code-book-chapter8` リポジトリを参考に、スペック駆動開発の仕組みを調査
- steering スキル、開発ガイドライン、リポジトリ構造、用語集を導入

**作成したファイル：**

| ファイル                                 | 内容                           |
| ---------------------------------------- | ------------------------------ |
| `.claude/skills/steering/SKILL.md`       | 作業管理スキル定義             |
| `.claude/skills/steering/templates/*.md` | 要件・設計・タスクテンプレート |
| `docs/development-guidelines.md`         | 開発ガイドライン               |
| `docs/repository-structure.md`           | リポジトリ構造                 |
| `docs/glossary.md`                       | 用語集                         |

**決定事項：**

| 決定                               | 理由                                   |
| ---------------------------------- | -------------------------------------- |
| steering スキル導入                | 大きな機能追加時の作業管理を統一       |
| フロント: Feature-based構造        | 関連ファイルがまとまり凝集度が高い     |
| バックエンド: Layered Architecture | repository層でDB抽象化、テストしやすい |
| テストファイルはコロケーション     | 関連ファイルがまとまる、テスト忘れ防止 |
| commands/agents は後回し           | 複雑すぎる、まずはスキルベースで運用   |

---

### 2025-12-24 プロジェクトセットアップ

**実施した内容：**

- 開発プロセス決定（GitHub Flow、Conventional Commits、テスト方針）
- CLAUDE.md作成（プロジェクトコンテキスト）
- モノレポ構成でプロジェクト初期セットアップ

**セットアップ内容：**

| パッケージ      | 内容                              |
| --------------- | --------------------------------- |
| ルート          | npm workspaces、ESLint + Prettier |
| apps/web        | Vite + React + TypeScript         |
| apps/api        | Cloudflare Workers + Hono         |
| packages/shared | 共通型定義（Book, Skill）         |

**決定事項：**

| 決定                                   | 理由                         |
| -------------------------------------- | ---------------------------- |
| npm workspaces                         | シンプル、学習コスト低       |
| ブランチ名はConventional Commitsに統一 | 一貫性                       |
| テストはGoogleテストサイズ基準         | Small多め、E2Eは主要導線のみ |
| ワイヤーフレームはスキップ             | 1人開発、実装しながら調整    |

---

### 2025-12-17 画面設計

**議論した内容：**

- 必要な画面の洗い出し
- 各画面の目的と要素の定義
- ホーム画面の構成（本一覧 + 簡易ステータス）
- 討伐済み本の表示方法

**決定事項と理由：**

| 決定                                                        | 理由                                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| 6画面構成（ログイン、ホーム、登録、詳細、戦闘、スキル一覧） | MVPとして必要十分                            |
| ホームに簡易ステータス表示                                  | 別画面だと見なくなる、でも詳細すぎると煩雑   |
| 討伐済みはトグルで表示切替                                  | デフォルトは戦闘中のみ、過去も見たい時に切替 |
| 戦闘は独立画面                                              | 演出に集中、達成感を最大化                   |
| 各画面1目的                                                 | シンプルで迷わない導線                       |

---

### 2025-12-16 経験値・レベルシステム

**議論した内容：**

- 経験値獲得量（1ページ = ?exp）
- 討伐ボーナスの有無と割合
- 複数スキルへの経験値分配方法
- レベルアップ必要経験値の計算式（線形 vs 累乗）
- レベル上限
- 再読ボーナスの有無

**決定事項と理由：**

| 決定                  | 理由                                            |
| --------------------- | ----------------------------------------------- |
| 1ページ = 1exp        | シンプルでわかりやすい                          |
| 討伐ボーナス10%       | 読了のインセンティブ                            |
| 各スキルに同じ経験値  | 分割すると1スキルにした方が効率的になってしまう |
| 累乗式（Lv^1.5 × 50） | 線形だと単調、序盤サクサク後半じわじわ          |
| レベル上限9999        | 学習に終わりはない                              |
| 再読ボーナスなし      | シンプルさ優先                                  |

---

### 2025-12-14 データ設計

**議論した内容：**

- DynamoDBのPK/SK設計（シングルテーブル）
- 本とスキルの関係（1対多）
- 進捗記録の粒度（差分 vs 累計）
- 戦闘ログの保存要否
- 再読時の挙動
- スキルマスタの構造（グローバル vs ユーザー独自）
- ISBN/書影の扱い
- メモ機能と検索性

**決定事項と理由：**

| 決定                 | 理由                                                              |
| -------------------- | ----------------------------------------------------------------- |
| 本に現在ページを持つ | 一覧表示時に毎回全ログ集計は非効率                                |
| 差分でログ記録       | 「今日30ページ読んだ」が自然な入力、履歴も残る                    |
| 戦闘ログを残す       | 後から振り返りたい                                                |
| 再読は同じエントリ   | 本としては同一、周回数で管理                                      |
| スキル2層構造        | 一般的なスキルの表記揺れ防止 + ニッチなスキルでグローバル汚染防止 |
| ISBN保存、書影はAPI  | openBD/NDLサーチで取得可能、画像アップロードはMVP不要             |
| メモは任意           | 必須だと記録が億劫になる                                          |
| メモ検索はMVP外      | DynamoDBは全文検索に向かない、YAGNI                               |

---

### 2025-12-14 技術選定

**議論した内容：**

- Cloudflare Workers / Supabase の比較
- ドキュメントDB vs RDBMSの検討
- DynamoDBの無料枠と課金モデル
- 認証サービスの比較（Firebase Auth, Clerk, Auth0, Cognito）
- 画像ストレージの選定

**決定事項：**

- Cloudflare Pages + Workers + R2 でCloudflare寄せ
- DBはDynamoDB（学習目的も兼ねて）
- 認証はFirebase Auth
- DynamoDBはプロビジョンドモードで無料枠内運用

---

### 2025-12-13 初回壁打ち

**議論した内容：**

- 基本コンセプトの確認
- ターゲットユーザーの明確化
- MVP機能の範囲
- スキルシステムの設計方針
- 戦闘の体験設計
- 敵画像の扱い
- 認証の必要性

**次回やること：**

- 画面設計
