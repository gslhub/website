#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

require_value() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "Required environment variable is empty: $name"
}

backup_dir="${1:-}"
[[ -n "$backup_dir" ]] || fail 'Usage: bash scripts/restore-research-state.sh <backup-directory>'
[[ "${RESTORE_CONFIRMATION:-}" == 'RESTORE_GSLHUB_ISOLATED' ]] || fail \
  'Set RESTORE_CONFIRMATION=RESTORE_GSLHUB_ISOLATED after confirming that the target is an isolated recovery environment.'

require_value TARGET_DATABASE_URL
require_command mongorestore

if [[ -n "${DATABASE_URL:-}" && "$TARGET_DATABASE_URL" == "$DATABASE_URL" && "${ALLOW_PRODUCTION_RESTORE:-false}" != 'true' ]]; then
  fail 'The target database matches DATABASE_URL. Production restore is blocked unless ALLOW_PRODUCTION_RESTORE=true is explicitly set.'
fi

bash "$(dirname "$0")/verify-research-backup.sh" "$backup_dir"

restore_args=(
  --uri="$TARGET_DATABASE_URL"
  --archive="$backup_dir/mongodb.archive.gz"
  --gzip
)

if [[ "${RESTORE_DROP_EXISTING:-false}" == 'true' ]]; then
  restore_args+=(--drop)
fi

printf 'Restoring MongoDB into the isolated target...\n'
mongorestore "${restore_args[@]}"

if [[ "${RESTORE_S3_ENABLED:-false}" == 'true' ]]; then
  require_command aws
  require_value RESTORE_S3_BUCKET

  prefix="${RESTORE_S3_PREFIX:-research-artifacts}"
  destination_uri="s3://${RESTORE_S3_BUCKET}/${prefix#/}"
  aws_args=()

  if [[ -n "${RESTORE_S3_ENDPOINT:-}" ]]; then
    aws_args+=(--endpoint-url "$RESTORE_S3_ENDPOINT")
  fi

  printf 'Restoring research artifacts to %s...\n' "$destination_uri"
  aws s3 sync \
    "$backup_dir/research-artifacts" \
    "$destination_uri" \
    "${aws_args[@]}" \
    --only-show-errors
else
  restore_artifact_dir="${RESTORE_LOCAL_ARTIFACT_DIR:-restored-research-artifacts}"
  mkdir -p "$restore_artifact_dir"

  printf 'Restoring research artifacts to %s...\n' "$restore_artifact_dir"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "$backup_dir/research-artifacts/" "$restore_artifact_dir/"
  else
    cp -R "$backup_dir/research-artifacts/." "$restore_artifact_dir/"
  fi
fi

printf 'Restore completed. Do not promote this environment until record counts, access control and file checksums have been reviewed.\n'
