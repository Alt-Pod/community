const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

// Load .env.local if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
      if (match) process.env[match[1]] = match[2];
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not set");
  process.exit(1);
}

// Extract db name and build a connection URL pointing to the default "postgres" database
const dbName = databaseUrl.replace(/\?.*$/, "").split("/").pop();
const maintenanceUrl = databaseUrl.replace(/\/[^/?]+(\?|$)/, "/postgres$1");

async function reset() {
  // Connect to the "postgres" maintenance database to drop/create
  const sql = postgres(maintenanceUrl);

  console.log(`Dropping database '${dbName}'...`);
  // Terminate existing connections
  await sql.unsafe(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid()`
  );
  await sql.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);

  console.log(`Creating database '${dbName}'...`);
  await sql.unsafe(`CREATE DATABASE "${dbName}"`);

  await sql.end();
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
