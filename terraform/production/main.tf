terraform {
  required_version = ">= 1.14.1"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.31"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.16"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# =============================================================================
# AWS - DynamoDB
# =============================================================================

resource "aws_dynamodb_table" "main" {
  name                        = var.dynamodb_table_name
  billing_mode                = "PROVISIONED"
  read_capacity               = var.dynamodb_read_capacity
  write_capacity              = var.dynamodb_write_capacity
  deletion_protection_enabled = true

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  tags = {
    Project     = "tsundoku-dragon"
    Environment = "production"
  }
}

# =============================================================================
# Cloudflare - KV Namespace
# =============================================================================

resource "cloudflare_workers_kv_namespace" "main" {
  account_id = var.cloudflare_account_id
  title      = var.kv_namespace_title
}

# =============================================================================
# Cloudflare - Access（v5 で zero_trust_ プレフィックスに変更）
# =============================================================================

resource "cloudflare_zero_trust_access_application" "main" {
  account_id                 = var.cloudflare_account_id
  name                       = var.access_app_name
  domain                     = var.access_app_domain
  type                       = "self_hosted"
  session_duration           = "24h"
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  http_only_cookie_attribute = false
  options_preflight_bypass   = false

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.main.id
      precedence = 1
    }
  ]
}

resource "cloudflare_zero_trust_access_policy" "main" {
  account_id       = var.cloudflare_account_id
  name             = "Allow owner"
  decision         = "allow"
  session_duration = "24h"

  include = [
    for email in var.access_allowed_emails : {
      email = {
        email = email
      }
    }
  ]
}
