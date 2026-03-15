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
DATABASE_URL="your-neon-connection-string-here"
AUTH_SECRET="${AUTH_SECRET}"
EOF
  echo ".env.local created. Set your DATABASE_URL to your Neon connection string."
else
  echo ".env.local already exists, skipping."
fi

# 3. Run migrations
echo "Running migrations..."
yarn db:migrate

echo ""
echo "=== Done! Run 'yarn dev' to start the app ==="
