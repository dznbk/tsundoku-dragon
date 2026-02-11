# wrangler.toml と対応する出力値

output "dynamodb_table_name" {
  description = "DynamoDB テーブル名 → wrangler.toml vars.DYNAMODB_TABLE_NAME"
  value       = aws_dynamodb_table.main.name
}

output "kv_namespace_id" {
  description = "KV Namespace ID → wrangler.toml kv_namespaces[].id"
  value       = cloudflare_workers_kv_namespace.main.id
}

output "iam_user_name" {
  description = "IAM ユーザー名"
  value       = aws_iam_user.worker.name
}
