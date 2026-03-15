#!/bin/bash
set -e

echo "=== Community — Setup ==="

# 1. Install dependencies
echo "Installing dependencies..."
yarn install

# 2. Create .env.local if missing
if [ ! -f .env.local ]; then
  echo "Creating .env.local..."
  AUTH_SECRET=$(openssl rand -base64 32)
  cat > .env.local <<EOF
DATABASE_URL="postgresql://community:community@localhost:5432/community"
AUTH_SECRET="${AUTH_SECRET}"
EOF
  echo ".env.local created with a generated AUTH_SECRET."
else
  echo ".env.local already exists, skipping."
fi

# 3. Start Postgres
echo "Starting Postgres..."
docker compose up -d

# 4. Wait for Postgres to be ready
echo "Waiting for Postgres..."
until docker exec community-db pg_isready -U community -d community > /dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready."

# 5. Run migrations
echo "Running migrations..."
for f in migrations/*.sql; do
  echo "  -> $f"
  docker exec -i community-db psql -U community -d community < "$f"
done

echo ""
echo "=== Done! Run 'yarn dev' to start the app ==="
