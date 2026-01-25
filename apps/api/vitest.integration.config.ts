import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30000,
    passWithNoTests: true,
    // 統合テストは共有リソース（DynamoDB Local）を使用するため直列実行
    fileParallelism: false,
  },
});
