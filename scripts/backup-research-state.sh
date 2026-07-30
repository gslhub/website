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

sha256_file() {
  local file="$1"

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    fail 'Neither sha256sum nor shasum is available.'
  fi
}

require_value DATABASE_URL
require_command mongodump

backup_root="${BACKUP_ROOT:-backups}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="${backup_root%/}/gslhub-${stamp}"
artifact_dir="$backup_dir/research-artifacts"
mkdir -p "$artifact_dir"

printf 'Creating MongoDB archive...\n'
mongodump \
  --uri="$DATABASE_URL" \
  --archive="$backup_dir/mongodb.archive.gz" \
  --gzip

storage_mode='local'
if [[ "${S3_ENABLED:-false}" == 'true' ]]; then
  require_command aws
  require_value S3_BUCKET

  storage_mode='s3-compatible'
  prefix="${S3_PREFIX:-research-artifacts}"
  source_uri="s3://${S3_BUCKET}/${prefix#/}"
  aws_args=()

  if [[ -n "${S3_ENDPOINT:-}" ]]; then
    aws_args+=(--endpoint-url "$S3_ENDPOINT")
  fi

  printf 'Copying research artifacts from %s...\n' "$source_uri"
  aws s3 sync "$source_uri" "$artifact_dir" "${aws_args[@]}" --only-show-errors
else
  local_artifact_dir="${LOCAL_ARTIFACT_DIR:-research-artifacts}"
  [[ -d "$local_artifact_dir" ]] || fail "Local artifact directory not found: $local_artifact_dir"

  printf 'Copying local research artifacts from %s...\n' "$local_artifact_dir"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "$local_artifact_dir/" "$artifact_dir/"
  else
    cp -R "$local_artifact_dir/." "$artifact_dir/"
  fi
fi

cat >"$backup_dir/backup-metadata.txt" <<EOF
created_at_utc=${stamp}
storage_mode=${storage_mode}
s3_bucket=${S3_BUCKET:-}
s3_prefix=${S3_PREFIX:-research-artifacts}
git_commit=$(git rev-parse HEAD 2>/dev/null || printf 'unknown')
EOF

manifest="$backup_dir/manifest.sha256"
: >"$manifest"

while IFS= read -r -d '' file; do
  relative_path="${file#${backup_dir}/}"
  [[ "$relative_path" == 'manifest.sha256' ]] && continue
  printf '%s  %s\n' "$(sha256_file "$file")" "$relative_path" >>"$manifest"
done < <(find "$backup_dir" -type f -print0 | sort -z)

printf 'Backup created: %s\n' "$backup_dir"
printf 'Files in manifest: %s\n' "$(wc -l <"$manifest" | tr -d ' ')"
printf 'Run: bash scripts/verify-research-backup.sh %q\n' "$backup_dir"
