# Community

A personal AI organization — structured like a company — that helps manage your life through decisions, not actions.

## Concept

Superstar-level people hire teams of human agents to manage everything that gravitates around them. Community replicates that with AI agents, organized into a self-evolving company.

- **Agents** are employees with defined roles and responsibilities
- **Teams / Departments** group agents with shared context
- **Processes** define how agents collaborate, escalate, and hand off
- **The organization recommends its own growth** — it tells you what agents to hire next

## Philosophy

- **Delegate decisions, not actions.** Agents analyze, recommend, and alert. You approve and execute.
- **The app is self-organizing.** It identifies its own gaps and proposes new roles.
- **Context compounds.** The longer you use it, the better it knows you, the sharper the decisions.
- **Start as a startup.** Begin with one employee, grow departments as needs clarify.

## Interface

A chat-based website where you interact with the organization, not individual agents. The system routes your conversations to the right agents internally.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (Neon)
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local for dev, or [Neon](https://neon.tech) for prod)

### Quick Start

```bash
yarn install
yarn setup
```

This runs `scripts/setup.sh`, which:
1. Installs dependencies
2. Creates a `.env.local` file with a generated `AUTH_SECRET` (if it doesn't already exist)
3. Runs database migrations

Then update your `.env.local` with your actual `DATABASE_URL` and start the app:

```bash
yarn dev          # starts dev server at http://localhost:3000
```

### Manual Setup

If you prefer to set things up step by step:

```bash
# 1. Install dependencies
yarn install

# 2. Create .env.local with your database URL and a secret
cat > .env.local <<EOF
DATABASE_URL="postgresql://user:password@localhost:5432/community"
AUTH_SECRET="$(openssl rand -base64 32)"
EOF

# 3. Run migrations to create the database schema
yarn db:migrate

# 4. Start the dev server
yarn dev
```

### Neon (Production Database)

To set up a Neon database:

```bash
npx neonctl@latest init
```

This walks you through creating a project and gives you a connection string. Store it in `.env.prod`:

```
DATABASE_URL="postgresql://neondb_owner:...@....neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-secret-here"
```

Run migrations against Neon:

```bash
yarn db:migrate:prod
```

Run the app locally against the prod database:

```bash
env $(cat .env.prod | xargs) yarn dev
```

## Deployment

- **Hosting:** Vercel (manual deploy — auto-deploy is disabled)
- **Database:** Neon (serverless Postgres)

### Environment Variables

Set these in Vercel project settings:

| Variable       | Description                     |
|----------------|---------------------------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET`   | NextAuth secret key              |

### Workflow

1. Develop locally against a local Postgres (default `.env`)
2. To test against prod DB locally: `env $(cat .env.prod | xargs) yarn dev`
3. Run migrations on Neon: `yarn db:migrate:prod`
4. Push to `main` on GitHub
5. Deploy manually from the Vercel dashboard

### Scripts

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `yarn dev`          | Start dev server (Turbopack)         |
| `yarn build`        | Production build                     |
| `yarn db:migrate`   | Run migrations (uses `DATABASE_URL`) |
| `yarn db:migrate:prod` | Run migrations against Neon       |

## Version

See [AGENTS.md](AGENTS.md) for the current organizational chart and agent definitions.
