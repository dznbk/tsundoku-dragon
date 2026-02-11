# =============================================================================
# AWS
# =============================================================================

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "dynamodb_table_name" {
  description = "DynamoDB テーブル名"
  type        = string
}

variable "dynamodb_read_capacity" {
  description = "DynamoDB 読み取りキャパシティユニット"
  type        = number
}

variable "dynamodb_write_capacity" {
  description = "DynamoDB 書き込みキャパシティユニット"
  type        = number
}

# =============================================================================
# Cloudflare
# =============================================================================

variable "cloudflare_api_token" {
  description = "Cloudflare API トークン"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare アカウント ID"
  type        = string
}

variable "kv_namespace_title" {
  description = "KV Namespace のタイトル"
  type        = string
}

variable "access_app_name" {
  description = "Cloudflare Access アプリケーション名"
  type        = string
}

variable "access_app_domain" {
  description = "Cloudflare Access で保護するドメイン"
  type        = string
}

variable "access_allowed_emails" {
  description = "Cloudflare Access で許可するメールアドレスリスト"
  type        = list(string)
}
