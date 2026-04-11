#!/bin/sh
set -e

LOCK_HASH_FILE="node_modules/.package-lock.hash"
CURRENT_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
INSTALLED_HASH=""

if [ -f "$LOCK_HASH_FILE" ]; then
  INSTALLED_HASH="$(cat "$LOCK_HASH_FILE")"
fi

# Keep dependencies in sync for bind-mounted dev volumes.
if [ ! -d "node_modules" ] || [ "$CURRENT_HASH" != "$INSTALLED_HASH" ] || [ ! -d "node_modules/lucide-react" ]; then
  echo "Installing frontend dependencies..."
  npm ci
  echo "$CURRENT_HASH" > "$LOCK_HASH_FILE"
fi

exec npm run dev
