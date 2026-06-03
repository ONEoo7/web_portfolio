#!/bin/sh
# goaccess-loop.sh
# Regenerates the static HTML analytics report every $INTERVAL seconds from
# the nginx access log. Kept in a file (rather than inline in compose) to
# avoid YAML folded-scalar quirks that silently split the flags.

set -u

LOG="/var/log/nginx/portfolio.access.log"
OUT="/srv/analytics/index.html"
GEOIP="/geoip/dbip-city-lite.mmdb"
INTERVAL="${INTERVAL:-300}"

while :; do
  if [ -s "$LOG" ]; then
    if [ -f "$GEOIP" ]; then
      goaccess "$LOG" \
        --log-format=COMBINED \
        --output="$OUT" \
        --geoip-database="$GEOIP" \
        --no-progress \
        --html-report-title="Portfolio analytics" || true
    else
      goaccess "$LOG" \
        --log-format=COMBINED \
        --output="$OUT" \
        --no-progress \
        --html-report-title="Portfolio analytics" || true
    fi
  fi
  sleep "$INTERVAL"
done
