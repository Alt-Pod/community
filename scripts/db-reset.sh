#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(dirname "$0")"

echo "Resetting database..."
node "$SCRIPT_DIR/db-reset.js"

echo "Running migrations..."
node "$SCRIPT_DIR/migrate.js"

echo "Seeding dev data..."
node "$SCRIPT_DIR/seed.js"

echo "Database reset complete."
