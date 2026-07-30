#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
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

backup_dir="${1:-}"
[[ -n "$backup_dir" ]] || fail 'Usage: bash scripts/verify-research-backup.sh <backup-directory>'
[[ -d "$backup_dir" ]] || fail "Backup directory not found: $backup_dir"
[[ -s "$backup_dir/mongodb.archive.gz" ]] || fail 'MongoDB archive is missing or empty.'
[[ -f "$backup_dir/manifest.sha256" ]] || fail 'Checksum manifest is missing.'
[[ -f "$backup_dir/backup-metadata.txt" ]] || fail 'Backup metadata is missing.'
[[ -d "$backup_dir/research-artifacts" ]] || fail 'Research-artifacts directory is missing.'

if command -v gzip >/dev/null 2>&1; then
  gzip -t "$backup_dir/mongodb.archive.gz"
fi

verified=0
while IFS= read -r line || [[ -n "$line" ]]; do
  expected="${line%%  *}"
  relative_path="${line#*  }"
  [[ -n "$expected" && -n "$relative_path" ]] || fail "Invalid manifest line: $line"

  file="$backup_dir/$relative_path"
  [[ -f "$file" ]] || fail "Manifest file is missing: $relative_path"

  actual="$(sha256_file "$file")"
  [[ "$actual" == "$expected" ]] || fail "Checksum mismatch: $relative_path"
  verified=$((verified + 1))
done <"$backup_dir/manifest.sha256"

artifact_count="$(find "$backup_dir/research-artifacts" -type f | wc -l | tr -d ' ')"
printf 'Backup verification passed.\n'
printf 'Verified files: %s\n' "$verified"
printf 'Research artifacts: %s\n' "$artifact_count"
printf 'MongoDB archive: %s\n' "$backup_dir/mongodb.archive.gz"
