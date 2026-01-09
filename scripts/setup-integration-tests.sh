#!/bin/bash
#
# 統合テスト環境セットアップスクリプト
#
# このスクリプトは以下を実行します:
# 1. DynamoDB Localの起動確認
# 2. テスト用テーブルの作成
# 3. テストデータの投入（オプション）
#
# 使用方法:
#   ./scripts/setup-integration-tests.sh [--seed]
#
# オプション:
#   --seed  テストデータも投入する
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ENDPOINT="http://localhost:8000"
TABLE_NAME="tsundoku-dragon-test"

echo "=== DynamoDB Local統合テスト環境セットアップ ==="
echo ""

# DynamoDB Localの起動確認
echo "1. DynamoDB Localの起動確認..."
if ! curl -s "$ENDPOINT" > /dev/null 2>&1; then
  echo "   エラー: DynamoDB Localが起動していません"
  echo "   以下のコマンドで起動してください:"
  echo "     npm run db:start"
  exit 1
fi
echo "   ✓ DynamoDB Localが起動中"
echo ""

# テーブル作成
echo "2. テスト用テーブルの作成..."
npx tsx "$PROJECT_ROOT/scripts/create-table.ts" --local --test 2>/dev/null || true
echo "   ✓ テーブル準備完了"
echo ""

# テストデータ投入（オプション）
if [[ "$1" == "--seed" ]]; then
  echo "3. テストデータの投入..."
  npx tsx "$PROJECT_ROOT/scripts/seed-test-data.ts"
  echo ""
fi

echo "=== セットアップ完了 ==="
echo ""
echo "統合テストを実行するには:"
echo "  npm run test:integration"
