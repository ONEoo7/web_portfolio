#!/bin/sh
# refresh-geoip.sh
# Daily loop that keeps /geoip/dbip-city-lite.mmdb fresh.
#
# - Skips the download if the file is less than $MIN_AGE_DAYS days old (avoids
#   hammering db-ip.com when the local copy is still recent).
# - Tries the current month first, then the previous month (DB-IP publishes
#   on the 1st of the month, but sometimes a day or two late).
# - The goaccess container re-reads the .mmdb on every report cycle, so no
#   restart is needed after a refresh.

set -eu

MIN_AGE_DAYS="${MIN_AGE_DAYS:-25}"
GEOIP_FILE="/geoip/dbip-city-lite.mmdb"
SLEEP_SECONDS="${SLEEP_SECONDS:-86400}"

log() { echo "[$(date -u +%FT%TZ)] $*"; }

needs_update() {
  [ ! -f "$GEOIP_FILE" ] && return 0
  age_days=$(( ($(date +%s) - $(stat -c %Y "$GEOIP_FILE")) / 86400 ))
  [ "$age_days" -ge "$MIN_AGE_DAYS" ]
}

prev_month() {
  y=$(date -u +%Y); m=$(date -u +%m)
  m=$((10#$m - 1))
  if [ "$m" -eq 0 ]; then m=12; y=$((y - 1)); fi
  printf "%04d-%02d" "$y" "$m"
}

download_one() {
  ym="$1"
  url="https://download.db-ip.com/free/dbip-city-lite-${ym}.mmdb.gz"
  log "trying $url"
  if wget -q -O /tmp/new.mmdb.gz "$url" && [ -s /tmp/new.mmdb.gz ]; then
    if gunzip -f /tmp/new.mmdb.gz; then
      mv /tmp/new.mmdb "$GEOIP_FILE"
      log "updated geoip → $ym ($(stat -c %s "$GEOIP_FILE") bytes)"
      return 0
    fi
  fi
  rm -f /tmp/new.mmdb.gz /tmp/new.mmdb
  return 1
}

while :; do
  if needs_update; then
    if ! download_one "$(date -u +%Y-%m)"; then
      download_one "$(prev_month)" || log "no update available"
    fi
  else
    age_days=$(( ($(date +%s) - $(stat -c %Y "$GEOIP_FILE")) / 86400 ))
    log "skip — geoip is ${age_days}d old (threshold ${MIN_AGE_DAYS}d)"
  fi
  sleep "$SLEEP_SECONDS"
done
