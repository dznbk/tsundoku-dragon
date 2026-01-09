# 開発ガイドライン

## 技術スタック

| レイヤー       | 技術                             |
| -------------- | -------------------------------- |
| フロントエンド | React + TypeScript（Vite）       |
| ホスティング   | Cloudflare Pages                 |
| API            | Cloudflare Workers + Hono        |
| データベース   | DynamoDB（Provisioned mode）     |
| 認証           | Firebase Auth（Google, Twitter） |
| 画像ストレージ | Cloudflare R2                    |
| IaC            | Terraform（予定）                |

## ブランチ戦略（GitHub Flow）

- `main` - 本番ブランチ
- 作業ブランチは Conventional Commits の type に揃える
  - `feat/xxx` - 新機能
  - `fix/xxx` - バグ修正
  - `docs/xxx` - ドキュメント
  - `refactor/xxx` - リファクタリング
  - `test/xxx` - テスト
  - `chore/xxx` - 雑務
- PRを作成してマージ（1人開発でもPRを作る）

## コミットメッセージ（Conventional Commits）

```
<type>: <description>

[optional body]
```

| type       | 用途                 |
| ---------- | -------------------- |
| `feat`     | 新機能               |
| `fix`      | バグ修正             |
| `docs`     | ドキュメント         |
| `refactor` | リファクタリング     |
| `test`     | テスト               |
| `chore`    | 雑務（依存更新など） |

例：

- `feat: 本の登録APIを実装`
- `fix: 経験値計算の端数処理を修正`

## テスト方針

Googleのテストサイズを基準に：

| サイズ         | 方針                       | ツール     |
| -------------- | -------------------------- | ---------- |
| Small（単体）  | 多め。ロジック中心にカバー | Vitest     |
| Medium（結合） | API単位で必要に応じて      | Vitest     |
| Large（E2E）   | 主要導線のみ               | Playwright |

E2Eは以下の導線だけ：

- ログイン → 本登録 → 戦闘 → 討伐

### mockの使用方針（デトロイト派）

#### 基本原則

**本物を使えるなら本物を使う**

デトロイト派（古典派）のテスト哲学を採用する。mockは「必要悪」であり、本物のコンポーネントが使えるなら本物を使う。これにより、実際の動作に近いテストが可能になり、リファクタリング耐性が高まる。

#### レイヤー別mock使い分け

| レイヤー      | Unit Tests | Integration Tests   | E2E Tests    |
| ------------- | ---------- | ------------------- | ------------ |
| Repository    | Mock       | **Real (Local DB)** | Real         |
| Service       | Real       | Real                | Real         |
| External API  | Mock       | Mock                | Real or Mock |
| Firebase Auth | Mock       | Mock                | Real         |

#### 判断基準

mockするかどうかは以下の基準で判断する：

| 基準           | 本物を使う                   | mockする                    |
| -------------- | ---------------------------- | --------------------------- |
| **制御可能性** | DynamoDB Local, インメモリDB | 外部SaaS, サードパーティAPI |
| **コスト**     | 無料・低コスト               | 課金が発生する処理          |
| **副作用**     | ローカルで完結               | メール送信, SMS, 外部通知   |
| **速度**       | 十分高速                     | ネットワーク遅延が大きい    |
| **決定性**     | 結果が常に同じ               | ランダム性がある, 時刻依存  |

#### 具体例

```typescript
// ✅ Good: DynamoDB Localを使った統合テスト
describe('BookRepository Integration', () => {
  // 本物のDynamoDB Localに接続
  const repository = new BookRepository(localEnv);

  it('本を保存して取得できる', async () => {
    await repository.save(testBook);
    const result = await repository.findById(userId, bookId);
    expect(result).toEqual(testBook);
  });
});

// ✅ Good: 外部APIはmock
vi.mock('@hono/firebase-auth'); // Firebase Authはmock
vi.mock('../lib/openbd'); // 外部書籍APIはmock
```

詳細は [統合テストガイド](./integration-testing.md) を参照。

## コーディング規約

### 全般

- TypeScript strict mode
- ESLint + Prettier でフォーマット統一
- 日本語コメント可（ただし変数名・関数名は英語）

### 命名規則

| 対象                       | 規則              | 例                            |
| -------------------------- | ----------------- | ----------------------------- |
| 変数・関数                 | camelCase         | `currentPage`, `calculateExp` |
| 定数                       | UPPER_SNAKE_CASE  | `MAX_LEVEL`, `EXP_PER_PAGE`   |
| 型・インターフェース       | PascalCase        | `Book`, `BookStatus`          |
| コンポーネント             | PascalCase        | `BookCard`, `BattleScreen`    |
| ファイル（コンポーネント） | PascalCase        | `BookCard.tsx`                |
| ファイル（その他）         | camelCase         | `bookService.ts`              |
| テストファイル             | 元ファイル名.test | `BookCard.test.tsx`           |

### フロントエンド

- 関数コンポーネント + Hooks
- 状態管理は必要になるまで導入しない（useState/useContext優先）

### バックエンド

- Honoのルーティングはリソース単位でファイル分割
- エラーは適切なHTTPステータスコードを返す

## コンテキスト維持

### CONTEXT.md の更新タイミング

- 設計上の決定をしたとき
- 新しい技術選定をしたとき
- 重要な議論があったとき

### 作業ログ形式

```markdown
### YYYY-MM-DD トピック

**議論した内容：**

- 箇条書き

**決定事項と理由：**
| 決定 | 理由 |
|------|------|
| xxx | yyy |
```

## 注意事項

- DynamoDBはProvisioned modeで無料枠内に収める
- 書影はopenBD/NDL Search APIから取得（R2にキャッシュ）
- Firebase Authの認証情報は環境変数で管理
