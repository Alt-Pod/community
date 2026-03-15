const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

const sql = postgres(process.env.DATABASE_URL);
const migrationsDir = path.join(__dirname, "..", "migrations");

async function migrate() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  for (const file of files) {
    console.log(`Running ${file}...`);
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await sql.unsafe(content);
  }
  console.log("Migrations complete.");
  await sql.end();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
