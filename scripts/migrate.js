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

const sql = postgres(process.env.DATABASE_URL);
const migrationsDir = path.join(__dirname, "..", "migrations");

async function migrate() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  for (const file of files) {
    console.log(`Running ${file}...`);
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
    });
  }
  console.log("Migrations complete.");
  await sql.end();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
