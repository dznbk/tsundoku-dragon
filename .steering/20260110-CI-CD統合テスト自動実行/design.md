# 設計書

## 意思決定

### 採用した設計

GitHub Actions servicesを使用してDynamoDB Localコンテナを起動し、既存のテーブル作成スクリプトを再利用して統合テスト環境を構築する。

### 代替案との比較

| 案                      | メリット                               | デメリット                         | 採用 |
| ----------------------- | -------------------------------------- | ---------------------------------- | ---- |
| GitHub Actions services | 設定がシンプル、ヘルスチェック組み込み | GitHub Actions専用                 | ✓    |
| docker-compose in CI    | ローカルと同じ設定を使用可能           | docker-compose起動のオーバーヘッド | -    |
| Testcontainers          | コードでコンテナ制御可能               | 依存ライブラリ追加が必要           | -    |

### 選定理由

- GitHub Actions servicesはワークフロー内でサービスコンテナを宣言的に定義でき、ヘルスチェックも組み込みでサポート
- 追加の依存ライブラリが不要
- 既存のCI設定と整合性が良い

## データフロー

### 統合テスト実行フロー

1. GitHub Actions servicesでDynamoDB Localコンテナ起動
2. ヘルスチェックでサービス準備完了を確認
3. Node.js環境セットアップ、npm ci実行
4. `npx tsx scripts/create-table.ts --local --test`でテストテーブル作成
5. `npm run test:integration`で統合テスト実行
6. テスト結果をGitHub Actionsに報告

## コンポーネント設計

### 追加・変更するファイル

| ファイル                   | 種別 | 責務                         |
| -------------------------- | ---- | ---------------------------- |
| `.github/workflows/ci.yml` | 変更 | integration-testジョブを追加 |

### CIワークフロー設計

#### integration-testジョブ

**責務**: DynamoDB Localを起動し、統合テストを実行

**設定内容**:

```yaml
integration-test:
  name: Integration Tests
  runs-on: ubuntu-latest
  services:
    dynamodb:
      image: amazon/dynamodb-local:latest
      ports:
        - 8000:8000
      options: >-
        --health-cmd "curl -f http://localhost:8000/ || exit 1"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    - run: npm ci
    - name: Create test table
      run: npx tsx scripts/create-table.ts --local --test
      env:
        AWS_ACCESS_KEY_ID: local
        AWS_SECRET_ACCESS_KEY: local
    - name: Run integration tests
      run: npm run test:integration
      env:
        DYNAMODB_ENDPOINT: http://localhost:8000
```

## テスト戦略

### 検証方法

- PRを作成して統合テストジョブが実行されることを確認
- 3回連続でPRを更新し、テストが安定して成功することを確認

### 失敗時の挙動

- 統合テストが失敗した場合、ジョブ全体が失敗となりPRマージがブロックされる

---

## 任意セクション

### ヘルスチェック設計

DynamoDB Localのヘルスチェックには`curl`コマンドを使用:

- `curl -f http://localhost:8000/`はDynamoDB Localが起動していれば400エラーを返す（認証なしリクエストのため）
- ただし`curl -f`はHTTP 400を失敗として扱うため、代わりに`|| exit 1`で接続自体の失敗のみを検出

**注意**: DynamoDB Localはルートパスへのリクエストに対して400を返すが、これはサービスが起動している証拠。ヘルスチェックコマンドを調整する必要がある可能性あり。

### パフォーマンス考慮事項

- `npm ci`のキャッシュを有効化してインストール時間を短縮
- 統合テストは並列実行せず、データの競合を避ける
- 2分以内の実行時間を目標とする
