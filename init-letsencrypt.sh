#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# init-letsencrypt.sh
# Run this ONCE before starting the full stack.
# It bootstraps a staging cert, generates DH params, then gets a real cert.
#
# Usage:
#   chmod +x init-letsencrypt.sh
#   ./init-letsencrypt.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration — edit these ─────────────────────────────────────────────────
DOMAIN="YOUR_DDNS_DOMAIN.example.com"   # ← your DDNS address
EMAIL="your@email.com"                  # ← for Let's Encrypt expiry notices
STAGING=0                               # set to 1 to test without rate limits

# ── Paths ──────────────────────────────────────────────────────────────────────
CERTBOT_CONF="./certbot/conf"
CERTBOT_WWW="./certbot/www"
DHPARAM_VOL="portfolio_certbot-dhparam"

echo "==> Creating required directories..."
mkdir -p "$CERTBOT_CONF" "$CERTBOT_WWW"

# ── Generate DH parameters (4096-bit, takes a few minutes) ────────────────────
echo "==> Generating 4096-bit DH parameters (this will take a while)..."
docker run --rm -v "${DHPARAM_VOL}:/dhparam" alpine/openssl \
  openssl dhparam -out /dhparam/dhparam.pem 4096

# ── Start nginx with a temporary self-signed cert so ACME challenge can work ──
echo "==> Creating temporary self-signed certificate..."
TEMP_CERT_DIR="$CERTBOT_CONF/live/$DOMAIN"
mkdir -p "$TEMP_CERT_DIR"
docker run --rm -v "$CERTBOT_CONF:/etc/letsencrypt" alpine/openssl \
  openssl req -x509 -nodes -newkey rsa:4096 \
    -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
    -out    "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
    -days 1 -subj "/CN=$DOMAIN"

# Create chain.pem (empty is fine for temp cert)
touch "$TEMP_CERT_DIR/chain.pem"

echo "==> Starting nginx with temporary cert..."
docker compose up -d nginx

echo "==> Waiting for nginx to be ready..."
sleep 5

# ── Request real certificate from Let's Encrypt ───────────────────────────────
STAGING_FLAG=""
if [ "$STAGING" -eq 1 ]; then
  echo "==> (Using Let's Encrypt STAGING environment)"
  STAGING_FLAG="--staging"
fi

echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  $STAGING_FLAG \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN"

# ── Reload nginx with the real cert ───────────────────────────────────────────
echo "==> Reloading nginx with real certificate..."
docker compose exec nginx nginx -s reload

echo ""
echo "✅ Done! Start your full stack with:"
echo "   docker compose up -d"
echo ""
echo "   Your site will be live at: https://$DOMAIN"
