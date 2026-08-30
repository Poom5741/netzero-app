# Cloudflare Access (Zero Trust) — gate admin/sponsor routes.
#
# Prerequisites:
#   export CLOUDFLARE_API_TOKEN="your-token-with-access-admin"
#
# Usage:
#   terraform init
#   terraform plan
#   terraform apply

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {}

variable "account_id" {
  default = "a1d68d92ed0cda5cea113ff208eba3a1"
}

variable "allowed_emails" {
  description = "Emails allowed through Access gate. Add more as needed."
  default     = ["poom@charoenyost.com"]
}

# ─────────────────────────────────────────────────────────────
# Frontend (netzero-frontend.poom-a1d.workers.dev)
# One Access App covering /admin and /sponsor paths only.
# /chat, /upload, /summary, and all other paths stay public.
# ─────────────────────────────────────────────────────────────

resource "cloudflare_zero_trust_access_application" "frontend" {
  account_id       = var.account_id
  name             = "NetZero Frontend — Admin & Sponsor"
  domain           = "netzero-frontend.poom-a1d.workers.dev"
  type             = "self_hosted"
  session_duration = "24h"
  paths            = ["/admin", "/admin/*", "/sponsor", "/sponsor/*"]
}

resource "cloudflare_zero_trust_access_policy" "frontend" {
  account_id     = var.account_id
  application_id = cloudflare_zero_trust_access_application.frontend.id
  name           = "Allow NetZero team"
  precedence     = 1
  decision       = "allow"

  include {
    emails = var.allowed_emails
  }
}

# ─────────────────────────────────────────────────────────────
# Backend (netzero-carbon-poc.poom-a1d.workers.dev)
# Gate /admin/*, /api/admin/*, /sponsor/* — farmer API stays open.
# ─────────────────────────────────────────────────────────────

resource "cloudflare_zero_trust_access_application" "backend" {
  account_id       = var.account_id
  name             = "NetZero Backend — Admin & Sponsor"
  domain           = "netzero-carbon-poc.poom-a1d.workers.dev"
  type             = "self_hosted"
  session_duration = "24h"
  paths            = ["/admin", "/admin/*", "/api/admin", "/api/admin/*", "/sponsor", "/sponsor/*"]
}

resource "cloudflare_zero_trust_access_policy" "backend" {
  account_id     = var.account_id
  application_id = cloudflare_zero_trust_access_application.backend.id
  name           = "Allow NetZero team"
  precedence     = 1
  decision       = "allow"

  include {
    emails = var.allowed_emails
  }
}
